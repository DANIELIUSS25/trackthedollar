// src/lib/rate-limit/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis/client";
import type { UserRole } from "@/types/user";

/**
 * Per-tier sliding window rate limiters.
 * Window: 60 seconds. Requests per window defined by env vars.
 */
const limiters: Record<UserRole, Ratelimit> = {
  USER: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_MAX_FREE ?? "30", 10),
      "60 s"
    ),
    prefix: "rl:free",
    analytics: false,
  }),
  PRO: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_MAX_PRO ?? "200", 10),
      "60 s"
    ),
    prefix: "rl:pro",
    analytics: false,
  }),
  ENTERPRISE: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_MAX_ENTERPRISE ?? "2000", 10),
      "60 s"
    ),
    prefix: "rl:enterprise",
    analytics: false,
  }),
  ADMIN: new Ratelimit({
    redis,
    // Admins get a very high limit — not unlimited to prevent runaway scripts
    limiter: Ratelimit.slidingWindow(10_000, "60 s"),
    prefix: "rl:admin",
    analytics: false,
  }),
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp (ms)
}

/**
 * Check rate limit for a given identifier (userId or IP) at a given tier.
 *
 * @param identifier - userId for authenticated requests, IP for anonymous
 * @param tier       - subscription tier
 */
export async function checkRateLimit(
  identifier: string,
  tier: UserRole = "USER"
): Promise<RateLimitResult> {
  const limiter = limiters[tier];
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Returns standard rate limit headers to attach to responses.
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": result.success
      ? "0"
      : String(Math.ceil((result.reset - Date.now()) / 1000)),
  };
}
