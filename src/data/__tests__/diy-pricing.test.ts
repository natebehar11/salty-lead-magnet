import { describe, it, expect } from 'vitest';
import { diyComparisons, getDIYComparison, getAllDIYComparisons } from '../diy-pricing';
import { getRetreatBySlug } from '../retreats';

describe('diy-pricing data integrity', () => {
  it('every retreatSlug has a matching retreat in retreats.ts', () => {
    for (const comparison of diyComparisons) {
      const retreat = getRetreatBySlug(comparison.retreatSlug);
      expect(retreat, `No retreat found for slug "${comparison.retreatSlug}"`).toBeDefined();
    }
  });

  it('no duplicate retreat slugs', () => {
    const slugs = diyComparisons.map((c) => c.retreatSlug);
    const uniqueSlugs = new Set(slugs);
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  it('DIY totals are positive and between $1,000-$10,000', () => {
    for (const comparison of diyComparisons) {
      const total = comparison.items.reduce((sum, item) => sum + item.diyPrice, 0);
      expect(total, `${comparison.destination} DIY total ${total} out of range`).toBeGreaterThan(1000);
      expect(total, `${comparison.destination} DIY total ${total} out of range`).toBeLessThan(10000);
    }
  });

  it('every item with non-zero diyPrice has a description', () => {
    for (const comparison of diyComparisons) {
      for (const item of comparison.items) {
        if (item.diyPrice > 0) {
          expect(item.description, `${comparison.destination} > ${item.category} missing description`).toBeTruthy();
          expect(item.description.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it('every sourceUrl is a valid URL format', () => {
    for (const comparison of diyComparisons) {
      for (const item of comparison.items) {
        if (item.sourceUrl) {
          expect(() => new URL(item.sourceUrl!), `Invalid URL: ${item.sourceUrl}`).not.toThrow();
        }
      }
    }
  });

  it('estimatedDate parses to a valid Date', () => {
    for (const comparison of diyComparisons) {
      const date = new Date(comparison.estimatedDate);
      expect(date.toString(), `${comparison.destination} estimatedDate "${comparison.estimatedDate}" is invalid`).not.toBe('Invalid Date');
    }
  });

  it('nights are positive integers', () => {
    for (const comparison of diyComparisons) {
      expect(comparison.nights).toBeGreaterThan(0);
      expect(Number.isInteger(comparison.nights)).toBe(true);
    }
  });

  it('saltyPriceFrom is positive', () => {
    for (const comparison of diyComparisons) {
      expect(comparison.saltyPriceFrom, `${comparison.destination} saltyPriceFrom`).toBeGreaterThan(0);
    }
  });

  it('estimatedPlanningHours is positive', () => {
    for (const comparison of diyComparisons) {
      expect(comparison.estimatedPlanningHours).toBeGreaterThan(0);
    }
  });

  it('each comparison has at least 5 priced items', () => {
    for (const comparison of diyComparisons) {
      const pricedItems = comparison.items.filter((item) => item.diyPrice > 0);
      expect(pricedItems.length, `${comparison.destination} only has ${pricedItems.length} priced items`).toBeGreaterThanOrEqual(5);
    }
  });

  it('sourceUrls use durable search/category URLs (not fragile business pages)', () => {
    const durablePatterns = [
      'booking.com/searchresults',
      'tripadvisor.com',
      'google.com/search',
      'google.com/maps/search',
      'kayak.com',
      'airbnb.com/s/',
    ];

    for (const comparison of diyComparisons) {
      for (const item of comparison.items) {
        if (item.sourceUrl) {
          const isDurable = durablePatterns.some((pattern) => item.sourceUrl!.includes(pattern));
          expect(isDurable, `${comparison.destination} > ${item.category} has non-durable URL: ${item.sourceUrl}`).toBe(true);
        }
      }
    }
  });

  it('getDIYComparison returns correct comparison', () => {
    const comparison = getDIYComparison('sicily-wellness-retreat');
    expect(comparison).toBeDefined();
    expect(comparison!.destination).toBe('Sicily');
  });

  it('getDIYComparison returns undefined for unknown slug', () => {
    const comparison = getDIYComparison('nonexistent-slug');
    expect(comparison).toBeUndefined();
  });

  it('getAllDIYComparisons returns all comparisons', () => {
    const all = getAllDIYComparisons();
    expect(all.length).toBe(diyComparisons.length);
    expect(all.length).toBeGreaterThanOrEqual(5);
  });

  it('items with roomTierNote use correct saltyPriceFrom', () => {
    for (const comparison of diyComparisons) {
      if (comparison.roomTierNote) {
        // If showing a higher tier, saltyPriceFrom should be above dorm price
        const retreat = getRetreatBySlug(comparison.retreatSlug);
        if (retreat && retreat.lowestPrice > 0) {
          // The comparison price should be >= lowest price (it's a higher tier)
          expect(
            comparison.saltyPriceFrom,
            `${comparison.destination} roomTierNote set but saltyPriceFrom (${comparison.saltyPriceFrom}) <= lowestPrice (${retreat.lowestPrice})`
          ).toBeGreaterThanOrEqual(retreat.lowestPrice);
        }
      }
    }
  });
});
