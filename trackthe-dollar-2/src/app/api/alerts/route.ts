// src/app/api/alerts/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { getPermissions } from "@/lib/auth/permissions";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { db } from "@/lib/db/prisma";
import { createAlertSchema } from "@/lib/validations/alert.schema";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  forbiddenError,
  internalError,
  parseBody,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  try {
    const alerts = await db.priceAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(alerts, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, "alerts:GET");
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  const parsed = await parseBody(req, createAlertSchema);
  if (!parsed.success) return parsed.response;

  try {
    // Enforce per-tier alert limit (server-side only — never trust client)
    const permissions = getPermissions(session.user.subscriptionTier);
    const activeCount = await db.priceAlert.count({
      where: { userId: session.user.id, status: "active" },
    });

    if (activeCount >= permissions.maxAlerts) {
      return forbiddenError(
        `Your plan allows a maximum of ${permissions.maxAlerts} active alerts. Upgrade to create more.`
      );
    }

    const alert = await db.priceAlert.create({
      data: {
        userId: session.user.id,
        symbol: parsed.data.symbol,
        name: parsed.data.symbol,
        condition: parsed.data.condition,
        targetValue: parsed.data.targetValue,
        notifyVia: parsed.data.notifyVia,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    return apiSuccess(alert, undefined, 201, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, "alerts:POST");
  }
}
