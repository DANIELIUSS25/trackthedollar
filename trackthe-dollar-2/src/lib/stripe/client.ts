// src/lib/stripe/client.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

/**
 * Singleton Stripe client.
 * Pinned to a specific API version — never float on "latest".
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
  maxNetworkRetries: 2,
  telemetry: false, // Don't send usage telemetry to Stripe
});
