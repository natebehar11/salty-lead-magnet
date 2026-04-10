import { BoardItem, BoardCityGroup, BoardCountryGroup, TopLevelBoardItem, CityPosition } from '@/types/vision-board';

/**
 * Groups a flat array of board items by city name.
 * City-type items set the group metadata (days, imageUrl).
 * Non-city items are listed under their city group.
 */
export function groupBoardItemsByCity(items: BoardItem[]): BoardCityGroup[] {
  const cityOrder: string[] = [];
  const cityItems = new Map<string, BoardItem[]>();
  const cityMeta = new Map<string, { country: string; days: number; imageUrl: string | null }>();

  for (const item of items) {
    const key = item.cityName;

    if (!cityItems.has(key)) {
      cityOrder.push(key);
      cityItems.set(key, []);
      cityMeta.set(key, { country: item.country, days: 0, imageUrl: null });
    }

    if (item.type === 'city') {
      const meta = cityMeta.get(key)!;
      meta.days = item.days ?? meta.days;
      meta.imageUrl = item.imageUrl || meta.imageUrl;
      meta.country = item.country || meta.country;
    } else {
      cityItems.get(key)!.push(item);
    }
  }

  return cityOrder.map((cityName) => {
    const meta = cityMeta.get(cityName)!;
    return {
      cityName,
      country: meta.country,
      days: meta.days,
      imageUrl: meta.imageUrl,
      items: cityItems.get(cityName)!.sort((a, b) => a.addedAt - b.addedAt),
    };
  });
}

/**
 * Groups board items into Country > City > Items hierarchy,
 * respecting explicit ordering from the store.
 */
export function groupBoardItemsByCountry(
  items: BoardItem[],
  topLevelOrder: TopLevelBoardItem[],
  cityOrderByCountry: Record<string, string[]>
): BoardCountryGroup[] {
  // 1. Get flat city groups
  const cityGroups = groupBoardItemsByCity(items);

  // 2. Group cities by country
  const byCountry = new Map<string, BoardCityGroup[]>();
  for (const group of cityGroups) {
    if (!byCountry.has(group.country)) {
      byCountry.set(group.country, []);
    }
    byCountry.get(group.country)!.push(group);
  }

  // 3. Sort cities within each country by explicit order
  for (const [country, cities] of byCountry) {
    const order = cityOrderByCountry[country];
    if (order && order.length > 0) {
      cities.sort((a, b) => {
        const ai = order.indexOf(a.cityName);
        const bi = order.indexOf(b.cityName);
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
      });
    }
  }

  // 4. Build country groups in topLevelOrder sequence
  const countryEntries = topLevelOrder.filter(
    (item): item is { kind: 'country'; country: string } => item.kind === 'country'
  );

  const result: BoardCountryGroup[] = [];
  const seen = new Set<string>();

  for (const entry of countryEntries) {
    const cities = byCountry.get(entry.country);
    if (cities && cities.length > 0) {
      result.push({ country: entry.country, cities });
      seen.add(entry.country);
    }
  }

  // 5. Append any countries not in the order (newly added)
  for (const [country, cities] of byCountry) {
    if (!seen.has(country)) {
      result.push({ country, cities });
    }
  }

  return result;
}

/** Count unique countries on the board */
export function getBoardCountryCount(items: BoardItem[]): number {
  const countries = new Set(items.map((i) => i.country));
  return countries.size;
}

/** Count non-city items on the board (activities, restaurants, experiences) */
export function getBoardItemCount(items: BoardItem[]): number {
  return items.filter((i) => i.type !== 'city').length;
}

/** Count unique cities on the board */
export function getBoardCityCount(items: BoardItem[]): number {
  const cities = new Set(items.map((i) => i.cityName));
  return cities.size;
}

/**
 * Splits city groups into 'before' and 'after' buckets based on the assignment map.
 * Cities not in the map default to 'before'.
 * Preserves ordering within each bucket based on the flat city groups order.
 */
export function splitBoardItemsByPosition(
  items: BoardItem[],
  assignment: Record<string, CityPosition>
): { before: BoardCityGroup[]; after: BoardCityGroup[] } {
  const cityGroups = groupBoardItemsByCity(items);
  const before: BoardCityGroup[] = [];
  const after: BoardCityGroup[] = [];

  for (const group of cityGroups) {
    const position = assignment[group.cityName] || 'before';
    if (position === 'after') {
      after.push(group);
    } else {
      before.push(group);
    }
  }

  return { before, after };
}

/** Calculate total days from city-type items on the board */
export function getBoardTotalDays(items: BoardItem[]): number {
  const cityDays = new Map<string, number>();
  for (const item of items) {
    if (item.type === 'city' && item.days) {
      cityDays.set(item.cityName, item.days);
    }
  }
  let total = 0;
  for (const days of cityDays.values()) {
    total += days;
  }
  return total;
}
