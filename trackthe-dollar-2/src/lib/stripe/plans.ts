// src/lib/stripe/plans.ts
import type { Plan } from "@/types/stripe";

/**
 * Plan definitions.
 * Price IDs come from env vars — never hardcode them here.
 * Monthly prices are in USD cents.
 */
export function getPlans(): Plan[] {
  return [
    {
      id: "free",
      tier: "USER",
      name: "Free",
      description: "Core market data for casual investors.",
      monthlyPriceId: "",
      annualPriceId: "",
      monthlyPrice: 0,
      annualPrice: 0,
      highlighted: false,
      limits: {
        alerts: 3,
        watchlistItems: 10,
        portfolios: 1,
        refreshIntervalSeconds: 60,
      },
      features: [
        { text: "Real-time quotes (1-min delay)", available: true },
        { text: "10-symbol watchlist", available: true },
        { text: "1 portfolio", available: true },
        { text: "3 price alerts", available: true },
        { text: "1M historical data", available: true },
        { text: "Macro & Fed indicators", available: false },
        { text: "Data export (CSV)", available: false },
        { text: "API access", available: false },
      ],
    },
    {
      id: "pro",
      tier: "PRO",
      name: "Pro",
      description: "For active traders who need speed and depth.",
      monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
      annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
      monthlyPrice: 199, // $1.99/mo
      annualPrice: 1990, // $19.90/yr (save 17%)
      highlighted: true,
      limits: {
        alerts: 50,
        watchlistItems: 200,
        portfolios: 10,
        refreshIntervalSeconds: 15,
      },
      features: [
        { text: "Real-time quotes (15s refresh)", available: true },
        { text: "200-symbol watchlist", available: true },
        { text: "10 portfolios", available: true },
        { text: "50 price alerts", available: true },
        { text: "1Y historical data", available: true },
        { text: "Macro & Fed indicators", available: true },
        { text: "Data export (CSV)", available: true },
        { text: "API access", available: false },
      ],
    },
    {
      id: "enterprise",
      tier: "ENTERPRISE",
      name: "Enterprise",
      description: "For funds and teams that need full access.",
      monthlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
      annualPriceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? "",
      monthlyPrice: 9900, // $99/mo
      annualPrice: 95040, // $950.40/yr (20% off)
      highlighted: false,
      limits: {
        alerts: 500,
        watchlistItems: 2000,
        portfolios: 100,
        refreshIntervalSeconds: 5,
      },
      features: [
        { text: "Real-time quotes (5s refresh)", available: true },
        { text: "2000-symbol watchlist", available: true },
        { text: "100 portfolios", available: true },
        { text: "500 price alerts", available: true },
        { text: "5Y historical data", available: true },
        { text: "Macro & Fed indicators", available: true },
        { text: "Data export (CSV + JSON)", available: true },
        { text: "REST API access", available: true },
      ],
    },
  ];
}

/**
 * Map a Stripe Price ID back to a UserRole tier.
 * Used in webhook handler to provision the correct tier.
 */
export function getTierFromPriceId(priceId: string): "PRO" | "ENTERPRISE" | null {
  const proPriceIds = [
    process.env.STRIPE_PRICE_PRO_MONTHLY,
    process.env.STRIPE_PRICE_PRO_ANNUAL,
  ].filter(Boolean);

  const enterprisePriceIds = [
    process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
  ].filter(Boolean);

  if (proPriceIds.includes(priceId)) return "PRO";
  if (enterprisePriceIds.includes(priceId)) return "ENTERPRISE";
  return null;
}
