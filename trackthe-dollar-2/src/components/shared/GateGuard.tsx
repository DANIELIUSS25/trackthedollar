"use client";
// src/components/shared/GateGuard.tsx
import type { UserRole } from "@/types/user";
import { hasMinimumTier } from "@/lib/auth/permissions";

interface GateGuardProps {
  userTier: UserRole;
  requiredTier: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side feature gate. Renders children only if the user meets the tier.
 * NOTE: This is UI-only gating for UX purposes.
 * Real enforcement always happens in the API route handlers.
 */
export function GateGuard({ userTier, requiredTier, children, fallback = null }: GateGuardProps) {
  if (!hasMinimumTier(userTier, requiredTier)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
