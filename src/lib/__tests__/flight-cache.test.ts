import { describe, it, expect } from 'vitest';
import { buildCacheKey } from '@/lib/flight-cache';

describe('buildCacheKey', () => {
  it('builds a key for a one-way search', () => {
    const key = buildCacheKey('JFK', 'SJO', '2026-03-15');
    expect(key).toBe('flight:JFK:SJO:2026-03-15:ow');
  });

  it('builds a key for a round-trip search', () => {
    const key = buildCacheKey('JFK', 'SJO', '2026-03-15', '2026-03-22');
    expect(key).toBe('flight:JFK:SJO:2026-03-15:2026-03-22');
  });

  it('produces different keys for different origins', () => {
    const key1 = buildCacheKey('JFK', 'SJO', '2026-03-15');
    const key2 = buildCacheKey('YYZ', 'SJO', '2026-03-15');
    expect(key1).not.toBe(key2);
  });

  it('produces different keys for different dates', () => {
    const key1 = buildCacheKey('JFK', 'SJO', '2026-03-15');
    const key2 = buildCacheKey('JFK', 'SJO', '2026-03-14');
    expect(key1).not.toBe(key2);
  });

  it('produces different keys for one-way vs round-trip', () => {
    const key1 = buildCacheKey('JFK', 'SJO', '2026-03-15');
    const key2 = buildCacheKey('JFK', 'SJO', '2026-03-15', '2026-03-22');
    expect(key1).not.toBe(key2);
  });
});
