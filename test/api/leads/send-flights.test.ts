import { POST } from '@/app/api/leads/send-flights/route';
import { createMockRequest } from '@test/helpers/api-helpers';
import { createMockFlight } from '@test/helpers/store-mocks';

describe('POST /api/leads/send-flights', () => {
  it('returns 400 when email is missing', async () => {
    const req = createMockRequest('/api/leads/send-flights', {
      method: 'POST',
      body: {
        leadData: { firstName: 'Test' },
        retreatName: 'SALTY',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when retreatName is missing', async () => {
    const req = createMockRequest('/api/leads/send-flights', {
      method: 'POST',
      body: {
        leadData: { email: 'test@test.com' },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 200 with fallback mailto when GHL is not configured', async () => {
    const req = createMockRequest('/api/leads/send-flights', {
      method: 'POST',
      body: {
        leadData: { email: 'test@test.com', firstName: 'Test' },
        departingFlights: [createMockFlight()],
        returnFlights: [],
        retreatName: 'SALTY v4',
        currency: 'USD',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.fallback).toBe('mailto');
  });
});
