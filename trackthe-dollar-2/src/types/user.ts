// src/types/user.ts

export type UserRole = "USER" | "PRO" | "ENTERPRISE" | "ADMIN";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface UserSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  status: SubscriptionStatus | null;
  tier: UserRole;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  emailVerified: Date | null;
  createdAt: Date;
  subscription: UserSubscription | null;
}

// Permissions derived from role
export interface TierPermissions {
  maxAlerts: number;
  maxWatchlistItems: number;
  maxPortfolios: number;
  refreshIntervalMs: number;
  canAccessMacro: boolean;
  canExportData: boolean;
  canAccessAPI: boolean;
  canSetPriceAlerts: boolean;
  canAccessHistoricalData: boolean;
  historicalRanges: string[];
}
