/**
 * SerpApi Google Flights Integration
 *
 * Uses SerpApi to scrape real Google Flights data and return structured
 * flight results with prices and booking information.
 *
 * Free tier: 250 searches/month
 * Docs: https://serpapi.com/google-flights-api
 */

import { FlightOption, FlightSegment } from '@/types';
import { generateGoogleFlightsUrl } from './google-flights';
import { getCachedFlights, cacheFlights } from './flight-cache';

// ---------------------------------------------------------------------------
// SerpApi response types (subset of what they return)
// ---------------------------------------------------------------------------

interface SerpFlightSegment {
  departure_airport: { name: string; id: string; time: string };
  arrival_airport: { name: string; id: string; time: string };
  duration: number;
  airplane?: string;
  airline: string;
  airline_logo?: string;
  flight_number: string;
  travel_class?: string;
  legroom?: string;
  extensions?: string[];
  overnight?: boolean;
}

interface SerpLayover {
  duration: number;
  name: string;
  id: string;
  overnight?: boolean;
}

interface SerpFlight {
  flights: SerpFlightSegment[];
  layovers?: SerpLayover[];
  total_duration: number;
  price: number;
  type?: string;
  airline_logo?: string;
  departure_token?: string;
  booking_token?: string;
  carbon_emissions?: {
    this_flight: number;
    typical_for_this_route: number;
    difference_percent: number;
  };
}

interface SerpApiResponse {
  search_metadata?: {
    id: string;
    status: string;
    google_flights_url?: string;
  };
  search_parameters?: Record<string, string>;
  best_flights?: SerpFlight[];
  other_flights?: SerpFlight[];
  price_insights?: {
    lowest_price: number;
    price_level: string;
    typical_price_range: number[];
    price_history: number[][];
  };
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract airline code from flight number like "UA 2175" → "UA" */
function extractAirlineCode(flightNumber: string): string {
  const match = flightNumber.match(/^([A-Z]{2})\s?\d/);
  return match ? match[1] : flightNumber.substring(0, 2).toUpperCase();
}

/** Extract time from SerpApi datetime string like "2026-03-15 08:30" → "08:30" */
function extractTime(datetime: string): string {
  const parts = datetime.split(' ');
  return parts.length > 1 ? parts[1] : datetime;
}

/** Extract date from SerpApi datetime string like "2026-03-15 08:30" → "2026-03-15" */
function extractDate(datetime: string): string {
  const parts = datetime.split(' ');
  return parts[0];
}

/** Convert a SerpApi flight segment to our FlightSegment type */
function convertSegment(seg: SerpFlightSegment): FlightSegment {
  return {
    airline: seg.airline,
    airlineCode: extractAirlineCode(seg.flight_number),
    flightNumber: seg.flight_number.replace(/\s+/g, ''),
    departure: {
      airport: seg.departure_airport.id,
      time: extractTime(seg.departure_airport.time),
      date: extractDate(seg.departure_airport.time),
    },
    arrival: {
      airport: seg.arrival_airport.id,
      time: extractTime(seg.arrival_airport.time),
      date: extractDate(seg.arrival_airport.time),
    },
    duration: seg.duration,
  };
}

/** Check if a SerpApi flight contains a self-transfer (different airlines on consecutive segments) */
function detectSelfTransfer(segments: SerpFlightSegment[]): boolean {
  if (segments.length < 2) return false;
  for (let i = 1; i < segments.length; i++) {
    const prevCode = extractAirlineCode(segments[i - 1].flight_number);
    const currCode = extractAirlineCode(segments[i].flight_number);
    if (prevCode !== currCode) return true;
  }
  return false;
}

/** Convert a full SerpApi flight result to our FlightOption type */
function convertFlight(
  serpFlight: SerpFlight,
  originCode: string,
  destCode: string,
  date: string,
  returnDate?: string,
): FlightOption {
  const segments = serpFlight.flights.map(convertSegment);
  const isSelfTransfer = detectSelfTransfer(serpFlight.flights);

  // Build a Google Flights URL as the booking link
  const bookingUrl = generateGoogleFlightsUrl(originCode, destCode, date, returnDate);

  return {
    id: `serp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    price: serpFlight.price,
    currency: 'USD',
    segments,
    totalDuration: serpFlight.total_duration,
    stops: segments.length - 1,
    bookingUrl,
    source: 'google' as const,
    isSelfTransfer,
    selfTransferWarning: isSelfTransfer
      ? 'This itinerary involves a self-transfer between different airlines. You may need to re-check bags.'
      : undefined,
    isAlternateAirport: false,
    departureToken: serpFlight.departure_token,
    isRoundTrip: !!returnDate,
  };
}

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

export interface SerpApiSearchParams {
  originCode: string;
  destCode: string;
  date: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD — if provided, uses type=1 (round-trip)
  departureToken?: string; // chains outbound→return or leg→next leg
  maxResults?: number;
}

export interface SerpApiSearchResult {
  flights: FlightOption[];
  priceInsights?: {
    lowestPrice: number;
    priceLevel: string;
    typicalRange: [number, number];
  };
  googleFlightsUrl?: string;
}

/**
 * Search for flights using SerpApi Google Flights.
 * Returns structured FlightOption[] compatible with the rest of the app.
 *
 * type=1 (round-trip) when returnDate provided, type=2 (one-way) otherwise.
 * departure_token chains outbound → return flights.
 *
 * Each call costs 1 SerpApi credit (250 free/month).
 */
export async function searchFlightsSerpApi(
  params: SerpApiSearchParams,
): Promise<SerpApiSearchResult> {
  // Check cache first (skip for token-chained searches — tokens are per-user-selection)
  if (!params.departureToken) {
    const cached = await getCachedFlights(
      params.originCode,
      params.destCode,
      params.date,
      params.returnDate,
    );
    if (cached) return cached;
  }

  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn('SERPAPI_KEY not set, returning empty results');
    return { flights: [] };
  }

  const isRoundTrip = !!params.returnDate;

  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine', 'google_flights');
  url.searchParams.set('departure_id', params.originCode);
  url.searchParams.set('arrival_id', params.destCode);
  url.searchParams.set('outbound_date', params.date);
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('gl', 'us');
  url.searchParams.set('type', isRoundTrip ? '1' : '2');
  url.searchParams.set('api_key', apiKey);

  if (params.returnDate) {
    url.searchParams.set('return_date', params.returnDate);
  }
  if (params.departureToken) {
    url.searchParams.set('departure_token', params.departureToken);
  }

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000), // Fail fast — don't wait for Vercel's 10s limit
      cache: 'no-store', // Redis is the caching layer — don't double-cache in Next.js
    });

    if (!response.ok) {
      console.error(`SerpApi HTTP ${response.status}: ${response.statusText}`);
      return { flights: [] };
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      console.error('SerpApi error:', data.error);
      return { flights: [] };
    }

    // Combine best_flights and other_flights
    const bestFlights = (data.best_flights || []).map((f) =>
      convertFlight(f, params.originCode, params.destCode, params.date, params.returnDate),
    );
    const otherFlights = (data.other_flights || []).map((f) =>
      convertFlight(f, params.originCode, params.destCode, params.date, params.returnDate),
    );

    // Filter out any malformed flights with empty segments before bucketing
    const allFlights = [...bestFlights, ...otherFlights].filter(
      (f) => f.segments.length > 0,
    );

    // Limit results if requested
    const maxResults = params.maxResults || 20;
    const flights = allFlights.slice(0, maxResults);

    // Price insights
    let priceInsights: SerpApiSearchResult['priceInsights'];
    if (data.price_insights) {
      priceInsights = {
        lowestPrice: data.price_insights.lowest_price,
        priceLevel: data.price_insights.price_level,
        typicalRange: [
          data.price_insights.typical_price_range?.[0] || 0,
          data.price_insights.typical_price_range?.[1] || 0,
        ],
      };
    }

    const result: SerpApiSearchResult = {
      flights,
      priceInsights,
      googleFlightsUrl: data.search_metadata?.google_flights_url,
    };

    // Cache the result (fire-and-forget — don't block the response)
    if (!params.departureToken) {
      cacheFlights(
        params.originCode,
        params.destCode,
        params.date,
        result,
        params.returnDate,
      ).catch(() => {});
    }

    return result;
  } catch (error) {
    console.error('SerpApi fetch error:', error);
    return { flights: [] };
  }
}

/**
 * Search multiple dates and combine results.
 * Useful for searching day-of, day-before, two-days-before in one call.
 *
 * WARNING: Each date is a separate SerpApi credit. Use sparingly.
 */
export interface MultiDateSearchResult {
  results: Map<string, SerpApiSearchResult>;
  /** Dates that failed to fetch (timeout, network error, etc.) */
  failedDates: string[];
}

export async function searchMultipleDatesSerpApi(
  originCode: string,
  destCode: string,
  dates: string[],
  returnDate?: string,
): Promise<MultiDateSearchResult> {
  const results = new Map<string, SerpApiSearchResult>();
  const failedDates: string[] = [];

  // Run all date searches in parallel — SerpApi rate limits are per-month (250),
  // not per-second, so concurrent requests are safe and cut latency ~60%.
  const settled = await Promise.allSettled(
    dates.map(async (date) => {
      const result = await searchFlightsSerpApi({
        originCode,
        destCode,
        date,
        returnDate,
        maxResults: 10,
      });
      return { date, result };
    }),
  );

  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    if (outcome.status === 'fulfilled') {
      results.set(outcome.value.date, outcome.value.result);
    } else {
      console.error('SerpApi date search failed:', outcome.reason);
      failedDates.push(dates[i]);
    }
  }

  return { results, failedDates };
}

// ---------------------------------------------------------------------------
// Multi-city search
// ---------------------------------------------------------------------------

export interface MultiCitySerpParams {
  legs: { departure_id: string; arrival_id: string; date: string }[];
  legIndex: number;
  departureToken?: string;
  maxResults?: number;
}

export interface MultiCitySerpResult {
  flights: FlightOption[];
  /** Maps flightId → departure_token for chaining to the next leg */
  departureTokens: Record<string, string>;
}

/**
 * Search for multi-city flights using SerpApi Google Flights (type=3).
 *
 * For the first leg, sends all legs via multi_city_json.
 * For subsequent legs, sends departure_token from the previous selection.
 *
 * Each call costs 1 SerpApi credit.
 */
export async function searchMultiCitySerpApi(
  params: MultiCitySerpParams,
): Promise<MultiCitySerpResult> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn('SERPAPI_KEY not set, returning empty results');
    return { flights: [], departureTokens: {} };
  }

  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine', 'google_flights');
  url.searchParams.set('type', '3');
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('gl', 'us');
  url.searchParams.set('api_key', apiKey);

  // First leg: provide full multi-city JSON
  // Subsequent legs: provide departure_token
  if (params.departureToken) {
    url.searchParams.set('departure_token', params.departureToken);
  }

  // Always provide multi_city_json so SerpApi knows the full itinerary
  url.searchParams.set('multi_city_json', JSON.stringify(params.legs));

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store', // Redis is the caching layer — don't double-cache in Next.js
    });

    if (!response.ok) {
      console.error(`SerpApi multi-city HTTP ${response.status}: ${response.statusText}`);
      return { flights: [], departureTokens: {} };
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      console.error('SerpApi multi-city error:', data.error);
      return { flights: [], departureTokens: {} };
    }

    const currentLeg = params.legs[params.legIndex];
    const departureTokens: Record<string, string> = {};

    const convert = (f: SerpFlight): FlightOption => {
      const option = convertFlight(
        f,
        currentLeg.departure_id,
        currentLeg.arrival_id,
        currentLeg.date,
      );
      if (f.departure_token) {
        departureTokens[option.id] = f.departure_token;
      }
      return option;
    };

    const bestFlights = (data.best_flights || []).map(convert);
    const otherFlights = (data.other_flights || []).map(convert);
    const allFlights = [...bestFlights, ...otherFlights].filter(
      (f) => f.segments.length > 0,
    );
    const maxResults = params.maxResults || 20;

    return {
      flights: allFlights.slice(0, maxResults),
      departureTokens,
    };
  } catch (error) {
    console.error('SerpApi multi-city fetch error:', error);
    return { flights: [], departureTokens: {} };
  }
}
