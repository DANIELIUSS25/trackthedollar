// src/app/api/market/movers/route.ts
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { withCache } from "@/lib/cache/withCache";
import { fetchMarketMovers } from "@/lib/api/market";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  internalError,
} from "@/lib/utils/api-response";
import { CACHE_KEYS } from "@/lib/utils/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  try {
    const ttl = parseInt(process.env.CACHE_TTL_MOVERS ?? "60", 10);
    const movers = await withCache(
      () => fetchMarketMovers(),
      { key: CACHE_KEYS.movers(), ttl, staleWhileRevalidate: true }
    );

    return apiSuccess(movers, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, "movers");
  }
}
