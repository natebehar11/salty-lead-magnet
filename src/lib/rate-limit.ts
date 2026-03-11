/**
 * In-memory sliding-window rate limiter.
 *
 * Protects against burst abuse within a single Vercel Edge instance.
 * State does NOT persist across cold starts — this is intentional.
 * For distributed rate limiting, upgrade to Vercel KV or Upstash Redis.
 */

interface RateLimitConfig {
  /** Window size in milliseconds */
  interval: number;
  /** Max requests allowed within the window */
  limit: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

interface TokenBucket {
  timestamps: number[];
}

const CLEANUP_INTERVAL_MS = 60_000;

export function rateLimit(config: RateLimitConfig) {
  const { interval, limit } = config;
  const buckets = new Map<string, TokenBucket>();
  let lastCleanup = Date.now();

  function cleanup(now: number) {
    const cutoff = now - interval;
    for (const [key, bucket] of buckets) {
      bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);
      if (bucket.timestamps.length === 0) {
        buckets.delete(key);
      }
    }
    lastCleanup = now;
  }

  function check(ip: string): RateLimitResult {
    const now = Date.now();

    // Periodic cleanup to prevent unbounded memory growth
    if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
      cleanup(now);
    }

    const cutoff = now - interval;
    let bucket = buckets.get(ip);

    if (!bucket) {
      bucket = { timestamps: [] };
      buckets.set(ip, bucket);
    }

    // Remove timestamps outside the current window
    bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);

    if (bucket.timestamps.length >= limit) {
      return { success: false, remaining: 0 };
    }

    bucket.timestamps.push(now);

    return {
      success: true,
      remaining: limit - bucket.timestamps.length,
    };
  }

  return { check };
}

// --- Route-specific rate limiters (singleton per instance) ---

const ONE_MINUTE = 60_000;

/** /api/planner/chat — 20 req/min (most expensive: Anthropic + OpenAI) */
export const plannerChatLimiter = rateLimit({ interval: ONE_MINUTE, limit: 20 });

/** /api/flights/search — 10 req/min (3 parallel SerpApi calls per search) */
export const flightsSearchLimiter = rateLimit({ interval: ONE_MINUTE, limit: 10 });

/** /api/leads/capture — 15 req/min (GoHighLevel CRM) */
export const leadCaptureLimiter = rateLimit({ interval: ONE_MINUTE, limit: 15 });
