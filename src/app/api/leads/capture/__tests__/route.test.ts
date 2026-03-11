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

  it('returns 200 when whatsappNumber is missing (optional field)', async () => {
    const req = createMockRequest('/api/leads/capture', {
      method: 'POST',
      body: { firstName: 'Test', email: 'test@test.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.contactId).toBe('mock-contact-123');
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

  it("returns 400 when email has invalid format", async () => {
    const req = createMockRequest("/api/leads/capture", {
      method: "POST",
      body: { firstName: "Test", email: "not-an-email" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.details?.email).toBeDefined();
  });

  it("returns 400 when source is not a valid enum value", async () => {
    const req = createMockRequest("/api/leads/capture", {
      method: "POST",
      body: { firstName: "Test", email: "test@test.com", source: "invalid-source" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.details?.source).toBeDefined();
  });

  it("returns 200 for valid source enum values", async () => {
    const validSources = ["quiz", "flights", "planner-v2-share"];

    for (const source of validSources) {
      const req = createMockRequest("/api/leads/capture", {
        method: "POST",
        body: { firstName: "Test", email: "test@test.com", source },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
    }
  });

  it("returns 400 when firstName is not a string", async () => {
    const req = createMockRequest("/api/leads/capture", {
      method: "POST",
      body: { firstName: 12345, email: "test@test.com" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.details?.firstName).toBeDefined();
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

  it("returns 400 when contactId is empty string", async () => {
    const req = createMockRequest("/api/leads/capture", {
      method: "PATCH",
      body: { contactId: "", action: "viewed_flights" },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.details?.contactId).toBeDefined();
  });

  it("returns 400 when stage is not a valid enum value", async () => {
    const req = createMockRequest("/api/leads/capture", {
      method: "PATCH",
      body: { contactId: "mock-contact-123", stage: "invalidStage" },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
    expect(data.details?.stage).toBeDefined();
  });

  it("returns 200 for valid stage enum values", async () => {
    const validStages = ["quizLead", "exploring"];

    for (const stage of validStages) {
      const req = createMockRequest("/api/leads/capture", {
        method: "PATCH",
        body: { contactId: "mock-contact-123", stage },
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
    }
  });
});
