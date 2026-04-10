import { describe, it, expect } from 'vitest';
import { getFallbackResponse } from '../planner-fallback';
import { FALLBACK_POOLS } from '@/data/planner-fallbacks';

const BASE_OPTS = {
  destination: 'Morocco',
  retreatName: 'SALTY Morocco',
  existingBoardItems: [] as string[],
  previouslyShownNames: [] as string[],
  callIndex: 0,
};

describe('getFallbackResponse', () => {
  it('returns recommendations for a known destination', () => {
    const result = getFallbackResponse(BASE_OPTS);
    expect(result.text).toBeTruthy();
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('returns a generic fallback for unknown destinations', () => {
    const result = getFallbackResponse({ ...BASE_OPTS, destination: 'Narnia' });
    expect(result.text).toContain('Narnia');
    expect(result.recommendations.length).toBe(1);
    expect(result.recommendations[0].name).toContain('Narnia');
  });

  it('serves different city batches on successive calls', () => {
    const call0 = getFallbackResponse({ ...BASE_OPTS, callIndex: 0 });
    const call1 = getFallbackResponse({ ...BASE_OPTS, callIndex: 1 });

    const cities0 = new Set(call0.recommendations.map((r) => r.cityName));
    const cities1 = new Set(call1.recommendations.map((r) => r.cityName));

    // Different calls should serve different cities (Morocco has 3 cities)
    expect(cities0).not.toEqual(cities1);
  });

  it('filters out items already on the board', () => {
    const result = getFallbackResponse({
      ...BASE_OPTS,
      existingBoardItems: ['Marrakech', 'Jemaa el-Fnaa', 'Nomad Restaurant'],
    });

    const names = result.recommendations.map((r) => r.name);
    expect(names).not.toContain('Marrakech');
    expect(names).not.toContain('Jemaa el-Fnaa');
    expect(names).not.toContain('Nomad Restaurant');
  });

  it('filters out previously shown names', () => {
    const result = getFallbackResponse({
      ...BASE_OPTS,
      previouslyShownNames: ['Marrakech', 'Jemaa el-Fnaa', 'Nomad Restaurant', 'Hammam de la Rose', 'Le Jardin Secret'],
    });

    const names = result.recommendations.map((r) => r.name);
    expect(names).not.toContain('Marrakech');
    expect(names).not.toContain('Jemaa el-Fnaa');
  });

  it('returns empty recommendations when all items exhausted', () => {
    // Get ALL names directly from the pool (not via the function, which filters/batches)
    const allNames = FALLBACK_POOLS['Morocco'].recommendations.map((r) => r.name);

    const result = getFallbackResponse({
      ...BASE_OPTS,
      previouslyShownNames: allNames,
      callIndex: 10,
    });

    // Should return 0 recommendations with wrap-around text
    expect(result.recommendations.length).toBe(0);
    expect(result.text).toBeTruthy();
  });

  it('timestamps IDs to prevent React key collisions', () => {
    const result = getFallbackResponse(BASE_OPTS);
    for (const rec of result.recommendations) {
      // IDs should contain a timestamp portion
      expect(rec.id).toMatch(/-\d+-\d+$/);
    }
  });

  it('uses intro text on first call and follow-up text on subsequent calls', () => {
    const first = getFallbackResponse({ ...BASE_OPTS, callIndex: 0 });
    const second = getFallbackResponse({ ...BASE_OPTS, callIndex: 1 });

    // Texts should differ between first and subsequent calls
    expect(first.text).not.toBe(second.text);
  });
});
