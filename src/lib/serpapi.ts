/**
 * SerpApi Google Flights Integration
 *
 * Uses SerpApi to scrape real Google Flights data and return structured
 * flight results with prices and booking information.
 *
 * Free tier: 250 searches/month
 * Docs: https://serpapi.com/google-flights-api
 */

import { FlightOption, FlightSegment } from '@/types/flight';
import { generateGoogleFlightsUrl } from './google-flights';

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
): FlightOption {
  const segments = serpFlight.flights.map(convertSegment);
  const isSelfTransfer = detectSelfTransfer(serpFlight.flights);

  // Build a Google Flights URL as the booking link
  // (The booking_token requires a POST-based redirect which is complex for a simple link)
  const bookingUrl = generateGoogleFlightsUrl(originCode, destCode, date);

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
  };
}

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

export interface SerpApiSearchParams {
  originCode: string;
  destCode: string;
  date: string; // YYYY-MM-DD
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
 * Search for one-way flights using SerpApi Google Flights.
 * Returns structured FlightOption[] compatible with the rest of the app.
 *
 * Each call costs 1 SerpApi credit (250 free/month).
 */
export async function searchFlightsSerpApi(
  params: SerpApiSearchParams,
): Promise<SerpApiSearchResult> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn('SERPAPI_KEY not set, returning empty results');
    return { flights: [] };
  }

  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine', 'google_flights');
  url.searchParams.set('departure_id', params.originCode);
  url.searchParams.set('arrival_id', params.destCode);
  url.searchParams.set('outbound_date', params.date);
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('gl', 'us');
  url.searchParams.set('type', '2'); // 2 = one-way (1 = round trip)
  url.searchParams.set('api_key', apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
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
      convertFlight(f, params.originCode, params.destCode, params.date),
    );
    const otherFlights = (data.other_flights || []).map((f) =>
      convertFlight(f, params.originCode, params.destCode, params.date),
    );

    const allFlights = [...bestFlights, ...otherFlights];

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

    return {
      flights,
      priceInsights,
      googleFlightsUrl: data.search_metadata?.google_flights_url,
    };
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
export async function searchMultipleDatesSerpApi(
  originCode: string,
  destCode: string,
  dates: string[],
): Promise<Map<string, SerpApiSearchResult>> {
  const results = new Map<string, SerpApiSearchResult>();

  // Run searches sequentially to avoid rate limits
  for (const date of dates) {
    const result = await searchFlightsSerpApi({
      originCode,
      destCode,
      date,
      maxResults: 10,
    });
    results.set(date, result);
  }

  return results;
}
