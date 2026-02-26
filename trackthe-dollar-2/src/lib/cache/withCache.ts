// src/lib/cache/withCache.ts
import { redisGet, redisSet } from "@/lib/redis/client";

interface CacheOptions {
  /** Key to store under in Redis */
  key: string;
  /** TTL in seconds */
  ttl: number;
  /**
   * If true, return stale data immediately while revalidating in the background.
   * Requires the runtime to support fire-and-forget (Node.js, not Edge).
   */
  staleWhileRevalidate?: boolean;
}

interface CachedEnvelope<T> {
  data: T;
  cachedAt: number; // Unix ms
}

/**
 * Wraps an async data-fetching function with Redis caching.
 *
 * @example
 * const quote = await withCache(
 *   () => fetchQuoteFromPolygon(symbol),
 *   { key: `quote:${symbol}`, ttl: 15 }
 * );
 */
export async function withCache<T>(
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const { key, ttl, staleWhileRevalidate = false } = options;

  const cached = await redisGet<CachedEnvelope<T>>(key);

  if (cached !== null) {
    const ageMs = Date.now() - cached.cachedAt;
    const isStale = ageMs > ttl * 1000;

    if (!isStale) {
      return cached.data;
    }

    if (staleWhileRevalidate) {
      // Return stale data immediately; revalidate in background
      void (async () => {
        try {
          const fresh = await fetcher();
          await redisSet(key, { data: fresh, cachedAt: Date.now() }, ttl);
        } catch {
          // Background revalidation failure — stale data continues to serve
        }
      })();
      return cached.data;
    }
  }

  // Cache miss or stale without SWR — fetch fresh
  const fresh = await fetcher();
  await redisSet(key, { data: fresh, cachedAt: Date.now() }, ttl);
  return fresh;
}
