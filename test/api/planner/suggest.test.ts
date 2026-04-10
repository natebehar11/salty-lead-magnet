import { POST } from '@/app/api/planner/suggest/route';
import { createMockRequest } from '@test/helpers/api-helpers';

// Force fallback mode by ensuring no ANTHROPIC_API_KEY
beforeAll(() => {
  vi.stubEnv('ANTHROPIC_API_KEY', '');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/planner/suggest', () => {
  it('returns 400 when destination is missing', async () => {
    const req = createMockRequest('/api/planner/suggest', {
      method: 'POST',
      body: {},
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 200 with fallback suggestions for a known destination', async () => {
    const req = createMockRequest('/api/planner/suggest', {
      method: 'POST',
      body: { destination: 'Costa Rica' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.cities).toBeDefined();
    expect(Array.isArray(data.cities)).toBe(true);
    expect(data.cities.length).toBeGreaterThan(0);
    expect(data.totalDays).toBeDefined();
    expect(data.reasoning).toBeDefined();
  });

  it('returns 200 with generic fallback for an unknown destination', async () => {
    const req = createMockRequest('/api/planner/suggest', {
      method: 'POST',
      body: { destination: 'Unknown Place' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.cities).toBeDefined();
    expect(Array.isArray(data.cities)).toBe(true);
    expect(data.cities.length).toBeGreaterThan(0);
  });
});
