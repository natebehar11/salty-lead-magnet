/**
 * Flight search result cache backed by Upstash Redis.
 *
 * Reduces SerpApi credit consumption by caching results per route+date.
 * Gracefully degrades to no-cache when Redis is not configured
 * (missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN env vars).
 *
 * TTL: 1 hour — flight prices don't change minute-to-minute.
 */

import type { SerpApiSearchResult } from './serpapi';

const CACHE_TTL_SECONDS = 3600; // 1 hour
const KEY_PREFIX = 'flight';

/**
 * Build a deterministic cache key for a flight search.
 * Pattern: flight:{origin}:{dest}:{date}:{returnDate|ow}
 */
export function buildCacheKey(
  originCode: string,
  destCode: string,
  date: string,
  returnDate?: string,
): string {
  return `${KEY_PREFIX}:${originCode}:${destCode}:${date}:${returnDate || 'ow'}`;
}

// ---------------------------------------------------------------------------
// Lazy-initialized Redis client (avoids import errors when env vars missing)
// ---------------------------------------------------------------------------

// Use the actual Redis type from @upstash/redis
type UpstashRedis = import('@upstash/redis').Redis;

// Singleton promise — assigned synchronously on first call so concurrent
// requests all await the same initialization. Eliminates the race condition
// where two requests both see "not yet initialized" and create two clients.
let redisPromise: Promise<UpstashRedis | null> | null = null;

function getRedis(): Promise<UpstashRedis | null> {
  if (redisPromise) return redisPromise;

  redisPromise = (async (): Promise<UpstashRedis | null> => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      // No Redis configured — silently degrade to no-cache
      return null;
    }

    try {
      const { Redis } = await import('@upstash/redis');
      return new Redis({ url, token });
    } catch (err) {
      console.warn('[flight-cache] Failed to initialize Redis client:', err);
      return null;
    }
  })();

  return redisPromise;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get cached flight search results for a route+date combo.
 * Returns null on cache miss or if Redis is unavailable.
 */
export async function getCachedFlights(
  originCode: string,
  destCode: string,
  date: string,
  returnDate?: string,
): Promise<SerpApiSearchResult | null> {
  const client = await getRedis();
  if (!client) return null;

  const key = buildCacheKey(originCode, destCode, date, returnDate);

  try {
    const cached = await client.get<SerpApiSearchResult>(key);
    if (cached) {
      console.log(`[flight-cache] HIT ${key}`);
      return cached;
    }
    console.log(`[flight-cache] MISS ${key}`);
    return null;
  } catch (err) {
    console.warn(`[flight-cache] GET error for ${key}:`, err);
    return null;
  }
}

/**
 * Cache flight search results for a route+date combo.
 * Silently fails if Redis is unavailable.
 */
export async function cacheFlights(
  originCode: string,
  destCode: string,
  date: string,
  result: SerpApiSearchResult,
  returnDate?: string,
): Promise<void> {
  // Don't cache empty results — they might be transient errors
  if (result.flights.length === 0) return;

  const client = await getRedis();
  if (!client) return;

  const key = buildCacheKey(originCode, destCode, date, returnDate);

  try {
    await client.set(key, result, { ex: CACHE_TTL_SECONDS });
    console.log(`[flight-cache] SET ${key} (${result.flights.length} flights, TTL ${CACHE_TTL_SECONDS}s)`);
  } catch (err) {
    console.warn(`[flight-cache] SET error for ${key}:`, err);
  }
}
