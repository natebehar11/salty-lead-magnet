import { FlightOption, FlightFilters } from '@/types';
import { flightMatchesAlliances } from '@/data/alliances';

/**
 * Apply flight filters (stops, duration, price, alliances) to a list of flights.
 * Shared between single-retreat view and compare mode.
 */
export function applyFlightFilters(flights: FlightOption[], filters: FlightFilters): FlightOption[] {
  return flights.filter((f) => {
    if (filters.maxStops !== null && f.stops > filters.maxStops) return false;
    if (filters.maxDuration !== null && f.totalDuration > filters.maxDuration) return false;
    if (filters.maxPrice !== null && f.price > filters.maxPrice) return false;
    if (filters.alliances && filters.alliances.length > 0) {
      const airlines = [...new Set(f.segments.map((s) => s.airline))];
      if (!flightMatchesAlliances(airlines, filters.alliances)) return false;
    }
    return true;
  });
}
