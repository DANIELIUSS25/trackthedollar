// src/app/api/checkout/route.ts
// Simple Stripe Checkout — no auth required. Collects email at Stripe.
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { getPlans } from "@/lib/stripe/plans";
import { APP_URL } from "@/lib/utils/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const { planId } = await req.json();
    const plans = getPlans();
    const plan = plans.find((p) => p.id === planId);

    if (!plan || !plan.stripePriceId) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${APP_URL}/pricing?success=1`,
      cancel_url: `${APP_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/checkout]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
