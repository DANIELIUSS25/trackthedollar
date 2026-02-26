// src/app/api/market/quote/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { withCache } from "@/lib/cache/withCache";
import { fetchQuote, fetchQuoteAV } from "@/lib/api/market";
import { quoteQuerySchema } from "@/lib/validations/market.schema";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  internalError,
  parseSearchParams,
} from "@/lib/utils/api-response";
import { CACHE_KEYS } from "@/lib/utils/constants";
import type { Quote } from "@/types/market";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  // 2. Rate limit — keyed by userId, tiered by subscription
  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  // 3. Validate query params
  const parsed = parseSearchParams(req.nextUrl.searchParams, quoteQuerySchema);
  if (!parsed.success) return parsed.response;
  const { symbol } = parsed.data;

  // 4. Fetch with Redis cache
  try {
    const ttl = parseInt(process.env.CACHE_TTL_QUOTE ?? "15", 10);
    const quote = await withCache<Quote>(
      async () => {
        try {
          return await fetchQuote(symbol);
        } catch {
          // Fallback to Alpha Vantage if Polygon fails
          return await fetchQuoteAV(symbol);
        }
      },
      {
        key: CACHE_KEYS.quote(symbol),
        ttl,
        staleWhileRevalidate: true,
      }
    );

    return apiSuccess(quote, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, `quote:${symbol}`);
  }
}
