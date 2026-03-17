// src/lib/stripe/plans.ts

/**
 * Plan definitions for TrackTheDollar.
 * Two tiers: Free (no payment) and Pro ($1.99/mo).
 *
 * Setup in Stripe Dashboard:
 * 1. Go to https://dashboard.stripe.com/products → "Add product"
 * 2. Name: "TrackTheDollar Pro"
 * 3. Add a recurring price: $1.99/month
 * 4. Copy the price ID (e.g. price_1Qx...) and set it as
 *    STRIPE_PRO_PRICE_ID in your Netlify environment variables
 */

export interface PlanFeature {
  text: string;
  available: boolean;
}

export interface PlanConfig {
  id: string;
  name: string;
  price: string;           // display string
  priceCents: number;      // cents for Stripe
  stripePriceId: string;   // from Stripe Dashboard
  description: string;
  features: PlanFeature[];
  highlighted: boolean;
}

export function getPlans(): PlanConfig[] {
  return [
    {
      id: "free",
      name: "Free",
      price: "$0",
      priceCents: 0,
      stripePriceId: "",
      description: "Core macro intelligence — free forever",
      highlighted: false,
      features: [
        { text: "All 12 live dashboards", available: true },
        { text: "7 government data sources", available: true },
        { text: "National debt real-time tracker", available: true },
        { text: "Basic charts & time series", available: true },
        { text: "1-year historical data", available: true },
        { text: "Data refreshed every 5 minutes", available: true },
        { text: "Ad-supported", available: true },
        { text: "Real-time 60s refresh", available: false },
        { text: "Full 5+ year history", available: false },
        { text: "Custom alerts", available: false },
        { text: "CSV/JSON data export", available: false },
        { text: "Ad-free experience", available: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$1.99",
      priceCents: 199,
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
      description: "Full macro intelligence suite",
      highlighted: true,
      features: [
        { text: "Everything in Free", available: true },
        { text: "Real-time data (60s refresh)", available: true },
        { text: "Full historical data (5+ years)", available: true },
        { text: "Custom price & threshold alerts", available: true },
        { text: "CSV/JSON data export", available: true },
        { text: "Ad-free experience", available: true },
        { text: "Priority data delivery", available: true },
        { text: "Email alert notifications", available: true },
        { text: "Derived proxy analytics", available: true },
        { text: "Support the project", available: true },
      ],
    },
  ];
}

/**
 * Map a Stripe Price ID back to a tier.
 * Used in webhook handler to provision the correct tier.
 */
export function getTierFromPriceId(priceId: string): "PRO" | null {
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (proPriceId && priceId === proPriceId) return "PRO";
  return null;
}
