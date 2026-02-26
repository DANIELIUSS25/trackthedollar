// src/lib/redis/client.ts
import { Redis } from "@upstash/redis";

/**
 * Singleton Upstash Redis client.
 * Uses REST API — works in Edge runtime and serverless.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Typed get helper — returns null on miss, throws only on connection error.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch (err) {
    // Log but don't crash the request — cache miss is acceptable
    console.error(`[redis] GET error for key "${key}":`, err);
    return null;
  }
}

/**
 * Set with optional TTL (seconds).
 */
export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
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
 * Delete one or more keys.
 */
export async function redisDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    console.error(`[redis] DEL error:`, err);
  }
}
