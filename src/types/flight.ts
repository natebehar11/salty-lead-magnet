export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: { airport: string; time: string; date: string };
  arrival: { airport: string; time: string; date: string };
  duration: number;
}

export type TripType = 'round-trip' | 'one-way' | 'multi-city';

export interface FlightOption {
  id: string;
  price: number;
  currency: string;
  segments: FlightSegment[];
  totalDuration: number;
  stops: number;
  bookingUrl: string;
  source: 'kiwi' | 'google' | 'mock';
  isSelfTransfer: boolean;
  selfTransferWarning?: string;
  isAlternateAirport: boolean;
  alternateAirportNote?: string;
  departureToken?: string;
  isRoundTrip?: boolean;
}

/** A single leg in a multi-city itinerary */
export interface MultiCityLeg {
  id: string;
  origin: Airport | null;
  destination: Airport | null;
  date: string; // YYYY-MM-DD
}

/** Results for a single multi-city leg */
export interface MultiCityLegResult {
  legIndex: number;
  legLabel: string;
  results: FlightSearchResults;
  selectedFlightId: string | null;
  departureToken: string | null;
}

export interface FlightSearch {
  origin: Airport;
  destination: Airport;
  retreatSlug: string;
  retreatName: string;
  dates: {
    retreatStart: string;
    retreatEnd: string;
    dayOf: string;
    dayBefore: string;
    twoDaysBefore: string;
    returnDayOf: string;
    returnDayAfter: string;
    returnTwoDaysAfter: string;
  };
}

export interface FlightBuckets {
  cheapest: FlightOption[];
  best: FlightOption[];
  fastest: FlightOption[];
  unlisted: FlightOption[];
}

export interface FlightSearchResults extends FlightBuckets {
  search: FlightSearch;
  /** Per-date buckets for outbound flights (keyed by FlightDateOption). */
  byDate?: Record<FlightDateOption, FlightBuckets>;
  /** Dates that failed to fetch (timeout, network error). Present only when partial results. */
  failedDates?: string[];
  lastUpdated: string;
  sourceCurrency: string;
}

export type FlightDateOption = 'day-of' | 'day-before' | 'two-days-before';
export type ReturnDateOption = 'return-day-of' | 'return-day-after' | 'return-two-days-after';
export type FlightSortMode = 'cheapest' | 'best' | 'fastest';

export interface FlightFilters {
  maxStops: number | null;
  maxDuration: number | null;
  maxPrice: number | null;
  alliances: string[];
}
