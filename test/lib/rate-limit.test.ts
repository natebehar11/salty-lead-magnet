import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the limit', () => {
    const limiter = rateLimit({ interval: 60_000, limit: 5 });
    const result = limiter.check('192.168.1.1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('decrements remaining count with each request', () => {
    const limiter = rateLimit({ interval: 60_000, limit: 3 });
    expect(limiter.check('10.0.0.1').remaining).toBe(2);
    expect(limiter.check('10.0.0.1').remaining).toBe(1);
    expect(limiter.check('10.0.0.1').remaining).toBe(0);
  });

  it('blocks requests at the limit', () => {
    const limiter = rateLimit({ interval: 60_000, limit: 2 });
    limiter.check('10.0.0.1');
    limiter.check('10.0.0.1');
    const result = limiter.check('10.0.0.1');
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks different IPs independently', () => {
    const limiter = rateLimit({ interval: 60_000, limit: 1 });
    expect(limiter.check('10.0.0.1').success).toBe(true);
    expect(limiter.check('10.0.0.2').success).toBe(true);
    expect(limiter.check('10.0.0.1').success).toBe(false);
    expect(limiter.check('10.0.0.2').success).toBe(false);
  });

  it('resets after the interval elapses', () => {
    const limiter = rateLimit({ interval: 60_000, limit: 2 });
    limiter.check('10.0.0.1');
    limiter.check('10.0.0.1');
    expect(limiter.check('10.0.0.1').success).toBe(false);

    vi.advanceTimersByTime(60_001);

    const result = limiter.check('10.0.0.1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('supports sliding window — partial expiry', () => {
    const limiter = rateLimit({ interval: 60_000, limit: 3 });

    // t=0: first request
    limiter.check('10.0.0.1');
    // t=30s: second request
    vi.advanceTimersByTime(30_000);
    limiter.check('10.0.0.1');
    // t=45s: third request — now at limit
    vi.advanceTimersByTime(15_000);
    limiter.check('10.0.0.1');
    expect(limiter.check('10.0.0.1').success).toBe(false);

    // t=60.001s: first request expired, one slot opens
    vi.advanceTimersByTime(15_001);
    const result = limiter.check('10.0.0.1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('cleans up expired entries during periodic cleanup', () => {
    const limiter = rateLimit({ interval: 10_000, limit: 5 });
    limiter.check('10.0.0.1');
    limiter.check('10.0.0.2');

    // Advance past interval AND cleanup threshold (60s)
    vi.advanceTimersByTime(61_000);

    const result = limiter.check('10.0.0.1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('handles high concurrency from same IP', () => {
    const limiter = rateLimit({ interval: 60_000, limit: 100 });
    for (let i = 0; i < 100; i++) {
      expect(limiter.check('10.0.0.1').success).toBe(true);
    }
    expect(limiter.check('10.0.0.1').success).toBe(false);
  });
});

describe('exported route limiters', () => {
  it('exports plannerChatLimiter', async () => {
    const { plannerChatLimiter } = await import('@/lib/rate-limit');
    expect(typeof plannerChatLimiter.check).toBe('function');
  });

  it('exports flightsSearchLimiter', async () => {
    const { flightsSearchLimiter } = await import('@/lib/rate-limit');
    expect(typeof flightsSearchLimiter.check).toBe('function');
  });

  it('exports leadCaptureLimiter', async () => {
    const { leadCaptureLimiter } = await import('@/lib/rate-limit');
    expect(typeof leadCaptureLimiter.check).toBe('function');
  });
});
