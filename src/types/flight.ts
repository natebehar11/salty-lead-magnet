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

export interface FlightSearchResults {
  search: FlightSearch;
  cheapest: FlightOption[];
  best: FlightOption[];
  fastest: FlightOption[];
  unlisted: FlightOption[];
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
