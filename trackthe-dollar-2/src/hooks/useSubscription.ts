"use client";
// src/hooks/useSubscription.ts
import { useSession } from "next-auth/react";
import { getPermissions, hasMinimumTier } from "@/lib/auth/permissions";
import type { UserRole } from "@/types/user";

export function useSubscription() {
  const { data: session, status } = useSession();

  const tier: UserRole = session?.user?.subscriptionTier ?? "USER";
  const permissions = getPermissions(tier);

  return {
    tier,
    permissions,
    isLoading: status === "loading",
    isPro: hasMinimumTier(tier, "PRO"),
    isEnterprise: hasMinimumTier(tier, "ENTERPRISE"),
    isAdmin: tier === "ADMIN",
    canAccessMacro: permissions.canAccessMacro,
    canExportData: permissions.canExportData,
    canAccessAPI: permissions.canAccessAPI,
    refreshIntervalMs: permissions.refreshIntervalMs,
  };
}
