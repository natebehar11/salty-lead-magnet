import { NextRequest, NextResponse } from 'next/server';
import { getRetreatBySlug } from '@/data/retreats';
import { getMockFlights } from '@/data/mock-flights';
import { type FlightOption, FlightSearchResults } from '@/types';
import { searchFlightsSerpApi } from '@/lib/serpapi';

function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Sort flights into cheapest / best / fastest buckets.
 * "best" = a blend of price and duration (lower total score is better).
 */
function sortIntoBuckets(flights: FlightOption[]): {
  cheapest: FlightOption[];
  best: FlightOption[];
  fastest: FlightOption[];
  unlisted: FlightOption[];
} {
  if (flights.length === 0) {
    return { cheapest: [], best: [], fastest: [], unlisted: [] };
  }

  const cheapest = [...flights].sort((a, b) => a.price - b.price);
  const fastest = [...flights].sort((a, b) => a.totalDuration - b.totalDuration);

  // Best = composite score: normalize price (0-1) + normalize duration (0-1)
  const minPrice = cheapest[0].price;
  const maxPrice = cheapest[cheapest.length - 1].price;
  const minDuration = fastest[0].totalDuration;
  const maxDuration = fastest[fastest.length - 1].totalDuration;
  const priceRange = maxPrice - minPrice || 1;
  const durationRange = maxDuration - minDuration || 1;

  const best = [...flights].sort((a, b) => {
    const scoreA = ((a.price - minPrice) / priceRange) * 0.6 + ((a.totalDuration - minDuration) / durationRange) * 0.4;
    const scoreB = ((b.price - minPrice) / priceRange) * 0.6 + ((b.totalDuration - minDuration) / durationRange) * 0.4;
    return scoreA - scoreB;
  });

  return {
    cheapest: cheapest.slice(0, 10),
    best: best.slice(0, 10),
    fastest: fastest.slice(0, 10),
    unlisted: [], // SerpApi doesn't have an "unlisted" concept
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originCode, originName, originCity, originCountry, retreatSlug, direction } = body;

    if (!originCode || !retreatSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: originCode, retreatSlug' },
        { status: 400 }
      );
    }

    const retreat = getRetreatBySlug(retreatSlug);
    if (!retreat) {
      return NextResponse.json(
        { error: `Retreat not found: ${retreatSlug}` },
        { status: 404 }
      );
    }

    const isReturn = direction === 'return';

    const dates = {
      retreatStart: retreat.startDate,
      retreatEnd: retreat.endDate,
      dayOf: retreat.startDate,
      dayBefore: addDays(retreat.startDate, -1),
      twoDaysBefore: addDays(retreat.startDate, -2),
      returnDayOf: retreat.endDate,
      returnDayAfter: addDays(retreat.endDate, 1),
      returnTwoDaysAfter: addDays(retreat.endDate, 2),
    };

    // For return flights, swap origin and destination
    const searchOriginCode = isReturn ? retreat.airport.code : originCode;
    const searchDestCode = isReturn ? originCode : retreat.airport.code;

    const searchMeta = {
      origin: isReturn
        ? {
            code: retreat.airport.code,
            name: retreat.airport.name,
            city: retreat.destination,
            country: retreat.locations[0]?.country || retreat.destination,
          }
        : {
            code: originCode,
            name: originName || originCode,
            city: originCity || originCode,
            country: originCountry || '',
          },
      destination: isReturn
        ? {
            code: originCode,
            name: originName || originCode,
            city: originCity || originCode,
            country: originCountry || '',
          }
        : {
            code: retreat.airport.code,
            name: retreat.airport.name,
            city: retreat.destination,
            country: retreat.locations[0]?.country || retreat.destination,
          },
      retreatSlug: retreat.slug,
      retreatName: `${retreat.title} — ${retreat.destination}`,
      dates,
    };

    // ── Try SerpApi (real Google Flights data) ──────────────────────────
    const serpApiKey = process.env.SERPAPI_KEY;

    // For outbound: search retreat start date. For return: search retreat end date.
    const primaryDate = isReturn ? dates.returnDayOf : dates.dayOf;

    if (serpApiKey) {
      try {
        const serpResult = await searchFlightsSerpApi({
          originCode: searchOriginCode,
          destCode: searchDestCode,
          date: primaryDate,
          maxResults: 15,
        });

        if (serpResult.flights.length > 0) {
          console.log(
            `SerpApi returned ${serpResult.flights.length} ${isReturn ? 'return' : 'outbound'} flights for ${searchOriginCode}→${searchDestCode} on ${primaryDate}`
          );

          const buckets = sortIntoBuckets(serpResult.flights);

          const results: FlightSearchResults = {
            search: searchMeta,
            ...buckets,
            lastUpdated: new Date().toISOString(),
            sourceCurrency: 'USD',
          };

          return NextResponse.json(results);
        }

        console.warn('SerpApi returned no flights, falling back to mock data');
      } catch (serpError) {
        console.error('SerpApi error, falling back to mock data:', serpError);
      }
    }

    // ── Fallback: mock data ────────────────────────────────────────────
    const mockFlights = getMockFlights(
      searchOriginCode,
      searchDestCode,
      primaryDate
    );

    const results: FlightSearchResults = {
      search: searchMeta,
      ...mockFlights,
      lastUpdated: new Date().toISOString(),
      sourceCurrency: 'USD',
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
