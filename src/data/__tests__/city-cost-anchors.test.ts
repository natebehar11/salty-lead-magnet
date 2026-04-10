import { describe, it, expect } from 'vitest';
import {
  cityAnchors,
  computeCityTotal,
  getCityAnchor,
  mapAirportToCity,
  availableCities,
  flightEstimates,
  getCityFlightEstimate,
} from '../city-cost-anchors';

describe('city-cost-anchors data integrity', () => {
  it('computeCityTotal matches manual sum for each city', () => {
    for (const [cityId, anchor] of Object.entries(cityAnchors)) {
      const manualSum = anchor.lineItems.reduce((sum, item) => sum + item.cost, 0);
      const computed = computeCityTotal(anchor);
      expect(computed, `${cityId} total mismatch`).toBe(manualSum);
    }
  });

  it('every availableCities entry has a matching cityAnchors record', () => {
    for (const city of availableCities) {
      expect(cityAnchors[city.id], `Missing cityAnchors for "${city.id}"`).toBeDefined();
    }
  });

  it('every city has at least 3 line items', () => {
    for (const [cityId, anchor] of Object.entries(cityAnchors)) {
      expect(anchor.lineItems.length, `${cityId} has too few items`).toBeGreaterThanOrEqual(3);
    }
  });

  it('all airport codes map to valid cities', () => {
    const knownCodes = ['YYZ', 'YTZ', 'YOW', 'YVR', 'YHZ', 'YUL', 'JFK', 'LGA', 'EWR'];
    for (const code of knownCodes) {
      const city = mapAirportToCity(code);
      expect(city, `${code} did not map to a city`).toBeDefined();
      expect(city.cityId).toBeTruthy();
    }
  });

  it('Y-prefix unknown codes map to Toronto', () => {
    const city = mapAirportToCity('YQB'); // Quebec City — not in our map
    expect(city.cityId).toBe('toronto');
  });

  it('non-Y unknown codes map to New York', () => {
    const city = mapAirportToCity('ORD'); // Chicago
    expect(city.cityId).toBe('new_york');
  });

  it('flight estimates exist for all available cities', () => {
    for (const city of availableCities) {
      expect(flightEstimates[city.id], `Missing flight estimate for ${city.id}`).toBeDefined();
      expect(flightEstimates[city.id]).toBeGreaterThan(0);
    }
  });

  it('getCityFlightEstimate returns default for unknown city', () => {
    const estimate = getCityFlightEstimate('unknown_city');
    expect(estimate).toBe(800); // default
  });

  it('getCityAnchor returns Toronto for unknown cityId', () => {
    const city = getCityAnchor('unknown_city_id');
    expect(city.cityId).toBe('toronto');
  });

  it('city totals are reasonable ($1,500 - $5,000)', () => {
    for (const [cityId, anchor] of Object.entries(cityAnchors)) {
      const total = computeCityTotal(anchor);
      expect(total, `${cityId} total ${total} too low`).toBeGreaterThan(1500);
      expect(total, `${cityId} total ${total} too high`).toBeLessThan(5000);
    }
  });

  it('every city has funComparison and sourceNote', () => {
    for (const [cityId, anchor] of Object.entries(cityAnchors)) {
      expect(anchor.funComparison, `${cityId} missing funComparison`).toBeTruthy();
      expect(anchor.sourceNote, `${cityId} missing sourceNote`).toBeTruthy();
    }
  });

  it('every city has a valid currency', () => {
    const validCurrencies = ['CAD', 'USD', 'EUR', 'GBP', 'AUD'];
    for (const [cityId, anchor] of Object.entries(cityAnchors)) {
      expect(validCurrencies, `${cityId} has invalid currency ${anchor.currency}`).toContain(anchor.currency);
    }
  });
});
