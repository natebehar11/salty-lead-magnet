import { getFlightEstimate, formatTotal } from '@/lib/trip-cost';
import { FlightSearchResults } from '@/types/flight';

describe('getFlightEstimate', () => {
  it('returns amount 0 and "Searching flights..." when isLoading', () => {
    const result = getFlightEstimate(null, true);
    expect(result.amount).toBe(0);
    expect(result.label).toBe('Searching flights...');
  });

  it('returns amount 0 and empty label when searchResults is null', () => {
    const result = getFlightEstimate(null, false);
    expect(result.amount).toBe(0);
    expect(result.label).toBe('');
  });

  it('returns doubled cheapest price when flights are available', () => {
    const searchResults: FlightSearchResults = {
      search: {
        origin: { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
        destination: { code: 'SJO', name: 'Juan Santamaria', city: 'San Jose', country: 'Costa Rica' },
        retreatSlug: 'costa-rica',
        retreatName: 'Surf Sweat Flow',
        dates: {
          retreatStart: '2026-01-03',
          retreatEnd: '2026-01-10',
          dayOf: '2026-01-03',
          dayBefore: '2026-01-02',
          twoDaysBefore: '2026-01-01',
          returnDayOf: '2026-01-10',
          returnDayAfter: '2026-01-11',
          returnTwoDaysAfter: '2026-01-12',
        },
      },
      cheapest: [
        {
          id: 'flight-1',
          price: 400,
          currency: 'USD',
          segments: [],
          totalDuration: 300,
          stops: 0,
          bookingUrl: 'https://example.com',
          source: 'google',
          isSelfTransfer: false,
          isAlternateAirport: false,
        },
      ],
      best: [],
      fastest: [],
      unlisted: [],
      lastUpdated: new Date().toISOString(),
      sourceCurrency: 'USD',
    };

    const result = getFlightEstimate(searchResults, false);
    expect(result.amount).toBe(800);
    expect(result.label).toBe('~$800');
  });
});

describe('formatTotal', () => {
  it('formats retreat + flight total', () => {
    expect(formatTotal(2399, 800)).toBe('~$3,199');
  });

  it('formats zero total', () => {
    expect(formatTotal(0, 0)).toBe('~$0');
  });
});
