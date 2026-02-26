// src/lib/auth/permissions.ts
import type { UserRole, TierPermissions } from "@/types/user";

/**
 * Single source of truth for all feature gates.
 * Every permission check in API routes and UI components derives from here.
 * NEVER duplicate these values in client-side code — import from constants.ts
 * only for display; enforcement always lives server-side.
 */
export const TIER_PERMISSIONS: Record<UserRole, TierPermissions> = {
  USER: {
    maxAlerts: 3,
    maxWatchlistItems: 10,
    maxPortfolios: 1,
    refreshIntervalMs: 60_000,
    canAccessMacro: false,
    canExportData: false,
    canAccessAPI: false,
    canSetPriceAlerts: true,
    canAccessHistoricalData: true,
    historicalRanges: ["1D", "5D", "1M"],
  },
  PRO: {
    maxAlerts: 50,
    maxWatchlistItems: 200,
    maxPortfolios: 10,
    refreshIntervalMs: 15_000,
    canAccessMacro: true,
    canExportData: true,
    canAccessAPI: false,
    canSetPriceAlerts: true,
    canAccessHistoricalData: true,
    historicalRanges: ["1D", "5D", "1M", "3M", "6M", "1Y"],
  },
  ENTERPRISE: {
    maxAlerts: 500,
    maxWatchlistItems: 2000,
    maxPortfolios: 100,
    refreshIntervalMs: 5_000,
    canAccessMacro: true,
    canExportData: true,
    canAccessAPI: true,
    canSetPriceAlerts: true,
    canAccessHistoricalData: true,
    historicalRanges: ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"],
  },
  ADMIN: {
    maxAlerts: Infinity,
    maxWatchlistItems: Infinity,
    maxPortfolios: Infinity,
    refreshIntervalMs: 5_000,
    canAccessMacro: true,
    canExportData: true,
    canAccessAPI: true,
    canSetPriceAlerts: true,
    canAccessHistoricalData: true,
    historicalRanges: ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"],
  },
};

/**
 * Returns the effective permissions for a user.
 * Falls back to USER tier if role is unrecognised.
 */
export function getPermissions(role: UserRole): TierPermissions {
  return TIER_PERMISSIONS[role] ?? TIER_PERMISSIONS.USER;
}

/**
 * Returns true if `role` meets or exceeds `required`.
 * Tier order: USER < PRO < ENTERPRISE < ADMIN
 */
const TIER_ORDER: UserRole[] = ["USER", "PRO", "ENTERPRISE", "ADMIN"];

export function hasMinimumTier(role: UserRole, required: UserRole): boolean {
  return TIER_ORDER.indexOf(role) >= TIER_ORDER.indexOf(required);
}

/**
 * Returns the admin email list from environment.
 * Used to bootstrap ADMIN role on first sign-in.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
