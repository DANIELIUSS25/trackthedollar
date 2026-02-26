// src/app/api/macro/indicators/route.ts
import { auth } from "@/lib/auth/session";
import { getPermissions } from "@/lib/auth/permissions";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { withCache } from "@/lib/cache/withCache";
import { fetchMacroIndicators } from "@/lib/api/fred";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  subscriptionError,
  internalError,
} from "@/lib/utils/api-response";
import { CACHE_KEYS } from "@/lib/utils/constants";
import type { MacroIndicatorId } from "@/types/macro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_INDICATORS: MacroIndicatorId[] = [
  "FEDFUNDS",
  "CPIAUCSL",
  "UNRATE",
  "DGS10",
  "DGS2",
  "T10Y2Y",
  "T10YIE",
];

export async function GET() {
  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  // 2. Feature gate — macro data is PRO+
  const permissions = getPermissions(session.user.subscriptionTier);
  if (!permissions.canAccessMacro) {
    return subscriptionError("Pro");
  }

  // 3. Rate limit
  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  // 4. Fetch (long TTL — macro data changes infrequently)
  try {
    const ttl = parseInt(process.env.CACHE_TTL_MACRO ?? "3600", 10);

    const indicators = await withCache(
      () => fetchMacroIndicators(DEFAULT_INDICATORS),
      {
        key: "macro:indicators:default",
        ttl,
        staleWhileRevalidate: true,
      }
    );

    return apiSuccess(indicators, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, "macro:indicators");
  }
}
