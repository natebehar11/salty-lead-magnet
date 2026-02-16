import { NextRequest, NextResponse } from 'next/server';

interface SuggestionCity {
  name: string;
  country: string;
  days: number;
  highlights: string[];
}

interface SuggestionResponse {
  cities: SuggestionCity[];
  totalDays: number;
  reasoning: string;
}

const FALLBACK_SUGGESTIONS: Record<string, SuggestionResponse> = {
  'Costa Rica': {
    cities: [
      { name: 'San Jose', country: 'Costa Rica', days: 2, highlights: ['Central Market', 'National Museum', 'Coffee plantation tour'] },
      { name: 'Arenal', country: 'Costa Rica', days: 3, highlights: ['Volcano hike', 'Hot springs', 'Hanging bridges'] },
    ],
    totalDays: 5,
    reasoning: 'Since your retreat is on the Pacific coast, we recommend exploring the central highlands and Arenal volcano region beforehand.',
  },
  'Sri Lanka': {
    cities: [
      { name: 'Colombo', country: 'Sri Lanka', days: 2, highlights: ['Gangaramaya Temple', 'Pettah Market', 'Galle Face Green'] },
      { name: 'Sigiriya', country: 'Sri Lanka', days: 2, highlights: ['Lion Rock fortress', 'Dambulla Cave Temple', 'Safari in Minneriya'] },
    ],
    totalDays: 4,
    reasoning: 'Arrive a few days early to explore the cultural triangle before heading south to the coast.',
  },
  'Morocco': {
    cities: [
      { name: 'Marrakech', country: 'Morocco', days: 3, highlights: ['Jemaa el-Fnaa', 'Majorelle Garden', 'Medina shopping', 'Hammam spa'] },
      { name: 'Essaouira', country: 'Morocco', days: 2, highlights: ['Blue fishing port', 'Windsurfing', 'Fresh seafood market'] },
    ],
    totalDays: 5,
    reasoning: 'Start in Marrakech for the ultimate sensory experience, then wind down in coastal Essaouira before your surf retreat.',
  },
  'Sicily': {
    cities: [
      { name: 'Palermo', country: 'Italy', days: 3, highlights: ['Street food tour', 'Cathedral', 'Monreale mosaics', 'Opera'] },
      { name: 'Catania', country: 'Italy', days: 2, highlights: ['Fish market', 'Baroque architecture', 'Mt Etna day trip'] },
    ],
    totalDays: 5,
    reasoning: 'Explore western Sicily first for incredible food and architecture, then make your way east near your retreat location.',
  },
  'El Salvador': {
    cities: [
      { name: 'San Salvador', country: 'El Salvador', days: 2, highlights: ['National Palace', 'El Boqueron volcano', 'Craft markets'] },
      { name: 'Ruta de las Flores', country: 'El Salvador', days: 2, highlights: ['Coffee farms', 'Waterfalls', 'Colonial villages'] },
    ],
    totalDays: 4,
    reasoning: 'Start in the capital for a city vibe, then road trip the Ruta de las Flores before hitting the coast for your surf retreat.',
  },
  'Panama': {
    cities: [
      { name: 'Panama City', country: 'Panama', days: 3, highlights: ['Panama Canal', 'Casco Viejo', 'Biomuseo', 'Rooftop bars'] },
      { name: 'Boquete', country: 'Panama', days: 2, highlights: ['Cloud forest hike', 'Coffee tour', 'Hot springs'] },
    ],
    totalDays: 5,
    reasoning: 'Panama City is world-class skyline meets colonial charm. Then head to Boquete for coffee and cloud forests.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, retreatName, userPrompt, existingCities } = body;

    if (!destination) {
      return NextResponse.json(
        { error: 'Missing destination' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return curated fallback suggestions
    if (!apiKey) {
      console.log('[Planner AI] No ANTHROPIC_API_KEY set, using fallback suggestions');
      const fallback = FALLBACK_SUGGESTIONS[destination] || {
        cities: [
          { name: 'Explore the capital', country: destination, days: 2, highlights: ['Local markets', 'Historical sites', 'Food scene'] },
          { name: 'Day trips', country: destination, days: 3, highlights: ['Nature excursions', 'Cultural experiences', 'Local cuisine'] },
        ],
        totalDays: 5,
        reasoning: `Explore ${destination} before or after your retreat to make the most of your trip!`,
      };
      return NextResponse.json(fallback);
    }

    // Build the Claude prompt
    const systemPrompt = `You are a travel planning assistant for SALTY Retreats, a Canadian fitness retreat company. Your job is to suggest 2-3 cities travelers should visit before or after their retreat. Be specific, practical, and enthusiastic. Focus on cities that are logistically easy to reach from the retreat destination.

IMPORTANT: Respond ONLY with valid JSON matching this exact structure:
{
  "cities": [
    {
      "name": "City Name",
      "country": "Country",
      "days": 3,
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    }
  ],
  "totalDays": 5,
  "reasoning": "A 2-3 sentence explanation of why these cities complement the retreat."
}

Keep highlights to 3-4 per city. Keep totalDays between 3-7. Keep reasoning concise and exciting.`;

    const existingCitiesInfo = existingCities && existingCities.length > 0
      ? `\nThe traveler has already added these cities to their itinerary: ${existingCities.join(', ')}. Suggest different cities that complement their existing plan.`
      : '';

    const userMessage = `The traveler is going to the ${retreatName} retreat in ${destination}.${existingCitiesInfo}${userPrompt ? `\n\nTheir preferences: "${userPrompt}"` : '\n\nSuggest your top picks for cities to explore before or after the retreat.'}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      console.error(`Claude API error: ${response.status} ${response.statusText}`);
      // Fall back to curated suggestions on API error
      const fallback = FALLBACK_SUGGESTIONS[destination];
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json(
        { error: 'AI suggestion service unavailable' },
        { status: 503 }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      console.error('Claude returned empty response');
      const fallback = FALLBACK_SUGGESTIONS[destination];
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }

    // Parse the JSON response from Claude
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from Claude response:', text);
      const fallback = FALLBACK_SUGGESTIONS[destination];
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
    }

    const suggestion: SuggestionResponse = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!suggestion.cities || !Array.isArray(suggestion.cities) || suggestion.cities.length === 0) {
      const fallback = FALLBACK_SUGGESTIONS[destination];
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json({ error: 'Invalid suggestion structure' }, { status: 500 });
    }

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Planner suggest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
