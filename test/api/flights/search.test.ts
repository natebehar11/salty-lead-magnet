import { POST } from '@/app/api/flights/search/route';
import { createMockRequest } from '@test/helpers/api-helpers';

// Force mock data by ensuring no SERPAPI_KEY
beforeAll(() => {
  vi.stubEnv('SERPAPI_KEY', '');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/flights/search', () => {
  it('returns 400 when originCode is missing', async () => {
    const req = createMockRequest('/api/flights/search', {
      method: 'POST',
      body: { retreatSlug: 'costa-rica-fitness-retreat-v4' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when retreatSlug is missing', async () => {
    const req = createMockRequest('/api/flights/search', {
      method: 'POST',
      body: { originCode: 'YYZ' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 404 for an invalid retreatSlug', async () => {
    const req = createMockRequest('/api/flights/search', {
      method: 'POST',
      body: { originCode: 'YYZ', retreatSlug: 'fake' },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toContain('fake');
  });

  it('returns 200 with FlightSearchResults structure for a valid request', async () => {
    const req = createMockRequest('/api/flights/search', {
      method: 'POST',
      body: {
        originCode: 'YYZ',
        originName: 'Toronto Pearson',
        originCity: 'Toronto',
        originCountry: 'Canada',
        retreatSlug: 'costa-rica-fitness-retreat-v4',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.search).toBeDefined();
    expect(data.cheapest).toBeDefined();
    expect(data.best).toBeDefined();
    expect(data.fastest).toBeDefined();
    expect(data.unlisted).toBeDefined();
    expect(data.lastUpdated).toBeDefined();
    expect(data.sourceCurrency).toBe('USD');
  });

  it('swaps origin to retreat airport code for return direction', async () => {
    const req = createMockRequest('/api/flights/search', {
      method: 'POST',
      body: {
        originCode: 'YYZ',
        originName: 'Toronto Pearson',
        originCity: 'Toronto',
        originCountry: 'Canada',
        retreatSlug: 'costa-rica-fitness-retreat-v4',
        direction: 'return',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    // For return flights, the search origin should be the retreat airport (SJO)
    expect(data.search.origin.code).toBe('SJO');
  });
});
