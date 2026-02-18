import { searchFlightsSerpApi } from '@/lib/serpapi';

const mockSerpApiResponse = {
  best_flights: [
    {
      flights: [
        {
          departure_airport: { name: 'Toronto Pearson', id: 'YYZ', time: '2026-01-03 08:30' },
          arrival_airport: { name: 'Juan Santamaria', id: 'SJO', time: '2026-01-03 14:45' },
          duration: 375,
          airline: 'Air Canada',
          airline_logo: '',
          flight_number: 'AC 123',
          travel_class: 'Economy',
        },
      ],
      total_duration: 375,
      price: 450,
      type: 'One way',
    },
  ],
  other_flights: [],
  price_insights: {
    lowest_price: 450,
    price_level: 'low',
    typical_price_range: [400, 600],
  },
};

const defaultParams = {
  originCode: 'YYZ',
  destCode: 'SJO',
  date: '2026-01-03',
};

describe('searchFlightsSerpApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it('returns empty flights when SERPAPI_KEY is not set', async () => {
    vi.stubEnv('SERPAPI_KEY', '');
    const result = await searchFlightsSerpApi(defaultParams);
    expect(result.flights).toEqual([]);
  });

  it('returns flights from successful API response', async () => {
    vi.stubEnv('SERPAPI_KEY', 'test-key');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSerpApiResponse),
    });

    const result = await searchFlightsSerpApi({ ...defaultParams, maxResults: 5 });
    expect(result.flights.length).toBeGreaterThan(0);
    expect(result.flights.length).toBeLessThanOrEqual(5);

    const flight = result.flights[0];
    expect(flight.id).toBeDefined();
    expect(flight.price).toBe(450);
    expect(flight.segments.length).toBeGreaterThan(0);
    expect(flight.source).toBe('google');
  });

  it('returns empty flights when fetch throws', async () => {
    vi.stubEnv('SERPAPI_KEY', 'test-key');
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    const result = await searchFlightsSerpApi(defaultParams);
    expect(result.flights).toEqual([]);
  });

  it('returns empty flights when API returns an error field', async () => {
    vi.stubEnv('SERPAPI_KEY', 'test-key');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: 'some error' }),
    });

    const result = await searchFlightsSerpApi(defaultParams);
    expect(result.flights).toEqual([]);
  });
});
