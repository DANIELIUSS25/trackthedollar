// src/app/api/ai/narrative/route.ts
// GET /api/ai/narrative — Daily narrative summary
// Uses Perplexity to generate a web-grounded narrative combining
// internal data with current news context.

import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { withCache } from "@/lib/cache/withCache";
import { generateDailyNarrative } from "@/lib/ai/features";
import { evaluateContent, getPublicationAction } from "@/lib/ai/evaluation";
import { apiSuccess, unauthorizedError, rateLimitError, internalError } from "@/lib/utils/api-response";
import type { DataContext } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  try {
    // Check cache first (1 hour TTL)
    const cached = await withCache(
      async () => null as null,
      { key: "ttd:api:ai:narrative:latest", ttl: 3600, staleWhileRevalidate: true }
    );

    if (cached !== null) {
      return apiSuccess(cached);
    }

    // Build data context from latest snapshot
    const dataContext: DataContext = await fetchLatestDataContext();

    // Generate narrative
    const result = await generateDailyNarrative(dataContext);

    // Evaluate quality
    const evalResult = evaluateContent(result, dataContext);
    const action = getPublicationAction(evalResult);

    if (action === "reject") {
      return apiSuccess({
        content: "",
        available: false,
        reason: "Content did not pass quality checks",
      });
    }

    const response = {
      content: result.content,
      citations: result.citations,
      confidence: result.confidence,
      generatedAt: result.generatedAt,
      disclaimer: result.disclaimer,
      warnings: result.warnings,
      evalScore: evalResult.score,
      fromCache: result.fromCache,
    };

    // Cache for future requests
    await withCache(async () => response, {
      key: "ttd:api:ai:narrative:latest",
      ttl: 3600,
    });

    return apiSuccess(response);
  } catch (err) {
    return internalError(err, "ai/narrative");
  }
}

/**
 * Fetch the latest data context from internal sources.
 * TODO: Replace with direct Prisma query to DailySnapshot table.
 */
async function fetchLatestDataContext(): Promise<DataContext> {
  return {
    date: new Date().toISOString().split("T")[0],
    totalDebt: 36_218_000_000_000,
    debtChange: 4_700_000_000,
    fedBalanceSheet: 6_820_000_000_000,
    tgaBalance: 782_000_000_000,
    rrpBalance: 147_000_000_000,
    netLiquidity: 5_891_000_000_000,
    fedFundsRate: 4.33,
    dgs10: 4.32,
    dgs2: 4.15,
    yieldCurveSpread: 0.17,
    m2: 21_670_000_000_000,
    cpi: 2.8,
    fiscalYtdDeficit: -1_830_000_000_000,
    interestExpense: 1_120_000_000_000,
  };
}
