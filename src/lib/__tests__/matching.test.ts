import { calculateMatch, calculateAllMatches } from '@/lib/matching';
import { getUpcomingRetreats } from '@/data/retreats';
import { QuizAnswers } from '@/types/quiz';

const defaultAnswers: QuizAnswers = {
  vibes: ['adventure', 'culture'],
  groupStyle: 'friends',
  budget: null,
  roomPreference: 'dorm',
  availability: ['flexible'],
  regions: ['central-america'],
  partyVsRest: 7,
  travelingSolo: false,
  experienceLevel: 'first-timer',
  mustHaves: ['surfing'],
};

describe('calculateMatch', () => {
  const retreats = getUpcomingRetreats();
  const retreat = retreats[0];

  it('returns matchScore between 5 and 99', () => {
    const result = calculateMatch(retreat, defaultAnswers);
    expect(result.matchScore).toBeGreaterThanOrEqual(5);
    expect(result.matchScore).toBeLessThanOrEqual(99);
  });

  it('breakdown has all 6 properties', () => {
    const result = calculateMatch(retreat, defaultAnswers);
    expect(result.breakdown).toHaveProperty('vibeScore');
    expect(result.breakdown).toHaveProperty('roomScore');
    expect(result.breakdown).toHaveProperty('dateScore');
    expect(result.breakdown).toHaveProperty('regionScore');
    expect(result.breakdown).toHaveProperty('activityScore');
    expect(result.breakdown).toHaveProperty('partyRestScore');
  });

  it('whyMatch is an array of 1 to 4 strings', () => {
    const result = calculateMatch(retreat, defaultAnswers);
    expect(Array.isArray(result.whyMatch)).toBe(true);
    expect(result.whyMatch.length).toBeGreaterThanOrEqual(1);
    expect(result.whyMatch.length).toBeLessThanOrEqual(4);
    for (const reason of result.whyMatch) {
      expect(typeof reason).toBe('string');
    }
  });
});

describe('calculateAllMatches', () => {
  const retreats = getUpcomingRetreats();

  it('filters out sold_out retreats', () => {
    const soldOutRetreat = { ...retreats[0], status: 'sold_out' as const };
    const withSoldOut = [...retreats, soldOutRetreat];
    const results = calculateAllMatches(withSoldOut, defaultAnswers);
    const slugs = results.map((r) => r.retreat.slug);
    // The sold-out copy should not appear more than the original
    const originalCount = retreats.filter((r) => r.slug === retreats[0].slug && r.status !== 'sold_out').length;
    const resultCount = slugs.filter((s) => s === retreats[0].slug).length;
    expect(resultCount).toBeLessThanOrEqual(originalCount);
  });

  it('returns results sorted by matchScore descending', () => {
    const results = calculateAllMatches(retreats, defaultAnswers);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(results[i].matchScore);
    }
  });

  it('each result has a retreat property', () => {
    const results = calculateAllMatches(retreats, defaultAnswers);
    for (const result of results) {
      expect(result.retreat).toBeDefined();
      expect(result.retreat.slug).toBeDefined();
    }
  });
});
