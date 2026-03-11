import { NextRequest, NextResponse } from 'next/server';
import { getRetreatBySlug } from '@/data/retreats';
import { getMockFlights } from '@/data/mock-flights';
import { type FlightOption, type FlightBuckets, type FlightDateOption, type FlightSearchResults, type TripType } from '@/types';
import { searchFlightsSerpApi, searchMultipleDatesSerpApi, searchMultiCitySerpApi } from '@/lib/serpapi';
import { addDays } from '@/lib/utils';

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
    const {
      originCode, originName, originCity, originCountry,
      retreatSlug, direction,
      tripType = 'round-trip' as TripType,
      departureToken,
      multiCityLegs,
      legIndex,
    } = body;

    // ── INPUT VALIDATION ─────────────────────────────────────────────
    const IATA_RE = /^[A-Z]{3}$/;
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

    // Validate multi-city leg codes and dates upfront
    if (multiCityLegs && Array.isArray(multiCityLegs)) {
      for (const leg of multiCityLegs) {
        if (!IATA_RE.test(leg.departure_id) || !IATA_RE.test(leg.arrival_id)) {
          return NextResponse.json(
            { error: `Invalid airport code in multi-city leg: ${leg.departure_id} → ${leg.arrival_id}` },
            { status: 400 }
          );
        }
        if (!DATE_RE.test(leg.date)) {
          return NextResponse.json(
            { error: `Invalid date in multi-city leg: ${leg.date}. Expected YYYY-MM-DD format.` },
            { status: 400 }
          );
        }
      }
    }

    // Validate origin code for standard searches
    if (originCode && !IATA_RE.test(originCode)) {
      return NextResponse.json(
        { error: `Invalid origin airport code: ${originCode}. Expected 3-letter IATA code (e.g. YYZ, LAX).` },
        { status: 400 }
      );
    }

    // ── MULTI-CITY BRANCH ────────────────────────────────────────────
    if (multiCityLegs && Array.isArray(multiCityLegs) && multiCityLegs.length >= 2) {
      const serpApiKey = process.env.SERPAPI_KEY;
      const currentLegIndex = typeof legIndex === 'number' ? legIndex : 0;

      if (serpApiKey) {
        try {
          const serpResult = await searchMultiCitySerpApi({
            legs: multiCityLegs,
            legIndex: currentLegIndex,
            departureToken,
            maxResults: 15,
          });

          if (serpResult.flights.length > 0) {
            const currentLeg = multiCityLegs[currentLegIndex];
            console.log(
              `SerpApi multi-city returned ${serpResult.flights.length} flights for leg ${currentLegIndex + 1}: ${currentLeg.departure_id}→${currentLeg.arrival_id}`
            );
            const buckets = sortIntoBuckets(serpResult.flights);
            return NextResponse.json({
              ...buckets,
              departureTokens: serpResult.departureTokens,
              lastUpdated: new Date().toISOString(),
              sourceCurrency: 'USD',
            });
          }
          console.warn('SerpApi returned no multi-city flights, falling back to mock data');
        } catch (serpError) {
          console.error('SerpApi multi-city error:', serpError);
        }
      }

      // Multi-city mock fallback
      const currentLeg = multiCityLegs[currentLegIndex];
      const mockFlights = getMockFlights(currentLeg.departure_id, currentLeg.arrival_id, currentLeg.date);
      return NextResponse.json({
        ...mockFlights,
        departureTokens: {},
        lastUpdated: new Date().toISOString(),
        sourceCurrency: 'USD',
      });
    }

    // ── STANDARD (round-trip / one-way) BRANCH ───────────────────────
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

    const serpApiKey = process.env.SERPAPI_KEY;

    // Determine return date for round-trip searches
    const returnDate = tripType === 'round-trip' ? dates.returnDayOf : undefined;

    if (isReturn) {
      // ── RETURN FLIGHTS ──────────────────────────────────────────────

      if (serpApiKey) {
        try {
          // When chaining with departure_token (round-trip), SerpApi needs
          // the ORIGINAL search params (same origin→dest, outbound + return dates).
          // The token tells SerpApi which outbound was selected; it returns
          // the matching return options.
          // Without departure_token (one-way return), use swapped origin/dest.
          const useTokenChain = !!departureToken && tripType === 'round-trip';

          const serpResult = await searchFlightsSerpApi({
            originCode: useTokenChain ? originCode : searchOriginCode,
            destCode: useTokenChain ? retreat.airport.code : searchDestCode,
            date: useTokenChain ? dates.dayOf : dates.returnDayOf,
            departureToken: useTokenChain ? departureToken : undefined,
            returnDate: useTokenChain ? dates.returnDayOf : undefined,
            maxResults: 15,
          });

          if (serpResult.flights.length > 0) {
            console.log(
              `SerpApi returned ${serpResult.flights.length} return flights (${useTokenChain ? 'token-chained' : 'standalone'}) for ${searchOriginCode}→${searchDestCode}`
            );
            const buckets = sortIntoBuckets(serpResult.flights);
            return NextResponse.json({
              search: searchMeta,
              ...buckets,
              lastUpdated: new Date().toISOString(),
              sourceCurrency: 'USD',
            } satisfies FlightSearchResults);
          }
          console.warn('SerpApi returned no return flights, falling back to mock data');
        } catch (serpError) {
          console.error('SerpApi error for return flights:', serpError);
        }
      }

      // Return mock fallback
      const mockFlights = getMockFlights(searchOriginCode, searchDestCode, dates.returnDayOf);
      return NextResponse.json({
        search: searchMeta,
        cheapest: mockFlights.cheapest,
        best: mockFlights.best,
        fastest: mockFlights.fastest,
        unlisted: mockFlights.unlisted,
        lastUpdated: new Date().toISOString(),
        sourceCurrency: 'USD',
      } satisfies FlightSearchResults);

    } else {
      // ── OUTBOUND: multi-date search (day-of, day-before, two-days-before) ──
      const datesToSearch = [dates.dayOf, dates.dayBefore, dates.twoDaysBefore];
      const dateToKey: Record<string, FlightDateOption> = {
        [dates.dayOf]: 'day-of',
        [dates.dayBefore]: 'day-before',
        [dates.twoDaysBefore]: 'two-days-before',
      };

      if (serpApiKey) {
        try {
          const { results: multiResults, failedDates } = await searchMultipleDatesSerpApi(
            searchOriginCode,
            searchDestCode,
            datesToSearch,
            returnDate,
          );

          const byDate = {} as Record<FlightDateOption, FlightBuckets>;
          const allFlights: FlightOption[] = [];

          for (const [dateStr, result] of multiResults) {
            const key = dateToKey[dateStr];
            if (key) {
              byDate[key] = sortIntoBuckets(result.flights);
              allFlights.push(...result.flights);
            }
          }

          if (allFlights.length > 0) {
            const successCount = datesToSearch.length - failedDates.length;
            console.log(
              `SerpApi returned ${allFlights.length} outbound flights across ${successCount}/${datesToSearch.length} dates for ${searchOriginCode}→${searchDestCode}`
            );
            const combined = sortIntoBuckets(allFlights);
            return NextResponse.json({
              search: searchMeta,
              ...combined,
              byDate,
              ...(failedDates.length > 0 ? { failedDates } : {}),
              lastUpdated: new Date().toISOString(),
              sourceCurrency: 'USD',
            } satisfies FlightSearchResults);
          }

          console.warn('SerpApi returned no outbound flights for any date, falling back to mock data');
        } catch (serpError) {
          console.error('SerpApi error for outbound flights:', serpError);
        }
      }

      // Outbound mock fallback — includes byDate
      const mockFlights = getMockFlights(searchOriginCode, searchDestCode, dates.dayOf);
      return NextResponse.json({
        search: searchMeta,
        ...mockFlights,
        lastUpdated: new Date().toISOString(),
        sourceCurrency: 'USD',
      } satisfies FlightSearchResults);
    }
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
