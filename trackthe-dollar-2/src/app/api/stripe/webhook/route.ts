// src/app/api/stripe/webhook/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { getTierFromPriceId } from "@/lib/stripe/plans";
import { db } from "@/lib/db/prisma";
import type Stripe from "stripe";

export const runtime = "nodejs";
// CRITICAL: disable body parsing — Stripe signature verification requires the raw body
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[stripe/webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== "subscription") break;

        const userId = checkoutSession.subscription_data?.metadata?.userId
          ?? (checkoutSession.metadata?.userId as string | undefined);

        if (!userId) {
          console.error("[stripe/webhook] checkout.session.completed: no userId in metadata");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        );

        await provisionSubscription(userId, subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await getUserIdFromCustomer(subscription.customer as string);
        if (userId) await provisionSubscription(userId, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await getUserIdFromCustomer(subscription.customer as string);

        if (userId) {
          await db.subscription.update({
            where: { userId },
            data: {
              status: "canceled",
              tier: "USER",
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          });

          await db.user.update({
            where: { id: userId },
            data: { role: "USER" },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await getUserIdFromCustomer(invoice.customer as string);

        if (userId) {
          await db.subscription.update({
            where: { userId },
            data: { status: "past_due" },
          });
        }
        break;
      }

      default:
        // Unhandled event type — not an error
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] Handler error:", err);
    // Return 200 to prevent Stripe retries for application-level errors
    return NextResponse.json({ received: true, warning: "Handler error logged" });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const sub = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  return sub?.userId ?? null;
}

async function provisionSubscription(
  userId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const tier = priceId ? (getTierFromPriceId(priceId) ?? "USER") : "USER";

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await db.$transaction([
    db.subscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEnd,
        status: subscription.status as string,
        tier,
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { role: tier },
    }),
  ]);
}
