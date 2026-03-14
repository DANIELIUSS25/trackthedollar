// src/app/api/ai/ask/route.ts
// POST /api/ai/ask — Answer user questions about the dollar system
// Requires PRO+ subscription. Combines platform data with web search.

import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { redisGet, redisSet } from "@/lib/redis/client";
import { answerUserQuestion } from "@/lib/ai/features";
import { evaluateContent, getPublicationAction } from "@/lib/ai/evaluation";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  forbiddenError,
  validationError,
  internalError,
} from "@/lib/utils/api-response";
import { getPermissions } from "@/lib/auth/permissions";
import { z } from "zod";
import type { DataContext } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const askSchema = z.object({
  question: z.string().min(5).max(500),
});

const DAILY_QA_LIMIT = 20;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const userId = session.user.id;

  // Feature gate: PRO+ only
  const perms = getPermissions(session.user.subscriptionTier);
  if (!perms.canAccessMacro) {
    return forbiddenError("AI Q&A requires a Pro or Enterprise subscription.");
  }

  const rl = await checkRateLimit(userId, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  // Per-user daily Q&A limit
  const dailyKey = `ttd:ai:qa:daily:${userId}`;
  const dailyCount = (await redisGet<number>(dailyKey)) ?? 0;
  if (dailyCount >= DAILY_QA_LIMIT) {
    return forbiddenError(`Daily question limit reached (${DAILY_QA_LIMIT}/day). Resets at midnight UTC.`);
  }

  try {
    const body = await req.json();
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { question } = parsed.data;

    // Build data context from latest internal data
    // TODO: Replace with DailySnapshot query
    const dataContext: DataContext = {
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
    };

    const result = await answerUserQuestion(question, dataContext, userId);

    const evalResult = evaluateContent(result, dataContext);
    const action = getPublicationAction(evalResult);

    if (action === "reject") {
      return apiSuccess({
        answer: "I wasn't able to generate a reliable answer for this question. Please try rephrasing.",
        citations: [],
        confidence: "none",
        disclaimer: "Unable to generate a confident response.",
      });
    }

    // Increment daily counter
    const now = new Date();
    const secondsUntilMidnight = (24 - now.getUTCHours()) * 3600 - now.getUTCMinutes() * 60;
    await redisSet(dailyKey, dailyCount + 1, Math.max(secondsUntilMidnight, 60));

    return apiSuccess({
      answer: result.content,
      citations: result.citations,
      confidence: result.confidence,
      generatedAt: result.generatedAt,
      disclaimer: result.disclaimer,
      warnings: result.warnings,
      remainingQuestions: DAILY_QA_LIMIT - dailyCount - 1,
    });
  } catch (err) {
    return internalError(err, "ai/ask");
  }
}
