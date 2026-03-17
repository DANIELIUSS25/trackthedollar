// src/app/api/stripe/create-checkout/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe/client";
import { getPlans, getTierFromPriceId } from "@/lib/stripe/plans";
import { db } from "@/lib/db/prisma";
import { createCheckoutSchema } from "@/lib/validations/stripe.schema";
import {
  apiSuccess,
  unauthorizedError,
  forbiddenError,
  internalError,
  parseBody,
  apiError,
} from "@/lib/utils/api-response";
import { APP_URL } from "@/lib/utils/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();

  const parsed = await parseBody(req, createCheckoutSchema);
  if (!parsed.success) return parsed.response;
  const { priceId } = parsed.data;

  // Validate that the priceId belongs to a known plan — prevent arbitrary price injection
  const plans = getPlans();
  const validPriceIds = plans
    .map((p) => p.stripePriceId)
    .filter(Boolean);

  if (!validPriceIds.includes(priceId)) {
    return apiError("INVALID_PRICE", "Invalid plan selection.", 400);
  }

  // Prevent downgrade via checkout (must use portal for that)
  const targetTier = getTierFromPriceId(priceId);
  if (!targetTier) {
    return apiError("INVALID_PRICE", "Unrecognised price ID.", 400);
  }

  const tierOrder = ["USER", "PRO", "ENTERPRISE", "ADMIN"] as const;
  const currentIdx = tierOrder.indexOf(session.user.subscriptionTier);
  const targetIdx = tierOrder.indexOf(targetTier);

  if (targetIdx <= currentIdx && session.user.subscriptionTier !== "USER") {
    return forbiddenError("Use the billing portal to change or cancel your subscription.");
  }

  try {
    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;
    const sub = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (sub?.stripeCustomerId) {
      stripeCustomerId = sub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        ...(session.user.email ? { email: session.user.email } : {}),
        ...(session.user.name ? { name: session.user.name } : {}),
        metadata: { userId: session.user.id },
      });
      stripeCustomerId = customer.id;

      await db.subscription.update({
        where: { userId: session.user.id },
        data: { stripeCustomerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/settings/billing?success=1`,
      cancel_url: `${APP_URL}/upgrade?canceled=1`,
      subscription_data: {
        metadata: { userId: session.user.id },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!checkoutSession.url) {
      return internalError(new Error("Stripe returned no checkout URL"), "stripe:checkout");
    }

    return apiSuccess({ url: checkoutSession.url });
  } catch (err) {
    return internalError(err, "stripe:create-checkout");
  }
}
