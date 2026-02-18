import { POST, PATCH } from '../route';
import { createMockRequest } from '@/test/api-helpers';

vi.mock('@/lib/ghl', () => ({
  createOrUpdateContact: vi.fn().mockResolvedValue('mock-contact-123'),
  addContactTags: vi.fn().mockResolvedValue(undefined),
  moveToStage: vi.fn().mockResolvedValue(undefined),
  generateQuizTags: vi.fn().mockReturnValue(['quiz_completed']),
  generateQuizCustomFields: vi.fn().mockReturnValue({}),
  generateFlightTags: vi.fn().mockReturnValue(['flight_searched']),
  generateIntentTags: vi.fn().mockReturnValue(['intent_test']),
}));

describe('POST /api/leads/capture', () => {
  it('returns 400 when firstName is missing', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'POST',
      body: { email: 'test@test.com', whatsappNumber: '+1234567890' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when email is missing', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'POST',
      body: { firstName: 'Test', whatsappNumber: '+1234567890' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when whatsappNumber is missing', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'POST',
      body: { firstName: 'Test', email: 'test@test.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 200 with contactId for a valid quiz source', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'POST',
      body: {
        firstName: 'Test',
        email: 'test@test.com',
        whatsappNumber: '+1234567890',
        source: 'quiz',
        quizAnswers: { vibes: ['adventure'] },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.contactId).toBe('mock-contact-123');
  });

  it('returns 200 for a valid flights source', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'POST',
      body: {
        firstName: 'Test',
        email: 'test@test.com',
        whatsappNumber: '+1234567890',
        source: 'flights',
        flightSearch: { originCode: 'YYZ' },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
  });
});

describe('PATCH /api/leads/capture', () => {
  it('returns 400 when contactId is missing', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'PATCH',
      body: { action: 'viewed_flights' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 200 for a valid update with action', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'PATCH',
      body: { contactId: 'mock-contact-123', action: 'viewed_flights' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
