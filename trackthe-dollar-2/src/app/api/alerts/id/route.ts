// src/app/api/alerts/[id]/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { db } from "@/lib/db/prisma";
import { updateAlertSchema } from "@/lib/validations/alert.schema";
import {
  apiSuccess,
  unauthorizedError,
  rateLimitError,
  forbiddenError,
  notFoundError,
  internalError,
  parseBody,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  const alert = await db.priceAlert.findUnique({ where: { id: params.id } });
  if (!alert) return notFoundError("Alert");
  if (alert.userId !== session.user.id) return forbiddenError();

  const parsed = await parseBody(req, updateAlertSchema);
  if (!parsed.success) return parsed.response;

  try {
    const updated = await db.priceAlert.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.condition && { condition: parsed.data.condition }),
        ...(parsed.data.targetValue !== undefined && { targetValue: parsed.data.targetValue }),
        ...(parsed.data.notifyVia && { notifyVia: parsed.data.notifyVia }),
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.expiresAt !== undefined && {
          expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        }),
      },
    });

    return apiSuccess(updated, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, `alert:PATCH:${params.id}`);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  const alert = await db.priceAlert.findUnique({ where: { id: params.id } });
  if (!alert) return notFoundError("Alert");
  if (alert.userId !== session.user.id) return forbiddenError();

  try {
    await db.priceAlert.delete({ where: { id: params.id } });
    return apiSuccess({ deleted: true }, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, `alert:DELETE:${params.id}`);
  }
}
