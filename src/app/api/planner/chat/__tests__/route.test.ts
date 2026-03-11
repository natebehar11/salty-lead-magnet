/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { getRetreatBySlug } from '@/data/retreats';
import { getFallbackResponse } from '@/lib/planner-fallback';

vi.mock('@/data/retreats', () => ({
  getRetreatBySlug: vi.fn(),
}));

vi.mock('@/lib/planner-fallback', () => ({
  getFallbackResponse: vi.fn(),
}));

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/planner/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = {
  destination: 'Costa Rica',
  retreatName: 'Costa Rica Fitness',
  retreatSlug: 'costa-rica-fitness-retreat',
  userMessage: 'What should I do before the retreat?',
  conversationHistory: [
    { role: 'user', content: 'What should I do before the retreat?' },
  ],
  existingBoardItems: [],
  previouslyShownNames: [],
  userProfile: null,
};

const mockRetreatData = {
  slug: 'costa-rica-fitness-retreat',
  saltyMeter: {
    adventure: 8,
    culture: 6,
    party: 5,
    sweat: 9,
    rest: 4,
    groupSize: { min: 10, max: 20 },
  },
};

describe('POST /api/planner/chat', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    (getRetreatBySlug as ReturnType<typeof vi.fn>).mockReturnValue(mockRetreatData);
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('returns 400 when destination is missing', async () => {
    const req = makeRequest({ ...validBody, destination: '' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request');
  });

  it('returns 400 when retreatName is missing', async () => {
    const req = makeRequest({ ...validBody, retreatName: '' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('parses valid Claude response and returns it', async () => {
    const aiResponse = {
      text: 'Here are some great spots near the retreat!',
      recommendations: [
        {
          id: 'rec-1',
          type: 'activity',
          cityName: 'San Jose',
          country: 'Costa Rica',
          name: 'Mercado Central',
          description: 'Historic market with incredible local food.',
          activityCategory: 'restaurant',
          priceRange: '$',
        },
      ],
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(aiResponse) }],
      }),
    });

    const req = makeRequest(validBody);
    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.text).toBe('Here are some great spots near the retreat!');
    expect(data.recommendations).toHaveLength(1);
    expect(data.recommendations[0].name).toBe('Mercado Central');
    expect(data.recommendations[0].cityName).toBe('San Jose');
  });

  it('falls back to OpenAI when Claude fails', async () => {
    const aiResponse = {
      text: 'OpenAI generated response.',
      recommendations: [],
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      // Claude fails
      .mockResolvedValueOnce({ ok: false, status: 500 })
      // OpenAI succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(aiResponse) } }],
        }),
      });

    const req = makeRequest(validBody);
    const res = await POST(req as any);
    const data = await res.json();
    expect(data.text).toBe('OpenAI generated response.');
  });

  it('falls back to static pool when both AI providers fail', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    (getFallbackResponse as ReturnType<typeof vi.fn>).mockReturnValue({
      text: 'Static fallback response.',
      recommendations: [],
    });

    const req = makeRequest(validBody);
    const res = await POST(req as any);
    const data = await res.json();
    expect(data.text).toBe('Static fallback response.');
    expect(getFallbackResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: 'Costa Rica',
        retreatName: 'Costa Rica Fitness',
      })
    );
  });

  it('falls back when Claude returns unparseable response', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      // Claude returns non-JSON
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'This is just plain text, not JSON' }],
        }),
      })
      // OpenAI also fails
      .mockResolvedValueOnce({ ok: false, status: 500 });

    (getFallbackResponse as ReturnType<typeof vi.fn>).mockReturnValue({
      text: 'Fallback after parse failure.',
      recommendations: [],
    });

    const req = makeRequest(validBody);
    const res = await POST(req as any);
    const data = await res.json();
    expect(data.text).toBe('Fallback after parse failure.');
  });

  it('parses response with recommendations missing optional fields', async () => {
    const aiResponse = {
      text: 'Check this out!',
      recommendations: [
        {
          // Minimal: only name and cityName required by parser
          name: 'Secret Beach',
          cityName: 'Tamarindo',
        },
      ],
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(aiResponse) }],
      }),
    });

    const req = makeRequest(validBody);
    const res = await POST(req as any);
    const data = await res.json();
    expect(data.recommendations).toHaveLength(1);
    expect(data.recommendations[0].name).toBe('Secret Beach');
    expect(data.recommendations[0].type).toBe('activity'); // default
    expect(data.recommendations[0].country).toBe(''); // default
  });

  it('skips Claude when ANTHROPIC_API_KEY is not set', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const aiResponse = {
      text: 'OpenAI only.',
      recommendations: [],
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(aiResponse) } }],
      }),
    });

    const req = makeRequest(validBody);
    const res = await POST(req as any);
    const data = await res.json();
    expect(data.text).toBe('OpenAI only.');
    // Only one fetch call (OpenAI), not two
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns 500 on malformed request body', async () => {
    const req = new Request('http://localhost/api/planner/chat', {
      method: 'POST',
      body: 'not valid json{{{',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });

  it('passes conversation history to AI providers', async () => {
    const history = [
      { role: 'user', content: 'Tell me about San Jose' },
      { role: 'assistant', content: 'San Jose is great!' },
      { role: 'user', content: 'What about restaurants?' },
    ];

    const aiResponse = { text: 'Great restaurants!', recommendations: [] };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(aiResponse) }],
      }),
    });

    const req = makeRequest({
      ...validBody,
      conversationHistory: history,
      userMessage: 'What about restaurants?',
    });

    await POST(req as any);

    // Verify Claude was called with conversation messages
    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toHaveLength(3);
    expect(body.messages[2].content).toBe('What about restaurants?');
  });

  it('includes existing board items in system prompt context', async () => {
    const aiResponse = { text: 'New suggestions!', recommendations: [] };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(aiResponse) }],
      }),
    });

    const req = makeRequest({
      ...validBody,
      existingBoardItems: ['Mercado Central', 'Volcano Hike'],
      previouslyShownNames: ['Secret Beach'],
    });

    await POST(req as any);

    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    // System prompt should include board items and previously shown names
    expect(body.system).toContain('Mercado Central');
    expect(body.system).toContain('Volcano Hike');
    expect(body.system).toContain('Secret Beach');
  });
});
