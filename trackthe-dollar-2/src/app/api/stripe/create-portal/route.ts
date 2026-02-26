// src/app/api/stripe/create-portal/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db/prisma";
import { createPortalSchema } from "@/lib/validations/stripe.schema";
import {
  apiSuccess,
  unauthorizedError,
  forbiddenError,
  internalError,
  parseBody,
} from "@/lib/utils/api-response";
import { APP_URL } from "@/lib/utils/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const parsed = await parseBody(req, createPortalSchema);
  if (!parsed.success) return parsed.response;

  try {
    const sub = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!sub?.stripeCustomerId) {
      return forbiddenError("No active subscription found.");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: parsed.data.returnUrl ?? `${APP_URL}/settings/billing`,
    });

    return apiSuccess({ url: portalSession.url });
  } catch (err) {
    return internalError(err, "stripe:create-portal");
  }
}
