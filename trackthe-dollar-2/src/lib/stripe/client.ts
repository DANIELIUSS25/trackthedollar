// src/lib/stripe/client.ts
import Stripe from "stripe";

/**
 * Singleton Stripe client.
 * Pinned to a specific API version — never float on "latest".
 * Lazily initialized to avoid crashes when STRIPE_SECRET_KEY is not set.
 */

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
      maxNetworkRetries: 2,
      telemetry: false,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
