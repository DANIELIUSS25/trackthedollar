// src/app/api/market/search/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { withCache } from "@/lib/cache/withCache";
import { searchSymbols } from "@/lib/api/market";
import { searchQuerySchema } from "@/lib/validations/market.schema";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  internalError,
  parseSearchParams,
} from "@/lib/utils/api-response";
import { CACHE_KEYS } from "@/lib/utils/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  const parsed = parseSearchParams(req.nextUrl.searchParams, searchQuerySchema);
  if (!parsed.success) return parsed.response;
  const { q } = parsed.data;

  try {
    const ttl = parseInt(process.env.CACHE_TTL_SEARCH ?? "600", 10);
    const results = await withCache(
      () => searchSymbols(q),
      { key: CACHE_KEYS.search(q), ttl }
    );

    return apiSuccess(results, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, `search:${q}`);
  }
}
