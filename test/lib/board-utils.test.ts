import { describe, it, expect } from 'vitest';
import { BoardItem, TopLevelBoardItem } from '@/types/vision-board';
import {
  groupBoardItemsByCity,
  groupBoardItemsByCountry,
  getBoardItemCount,
  getBoardCityCount,
  getBoardTotalDays,
  getBoardCountryCount,
  splitBoardItemsByPosition,
} from '@/lib/board-utils';

function makeItem(overrides: Partial<BoardItem> & { name: string; cityName: string; country: string }): BoardItem {
  return {
    id: `test-${overrides.name.toLowerCase().replace(/\s/g, '-')}`,
    type: 'activity',
    description: 'Test description',
    addedAt: Date.now(),
    sourceMessageId: 'msg-1',
    imageUrl: null,
    ...overrides,
  };
}

const LISBON_CITY = makeItem({ name: 'Lisbon', cityName: 'Lisbon', country: 'Portugal', type: 'city', days: 3 });
const PORTO_CITY = makeItem({ name: 'Porto', cityName: 'Porto', country: 'Portugal', type: 'city', days: 2 });
const LISBON_REST = makeItem({ name: 'Restaurant A', cityName: 'Lisbon', country: 'Portugal', type: 'restaurant', addedAt: 100 });
const LISBON_LAND = makeItem({ name: 'Landmark B', cityName: 'Lisbon', country: 'Portugal', type: 'activity', addedAt: 200 });
const PORTO_REST = makeItem({ name: 'Restaurant C', cityName: 'Porto', country: 'Portugal', type: 'restaurant', addedAt: 300 });
const BCN_CITY = makeItem({ name: 'Barcelona', cityName: 'Barcelona', country: 'Spain', type: 'city', days: 3 });
const BCN_ACT = makeItem({ name: 'Sagrada Familia', cityName: 'Barcelona', country: 'Spain', type: 'activity', addedAt: 400 });

const ALL_ITEMS = [LISBON_CITY, LISBON_REST, LISBON_LAND, PORTO_CITY, PORTO_REST, BCN_CITY, BCN_ACT];

describe('groupBoardItemsByCity', () => {
  it('groups items by city in insertion order', () => {
    const groups = groupBoardItemsByCity(ALL_ITEMS);
    expect(groups.length).toBe(3);
    expect(groups[0].cityName).toBe('Lisbon');
    expect(groups[1].cityName).toBe('Porto');
    expect(groups[2].cityName).toBe('Barcelona');
  });

  it('city-type items set metadata, non-city items go in items array', () => {
    const groups = groupBoardItemsByCity(ALL_ITEMS);
    const lisbon = groups[0];
    expect(lisbon.days).toBe(3);
    expect(lisbon.country).toBe('Portugal');
    expect(lisbon.items.length).toBe(2); // Restaurant A, Landmark B
    expect(lisbon.items[0].name).toBe('Restaurant A'); // sorted by addedAt
    expect(lisbon.items[1].name).toBe('Landmark B');
  });
});

describe('groupBoardItemsByCountry', () => {
  const topLevelOrder: TopLevelBoardItem[] = [
    { kind: 'retreat' },
    { kind: 'country', country: 'Portugal' },
    { kind: 'country', country: 'Spain' },
  ];

  it('groups cities under countries', () => {
    const result = groupBoardItemsByCountry(ALL_ITEMS, topLevelOrder, {});
    expect(result.length).toBe(2); // Portugal, Spain
    expect(result[0].country).toBe('Portugal');
    expect(result[0].cities.length).toBe(2); // Lisbon, Porto
    expect(result[1].country).toBe('Spain');
    expect(result[1].cities.length).toBe(1); // Barcelona
  });

  it('respects topLevelOrder for country sequence', () => {
    const reversed: TopLevelBoardItem[] = [
      { kind: 'country', country: 'Spain' },
      { kind: 'retreat' },
      { kind: 'country', country: 'Portugal' },
    ];
    const result = groupBoardItemsByCountry(ALL_ITEMS, reversed, {});
    expect(result[0].country).toBe('Spain');
    expect(result[1].country).toBe('Portugal');
  });

  it('respects cityOrderByCountry for city sequence', () => {
    const cityOrder = { Portugal: ['Porto', 'Lisbon'] };
    const result = groupBoardItemsByCountry(ALL_ITEMS, topLevelOrder, cityOrder);
    const portugal = result[0];
    expect(portugal.cities[0].cityName).toBe('Porto');
    expect(portugal.cities[1].cityName).toBe('Lisbon');
  });

  it('appends new countries not yet in order', () => {
    const partialOrder: TopLevelBoardItem[] = [
      { kind: 'retreat' },
      { kind: 'country', country: 'Portugal' },
      // Spain missing from order
    ];
    const result = groupBoardItemsByCountry(ALL_ITEMS, partialOrder, {});
    expect(result.length).toBe(2);
    expect(result[0].country).toBe('Portugal');
    expect(result[1].country).toBe('Spain'); // appended
  });

  it('handles empty topLevelOrder gracefully', () => {
    const result = groupBoardItemsByCountry(ALL_ITEMS, [], {});
    expect(result.length).toBe(2);
    // Should still group by country, using insertion order
  });

  it('skips countries with no items in order', () => {
    const orderWithExtra: TopLevelBoardItem[] = [
      { kind: 'country', country: 'France' }, // no items
      { kind: 'country', country: 'Portugal' },
    ];
    const result = groupBoardItemsByCountry(ALL_ITEMS, orderWithExtra, {});
    expect(result[0].country).toBe('Portugal');
  });
});

describe('getBoardItemCount', () => {
  it('counts non-city items', () => {
    expect(getBoardItemCount(ALL_ITEMS)).toBe(4); // Restaurant A, Landmark B, Restaurant C, Sagrada Familia
  });
});

describe('getBoardCityCount', () => {
  it('counts unique cities', () => {
    expect(getBoardCityCount(ALL_ITEMS)).toBe(3);
  });
});

describe('getBoardCountryCount', () => {
  it('counts unique countries', () => {
    expect(getBoardCountryCount(ALL_ITEMS)).toBe(2);
  });
});

describe('getBoardTotalDays', () => {
  it('sums days from city-type items', () => {
    expect(getBoardTotalDays(ALL_ITEMS)).toBe(8); // 3 + 2 + 3
  });

  it('returns 0 when no city items', () => {
    expect(getBoardTotalDays([LISBON_REST, PORTO_REST])).toBe(0);
  });
});

describe('splitBoardItemsByPosition', () => {
  it('defaults all cities to "before" when assignment is empty', () => {
    const { before, after } = splitBoardItemsByPosition(ALL_ITEMS, {});
    expect(before.length).toBe(3); // Lisbon, Porto, Barcelona
    expect(after.length).toBe(0);
  });

  it('splits cities according to assignment map', () => {
    const assignment = { Barcelona: 'after' as const, Porto: 'after' as const };
    const { before, after } = splitBoardItemsByPosition(ALL_ITEMS, assignment);
    expect(before.length).toBe(1);
    expect(before[0].cityName).toBe('Lisbon');
    expect(after.length).toBe(2);
    expect(after[0].cityName).toBe('Porto');
    expect(after[1].cityName).toBe('Barcelona');
  });

  it('preserves city group structure (items, days, country)', () => {
    const assignment = { Lisbon: 'before' as const, Barcelona: 'after' as const };
    const { before, after } = splitBoardItemsByPosition(ALL_ITEMS, assignment);
    const lisbon = before.find((c) => c.cityName === 'Lisbon');
    expect(lisbon).toBeDefined();
    expect(lisbon!.days).toBe(3);
    expect(lisbon!.items.length).toBe(2);
    expect(lisbon!.country).toBe('Portugal');

    const bcn = after.find((c) => c.cityName === 'Barcelona');
    expect(bcn).toBeDefined();
    expect(bcn!.items.length).toBe(1);
  });

  it('handles empty board items', () => {
    const { before, after } = splitBoardItemsByPosition([], {});
    expect(before.length).toBe(0);
    expect(after.length).toBe(0);
  });
});
