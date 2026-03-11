import { describe, it, expect } from 'vitest';
import { FALLBACK_POOLS } from '../planner-fallbacks';

const EXPECTED_DESTINATIONS = ['Costa Rica', 'Sri Lanka', 'Morocco', 'Sicily', 'El Salvador', 'Panama'];

describe('planner-fallbacks', () => {
  it('has pools for all 6 destinations', () => {
    for (const dest of EXPECTED_DESTINATIONS) {
      expect(FALLBACK_POOLS[dest]).toBeDefined();
    }
  });

  for (const dest of EXPECTED_DESTINATIONS) {
    describe(dest, () => {
      it('has at least 10 recommendations', () => {
        const pool = FALLBACK_POOLS[dest];
        expect(pool.recommendations.length).toBeGreaterThanOrEqual(10);
      });

      it('has recommendations across 2+ cities', () => {
        const pool = FALLBACK_POOLS[dest];
        const cities = new Set(pool.recommendations.map((r) => r.cityName));
        expect(cities.size).toBeGreaterThanOrEqual(2);
      });

      it('has unique IDs for all recommendations', () => {
        const pool = FALLBACK_POOLS[dest];
        const ids = pool.recommendations.map((r) => r.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      it('has required fields on all recommendations', () => {
        const pool = FALLBACK_POOLS[dest];
        for (const rec of pool.recommendations) {
          expect(rec.id).toBeTruthy();
          expect(rec.type).toBeTruthy();
          expect(rec.cityName).toBeTruthy();
          expect(rec.country).toBeTruthy();
          expect(rec.name).toBeTruthy();
          expect(rec.description).toBeTruthy();
        }
      });

      it('has at least 1 intro and 1 follow-up text', () => {
        const pool = FALLBACK_POOLS[dest];
        expect(pool.introTexts.length).toBeGreaterThanOrEqual(1);
        expect(pool.followUpTexts.length).toBeGreaterThanOrEqual(1);
      });

      it('has at least 1 city-type recommendation', () => {
        const pool = FALLBACK_POOLS[dest];
        const cities = pool.recommendations.filter((r) => r.type === 'city');
        expect(cities.length).toBeGreaterThanOrEqual(1);
      });
    });
  }
});
