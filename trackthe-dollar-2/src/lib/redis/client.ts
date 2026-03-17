// src/lib/redis/client.ts
import { Redis } from "@upstash/redis";

/**
 * Singleton Upstash Redis client.
 * Returns a no-op stub when UPSTASH_REDIS_REST_URL is not configured so the
 * app boots without Redis (API routes skip caching and fall back to live data).
 */

const isConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Only construct the real Redis client when credentials are present.
// The Upstash SDK validates the URL with Zod at construction time and throws
// "The string did not match the expected pattern" when url is undefined.
export const redis: Redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : (new Proxy(
      {},
      {
        get(_, prop) {
          if (prop === "ping") return async () => "PONG";
          return async () => null;
        },
      }
    ) as unknown as Redis);

/**
 * Typed get helper — returns null on miss or when Redis is not configured.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  if (!isConfigured) return null;
  try {
    return await redis.get<T>(key);
  } catch (err) {
    console.error(`[redis] GET error for key "${key}":`, err);
    return null;
  }
}

/**
 * Set with optional TTL (seconds). No-op when Redis is not configured.
 */
export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  if (!isConfigured) return;
  try {
    if (ttlSeconds !== undefined) {
      await redis.set(key, value, { ex: ttlSeconds });
    } else {
      await redis.set(key, value);
    }
  } catch (err) {
    console.error(`[redis] SET error for key "${key}":`, err);
  }
}

/**
 * Delete one or more keys. No-op when Redis is not configured.
 */
export async function redisDel(...keys: string[]): Promise<void> {
  if (!isConfigured) return;
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    console.error(`[redis] DEL error:`, err);
  }
}
