// src/app/api/market/history/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { getPermissions } from "@/lib/auth/permissions";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { withCache } from "@/lib/cache/withCache";
import { fetchHistoricalData } from "@/lib/api/market";
import { historyQuerySchema } from "@/lib/validations/market.schema";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  subscriptionError,
  internalError,
  parseSearchParams,
} from "@/lib/utils/api-response";
import { CACHE_KEYS } from "@/lib/utils/constants";
import type { HistoricalData, TimeRange } from "@/types/market";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  // 2. Rate limit
  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  // 3. Validate
  const parsed = parseSearchParams(req.nextUrl.searchParams, historyQuerySchema);
  if (!parsed.success) return parsed.response;
  const { symbol, range } = parsed.data;

  // 4. Tier gate — enforce allowed ranges server-side
  const permissions = getPermissions(session.user.subscriptionTier);
  if (!permissions.historicalRanges.includes(range)) {
    const minTier = ["3M", "6M", "1Y"].includes(range) ? "PRO" : "ENTERPRISE";
    return subscriptionError(minTier);
  }

  // 5. Fetch with cache
  try {
    const ttl = parseInt(process.env.CACHE_TTL_HISTORY ?? "300", 10);
    const data = await withCache<HistoricalData>(
      () => fetchHistoricalData(symbol, range as TimeRange),
      {
        key: CACHE_KEYS.history(symbol, range),
        ttl,
        staleWhileRevalidate: false,
      }
    );

    return apiSuccess(data, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, `history:${symbol}:${range}`);
  }
}
