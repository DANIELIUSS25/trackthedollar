// src/app/api/portfolio/[id]/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit/rateLimit";
import { db } from "@/lib/db/prisma";
import { updateHoldingSchema } from "@/lib/validations/portfolio.schema";
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

async function getOwnedHolding(holdingId: string, userId: string) {
  return db.holding.findFirst({
    where: {
      id: holdingId,
      portfolio: { userId },
    },
    include: { portfolio: { select: { userId: true } } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const rl = await checkRateLimit(session.user.id, session.user.subscriptionTier);
  if (!rl.success) return rateLimitError(rateLimitHeaders(rl));

  const holding = await getOwnedHolding(params.id, session.user.id);
  if (!holding) return notFoundError("Holding");
  if (holding.portfolio.userId !== session.user.id) return forbiddenError();

  const parsed = await parseBody(req, updateHoldingSchema);
  if (!parsed.success) return parsed.response;

  try {
    const updated = await db.holding.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.quantity !== undefined && { quantity: parsed.data.quantity }),
        ...(parsed.data.avgCostBasis !== undefined && { avgCostBasis: parsed.data.avgCostBasis }),
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      },
    });

    return apiSuccess(updated, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, `holding:PATCH:${params.id}`);
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

  const holding = await getOwnedHolding(params.id, session.user.id);
  if (!holding) return notFoundError("Holding");
  if (holding.portfolio.userId !== session.user.id) return forbiddenError();

  try {
    await db.holding.delete({ where: { id: params.id } });
    return apiSuccess({ deleted: true }, undefined, 200, rateLimitHeaders(rl));
  } catch (err) {
    return internalError(err, `holding:DELETE:${params.id}`);
  }
}
