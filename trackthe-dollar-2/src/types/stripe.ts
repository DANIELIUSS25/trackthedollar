// src/types/stripe.ts

import type { UserRole } from "./user";

export interface PlanFeature {
  text: string;
  available: boolean;
}

export interface Plan {
  id: string;
  tier: UserRole;
  name: string;
  description: string;
  monthlyPriceId: string;
  annualPriceId: string;
  monthlyPrice: number; // USD cents
  annualPrice: number; // USD cents
  features: PlanFeature[];
  limits: {
    alerts: number;
    watchlistItems: number;
    portfolios: number;
    refreshIntervalSeconds: number;
  };
  highlighted: boolean;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}
