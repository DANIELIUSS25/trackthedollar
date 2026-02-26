// src/app/api/macro/fed/route.ts
import { auth } from "@/lib/auth/session";
import { getPermissions } from "@/lib/auth/permissions";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { withCache } from "@/lib/cache/withCache";
import { fetchFedMeetings, fetchMacroIndicator } from "@/lib/api/fred";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  subscriptionError,
  internalError,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const permissions = getPermissions(session.user.subscriptionTier);
  if (!permissions.canAccessMacro) return subscriptionError("Pro");

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  try {
    const ttl = parseInt(process.env.CACHE_TTL_MACRO ?? "3600", 10);

    const [meetings, fedFunds] = await Promise.all([
      withCache(
        () => fetchFedMeetings(),
        { key: "macro:fed_meetings", ttl, staleWhileRevalidate: true }
      ),
      withCache(
        () => fetchMacroIndicator("FEDFUNDS", 12),
        { key: "macro:FEDFUNDS:12", ttl, staleWhileRevalidate: true }
      ),
    ]);

    return apiSuccess(
      { meetings, currentRate: fedFunds },
      undefined,
      200,
      rateLimitHeaders(rl)
    );
  } catch (err) {
    return internalError(err, "macro:fed");
  }
}
