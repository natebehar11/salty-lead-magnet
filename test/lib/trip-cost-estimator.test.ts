import { describe, it, expect } from 'vitest';
import {
  calculateTripCost,
  formatEstimate,
  confidenceLabel,
  AccommodationTier,
} from '@/lib/trip-cost-estimator';
import { BoardItem } from '@/types/vision-board';
import { Retreat } from '@/types';

// ─── Test data ───────────────────────────────────────────────────

function makeRetreat(overrides: Partial<Retreat> = {}): Retreat {
  return {
    slug: 'costa-rica-fitness-retreat',
    destination: 'Costa Rica',
    title: 'Surf Sweat Flow v3',
    lowestPrice: 2399,
    duration: { days: 7, nights: 6 },
    saltyMeter: { adventure: 7, culture: 6, party: 5, sweat: 7, rest: 8, groupSize: { min: 25, max: 35 } },
    ...overrides,
  } as Retreat;
}

function makeBoardItem(overrides: Partial<BoardItem>): BoardItem {
  return {
    id: overrides.id || `item-${Math.random()}`,
    type: overrides.type || 'activity',
    cityName: overrides.cityName || 'San José',
    country: overrides.country || 'Costa Rica',
    name: overrides.name || 'Test Item',
    description: '',
    addedAt: Date.now(),
    sourceMessageId: 'msg-1',
    ...overrides,
  } as BoardItem;
}

// ─── calculateTripCost ───────────────────────────────────────────

describe('calculateTripCost', () => {
  it('returns retreat cost with no board items', () => {
    const result = calculateTripCost([], makeRetreat(), 'mid');
    expect(result.retreatCost).toBe(2399);
    expect(result.activityCost).toBe(0);
    expect(result.activityCount).toBe(0);
    expect(result.accommodationCost).toBe(0);
    expect(result.accommodationNights).toBe(0);
    expect(result.totalEstimate).toBe(2399);
    expect(result.totalDays).toBe(7);
    expect(result.confidence).toBe('low');
  });

  it('calculates activity costs from priceRange', () => {
    const items = [
      makeBoardItem({ name: 'City', type: 'city', days: 2 }),
      makeBoardItem({ name: 'Cheap Activity', priceRange: '$' }),
      makeBoardItem({ name: 'Mid Activity', priceRange: '$$' }),
      makeBoardItem({ name: 'Expensive Activity', priceRange: '$$$' }),
    ];
    const result = calculateTripCost(items, makeRetreat(), 'mid');
    // $15 + $45 + $100 = $160
    expect(result.activityCost).toBe(160);
    expect(result.activityCount).toBe(3);
  });

  it('ignores city items when calculating activity costs', () => {
    const items = [
      makeBoardItem({ name: 'San José', type: 'city', days: 3, priceRange: '$$' }),
    ];
    const result = calculateTripCost(items, makeRetreat(), 'mid');
    // City items don't contribute to activity cost even if they have a priceRange
    expect(result.activityCost).toBe(0);
    expect(result.activityCount).toBe(0);
  });

  it('calculates accommodation for board city days', () => {
    const items = [
      makeBoardItem({ name: 'San José', type: 'city', days: 3 }),
      makeBoardItem({ name: 'Arenal', type: 'city', days: 2 }),
    ];
    const result = calculateTripCost(items, makeRetreat(), 'mid');
    // 5 nights × $70/night (Costa Rica mid) = $350
    expect(result.accommodationNights).toBe(5);
    expect(result.accommodationCost).toBe(350);
    expect(result.boardDays).toBe(5);
    expect(result.totalDays).toBe(12); // 5 board + 7 retreat
  });

  it('uses correct accommodation rates by tier', () => {
    const items = [makeBoardItem({ name: 'City', type: 'city', days: 2 })];
    const retreat = makeRetreat();

    const budget = calculateTripCost(items, retreat, 'budget');
    expect(budget.accommodationCost).toBe(60); // 2 × $30

    const mid = calculateTripCost(items, retreat, 'mid');
    expect(mid.accommodationCost).toBe(140); // 2 × $70

    const luxury = calculateTripCost(items, retreat, 'luxury');
    expect(luxury.accommodationCost).toBe(300); // 2 × $150
  });

  it('uses default rates for unknown destinations', () => {
    const items = [makeBoardItem({ name: 'City', type: 'city', days: 2 })];
    const retreat = makeRetreat({ destination: 'Unknown Country' });
    const result = calculateTripCost(items, retreat, 'mid');
    // Default mid rate: $70/night
    expect(result.accommodationCost).toBe(140);
  });

  it('calculates total correctly with all components', () => {
    const items = [
      makeBoardItem({ name: 'San José', type: 'city', days: 2 }),
      makeBoardItem({ name: 'Local Tour', priceRange: '$$' }),
      makeBoardItem({ name: 'Fancy Dinner', priceRange: '$$$' }),
    ];
    const result = calculateTripCost(items, makeRetreat(), 'mid');
    // Retreat: $2399 + Activities: $45+$100=$145 + Accommodation: 2×$70=$140
    expect(result.totalEstimate).toBe(2399 + 145 + 140);
  });

  it('returns low confidence with no board data', () => {
    const result = calculateTripCost([], makeRetreat(), 'mid');
    expect(result.confidence).toBe('low');
  });

  it('returns medium confidence with some data', () => {
    const items = [
      makeBoardItem({ name: 'City', type: 'city', days: 1 }),
      makeBoardItem({ name: 'A1', priceRange: '$' }),
      makeBoardItem({ name: 'A2', priceRange: '$$' }),
    ];
    const result = calculateTripCost(items, makeRetreat(), 'mid');
    expect(result.confidence).toBe('medium');
  });

  it('returns high confidence with rich board data', () => {
    const items = [
      makeBoardItem({ name: 'City', type: 'city', days: 3 }),
      makeBoardItem({ name: 'A1', priceRange: '$' }),
      makeBoardItem({ name: 'A2', priceRange: '$$' }),
      makeBoardItem({ name: 'A3', priceRange: '$$$' }),
      makeBoardItem({ name: 'A4', priceRange: '$$' }),
    ];
    const result = calculateTripCost(items, makeRetreat(), 'mid');
    expect(result.confidence).toBe('high');
  });

  it('handles retreat with no lowestPrice', () => {
    const retreat = makeRetreat({ lowestPrice: 0 });
    const result = calculateTripCost([], retreat, 'mid');
    expect(result.retreatCost).toBe(0);
    expect(result.totalEstimate).toBe(0);
  });

  it('handles activities without priceRange', () => {
    const items = [
      makeBoardItem({ name: 'Free Hike', type: 'activity' }),
    ];
    const result = calculateTripCost(items, makeRetreat(), 'mid');
    expect(result.activityCost).toBe(0);
    expect(result.activityCount).toBe(0);
  });
});

// ─── Formatting ──────────────────────────────────────────────────

describe('formatEstimate', () => {
  it('formats zero as $0', () => {
    expect(formatEstimate(0)).toBe('$0');
  });

  it('formats small amounts', () => {
    expect(formatEstimate(150)).toBe('$150');
  });

  it('formats large amounts with comma separator', () => {
    expect(formatEstimate(2399)).toBe('$2,399');
  });

  it('formats very large amounts', () => {
    expect(formatEstimate(10500)).toBe('$10,500');
  });
});

describe('confidenceLabel', () => {
  it('returns correct labels', () => {
    expect(confidenceLabel('low')).toBe('Very rough estimate');
    expect(confidenceLabel('medium')).toBe('Rough estimate');
    expect(confidenceLabel('high')).toBe('Good estimate');
  });
});
