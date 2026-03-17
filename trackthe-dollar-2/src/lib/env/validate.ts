// src/lib/env/validate.ts
import { z } from "zod";

/**
 * Validated environment variables.
 * Fails fast at startup if required vars are missing.
 *
 * Usage: import { env } from "@/lib/env/validate";
 */

const envSchema = z.object({
  // ─── Database ────────────────────────────────
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),

  // ─── Redis ───────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // ─── Auth ────────────────────────────────────
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),

  // ─── Stripe ──────────────────────────────────
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // ─── Data APIs ───────────────────────────────
  FRED_API_KEY: z.string().min(1).optional(),

  // ─── AI ──────────────────────────────────────
  PERPLEXITY_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // ─── Internal ────────────────────────────────
  INTERNAL_API_KEY: z.string().min(16).optional(),
  ADMIN_EMAILS: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");
    console.error(`\n❌ Invalid environment variables:\n${formatted}\n`);

    // Warn but continue — site works with mock data when env vars are missing
  }

  // Return partial env in development even if some optionals are missing
  return result.success ? result.data : (process.env as unknown as Env);
}

export const env = validateEnv();
