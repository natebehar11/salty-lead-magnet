import { POST } from '../route';
import { createMockRequest } from '@/test/api-helpers';
import { createMockFlight } from '@/test/store-mocks';

describe('POST /api/leads/share-flights', () => {
  it('returns 400 when leadData is missing', async () => {
    const req = createMockRequest('/api/leads/share-flights', {
      method: 'POST',
      body: { flightOptions: [createMockFlight()], retreatName: 'SALTY v4' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when flightOptions is missing', async () => {
    const req = createMockRequest('/api/leads/share-flights', {
      method: 'POST',
      body: {
        leadData: { firstName: 'Test', email: 'test@test.com', whatsappNumber: '+1' },
        retreatName: 'SALTY v4',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when retreatName is missing', async () => {
    const req = createMockRequest('/api/leads/share-flights', {
      method: 'POST',
      body: {
        leadData: { firstName: 'Test', email: 'test@test.com', whatsappNumber: '+1' },
        flightOptions: [createMockFlight()],
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 200 with success and deliveryMethod for a valid request', async () => {
    const req = createMockRequest('/api/leads/share-flights', {
      method: 'POST',
      body: {
        leadData: { firstName: 'Test', email: 'test@test.com', whatsappNumber: '+1' },
        flightOptions: [createMockFlight()],
        retreatName: 'SALTY v4 — Costa Rica',
        deliveryMethod: 'email',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.deliveryMethod).toBe('email');
  });
});
