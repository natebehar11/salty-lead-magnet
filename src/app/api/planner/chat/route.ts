import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRetreatBySlug } from '@/data/retreats';
import { RecommendationCard, UserTravelProfile } from '@/types/vision-board';
import { SaltyMeter } from '@/types';
import { getFallbackResponse } from '@/lib/planner-fallback';
import { buildDiscoveryPrompt } from '@/lib/discovery-messages';

const AI_TIMEOUT_MS = 15_000;

const userTravelProfileSchema = z.object({
  vibes: z.array(z.string()),
  partyVsRest: z.number(),
  groupStyle: z.string().nullable(),
  experienceLevel: z.string().nullable(),
  mustHaves: z.array(z.string()),
  hasCompletedQuiz: z.boolean(),
});

const chatRequestSchema = z.object({
  destination: z.string().min(1),
  retreatName: z.string().min(1),
  retreatSlug: z.string().min(1),
  userMessage: z.string().default(''),
  conversationHistory: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).default([]),
  existingBoardItems: z.array(z.string()).default([]),
  previouslyShownNames: z.array(z.string()).default([]),
  userProfile: userTravelProfileSchema.nullable().default(null),
  discoveryLocationChoice: z.string().nullable().optional().default(null),
  discoveryVibeChoice: z.string().nullable().optional().default(null),
  discoveryTypeChoices: z.array(z.string()).nullable().optional().default(null),
});

type ChatRequest = z.infer<typeof chatRequestSchema>;

interface ChatResponse {
  text: string;
  recommendations: RecommendationCard[];
}

function createTimeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * Retreat-specific logistics context for genuinely useful planning.
 * This is what makes the trip planner actually valuable — real info
 * people need but usually have to research across 10 tabs.
 */
const RETREAT_LOGISTICS: Record<string, string> = {
  'costa-rica-fitness-retreat': `
LOGISTICS:
- Nearest airport: SJO (Juan Santamaría International, San José)
- The retreat is on the Pacific coast. Most travelers fly into San José and either:
  (a) Spend 1-2 days exploring San José / Central Valley first
  (b) Take a domestic flight or shuttle to the coast
- Suggest San José for before-retreat exploration (markets, coffee tours, volcano hikes)
- After the retreat, suggest Arenal/La Fortuna (hot springs, volcano) or Manuel Antonio (beach + wildlife)
- Transport: Domestic flights with Sansa Airlines (~35 min), or private shuttle (3-5 hours depending on destination)`,

  'sri-lanka-fitness-retreat': `
LOGISTICS:
- Nearest airport: CMB (Bandaranaike International, Colombo)
- Sri Lanka is compact but travel is slow (winding roads). Train travel is beautiful and recommended.
- Suggest Colombo for 1-2 days before (markets, temples, food scene)
- After the retreat, suggest Ella (tea country, Nine Arch Bridge, hikes) or Galle (colonial fort, beaches)
- The famous coastal train from Colombo to Galle is one of the most scenic rides in Asia
- Tuk-tuks are the local transport; for longer distances, private drivers are affordable (~$40-60/day)`,

  'panama-fitness-retreat': `
LOGISTICS:
- Nearest airport: PTY (Tocumén International, Panama City)
- The retreat splits between Panama City and Santa Catalina beach.
- Panama City is world-class — Casco Viejo (old town), Canal, incredible dining scene
- Suggest exploring Panama City before or after. San Blas Islands are an unforgettable add-on (1-2 days)
- For adventure seekers: Boquete (coffee country, cloud forest) is a 6-hour drive or short flight
- Transport: Uber works in Panama City. Internal flights via Air Panama to David (near Boquete)`,

  'morocco-fitness-retreat': `
LOGISTICS:
- Nearest airport: AGA (Al Massira, Agadir) for Taghazout. Many fly into RAK (Marrakech) first.
- Taghazout is 20 min north of Agadir, 3 hours from Marrakech
- STRONGLY suggest Marrakech for 2-3 days before/after — it's a must-see (medina, souks, riads, food)
- After the retreat, Essaouira (coastal art town, 2.5 hrs from Marrakech) is a perfect wind-down
- For adventurous travelers: Atlas Mountains day trip or 2-day Sahara desert excursion from Marrakech
- Transport: Grand taxis between cities, or private transfers (~$50-80 between Marrakech and Taghazout)`,

  'sicily-fitness-retreat': `
LOGISTICS:
- Nearest airport: CTA (Catania-Fontanarossa). Also consider PMO (Palermo) for a road trip.
- Maria del Focallo is in southeast Sicily. Catania is ~90 min drive.
- Suggest Catania or Syracuse for 2-3 days before (Baroque architecture, street food, Etna)
- After the retreat, Palermo is incredible (markets, Arab-Norman architecture, best street food in Europe)
- A road trip across Sicily (Catania → retreat → Palermo) is highly recommended
- Transport: Rental car is the best way to explore Sicily. Trains connect major cities but are slow.
- Don't miss: Ortigia (Syracuse old town), Valley of the Temples (Agrigento), Mt. Etna hike`,

  'el-salvador-surf-retreat': `
LOGISTICS:
- Nearest airport: SAL (Óscar Arnulfo Romero International, San Salvador)
- El Salvador is compact — you can reach most surf spots within 2-3 hours of the capital
- Suggest San Salvador for 1-2 days (volcano hikes, pupusa trail, Iglesia El Rosario)
- After the retreat, suggest El Tunco or El Zonte (surf towns), or Ruta de las Flores (coffee country, waterfalls)
- El Salvador uses USD so no currency hassle
- Transport: Private shuttles between surf towns, Uber in San Salvador`,

  'costa-rica-fitness-retreat-v4': `
LOGISTICS:
- Nearest airport: SJO (Juan Santamaría International, San José)
- January is peak dry season — perfect weather, but book early
- Suggest San José or Arenal area before the retreat
- After the retreat, Monteverde Cloud Forest or Nosara (yoga/surf town) are great add-ons
- Transport: Sansa domestic flights or private shuttle services`,
};

function buildSystemPrompt(
  destination: string,
  retreatName: string,
  retreatSlug: string,
  saltyMeter: SaltyMeter | null,
  userProfile: UserTravelProfile | null,
  existingBoardItems: string[],
  previouslyShownNames: string[],
  discoveryContext?: { locationChoice: string | null; vibeChoice: string | null; typeChoices: string[] | null },
): string {
  let prompt = `You are a sharp, well-traveled TRIP PLANNER for SALTY Retreats. You help travelers plan their entire trip around their ${retreatName} retreat in ${destination}.

Your personality: warm but opinionated. You're the friend who's actually been there and knows the spots tourists miss. You have strong recommendations, not generic lists. You name specific restaurants, specific beaches, specific neighborhoods — never "check out the local food scene."

CORE CONTEXT:
- The traveler has selected the ${retreatName} retreat in ${destination}. This is the anchor of their trip.
- Your DEFAULT focus is the wrap-around trip: what to do BEFORE and AFTER the retreat in ${destination} and nearby regions.
- Think in terms of "arrive a few days early → RETREAT → explore a few days after → fly home."

CRITICAL: RESPOND TO WHAT THE USER ACTUALLY ASKS.
- If the user asks about a DIFFERENT country or destination (e.g., "What about Tokyo?", "I want to visit Bali", "suggestions for Portugal"), give them great recommendations for THAT place. You are not locked to ${destination}. Include the country they asked about in your recommendations.
- If the user asks a general question ("best beaches in the world", "where should I eat in Paris"), answer it directly with specific recommendations.
- If the user asks about logistics, flights, visas, packing, weather, or any travel topic, answer helpfully.
- If the user's message is vague or about "the trip" without specifying a place, default to ${destination} and nearby regions.
- When recommending places outside ${destination}, mention how it could fit into the overall trip timeline if relevant, but don't force it.

WRAP-AROUND TRIP (when focused on ${destination}):
- When suggesting cities near ${destination}, mention transit time from that city to the retreat.
- Suggest a natural flow: arrival city → retreat → departure city. They can be different.
- When someone asks for a "complete trip" or "full plan," suggest a 2-3 day before + 2-3 day after itinerary.

Keep your conversational text to 2-3 sentences. Be specific, confident, and genuinely helpful.`;

  // Add retreat-specific logistics
  const logistics = RETREAT_LOGISTICS[retreatSlug];
  if (logistics) {
    prompt += `\n\nLOGISTICS FOR ${destination.toUpperCase()} (use when relevant, not for every response):${logistics}`;
  }

  if (saltyMeter) {
    prompt += `

SALTY Meter: adventure=${saltyMeter.adventure} culture=${saltyMeter.culture} party=${saltyMeter.party} sweat=${saltyMeter.sweat} rest=${saltyMeter.rest} (each /10). Group: ${saltyMeter.groupSize.min}-${saltyMeter.groupSize.max}.
Complement the retreat: high dims (7+) → suggest opposite for before/after; low dims (≤3) → lean in. On emotion-driven requests, go all in on that dimension regardless of destination.`;
  }

  if (userProfile?.hasCompletedQuiz) {
    const parts = [
      userProfile.vibes.length > 0 ? `vibes: ${userProfile.vibes.join(', ')}` : null,
      `party/rest: ${userProfile.partyVsRest}/10`,
      userProfile.groupStyle ? `style: ${userProfile.groupStyle}` : null,
      userProfile.experienceLevel ? `exp: ${userProfile.experienceLevel}` : null,
      userProfile.mustHaves.length > 0 ? `must-haves: ${userProfile.mustHaves.join(', ')}` : null,
    ].filter(Boolean).join('; ');
    prompt += `\n\nTraveler profile: ${parts}. Shape picks naturally — don't list scores.`;
  }

  // Discovery context — stated preferences from the guided flow
  if (discoveryContext?.locationChoice || discoveryContext?.vibeChoice || discoveryContext?.typeChoices) {
    prompt += `\n\n${buildDiscoveryPrompt(
      retreatName,
      destination,
      discoveryContext.locationChoice,
      discoveryContext.vibeChoice,
      discoveryContext.typeChoices,
    )}`;

    // First-time trip structure suggestion when board is empty
    if (existingBoardItems.length === 0) {
      prompt += `\n\nSince this is their first set of recommendations, propose a high-level trip structure first (e.g., "3 days before in [City] → retreat → 2 days after in [City]") before diving into specific activity recommendations. Ask if the structure works before going deeper.`;
    }
  }

  if (existingBoardItems.length > 0) {
    prompt += `\n\nBoard (${existingBoardItems.length}): ${existingBoardItems.join(', ')}. Do NOT re-suggest. Complement with different categories or nearby gems. Balance before/after if lopsided.`;
  } else {
    prompt += `\n\nEmpty board — lead with an arrival city near the retreat (2-3 days), mention transit to retreat, then suggest a departure city after.`;
  }

  if (previouslyShownNames.length > 0) {
    prompt += `\n\nAlready suggested: ${previouslyShownNames.join(', ')}. Do NOT repeat — show different places.`;
  }

  prompt += `

RESPONSE FORMAT: Return valid JSON only. No markdown, no backticks.
{
  "text": "Your conversational response. 2-3 sentences. Opinionated and helpful. Ask a follow-up question when it makes sense.",
  "recommendations": [
    {
      "id": "rec-<unique>",
      "type": "city|activity|restaurant|experience",
      "cityName": "City Name",
      "country": "Country",
      "name": "Specific Place Name",
      "description": "1-2 specific sentences. Include what makes it special, practical tips (best time to go, how long to spend, insider knowledge).",
      "activityCategory": "landmark|fitness|restaurant|neighborhood|hidden-gem|outdoor|nightlife|wellness",
      "days": null,
      "priceRange": "$|$$|$$$",
      "link": "https://www.google.com/maps/search/Place+Name+City+Country",
      "imageQuery": "place name city country travel"
    }
  ]
}

RULES:
- Include 0-4 recommendations per response
- NOT every message needs cards — pure Q&A is fine with 0 recommendations
- For the FIRST message: suggest 1 city card (type: "city") for the best before/after destination near ${destination}, plus 2-3 specific activities IN that city.
- When the user asks about a DIFFERENT destination, use THAT destination's real city names, country, and places.
- Use REAL, SPECIFIC place names. "Restaurante Silvestre" not "a good restaurant." "Barrio Escalante" not "the trendy neighborhood."
- Generate Google Maps search URLs: https://www.google.com/maps/search/Place+Name+City+Country
- "priceRange" only for restaurants. "days" only for city-type recommendations.
- Prefer hidden gems and locals-know-it spots over top-10 tourist attractions
- Mix activity types — don't suggest 4 restaurants or 4 landmarks in a row
- Each description should include at least one actionable tip
- id format: "rec-" followed by a unique string
- The "country" field must be the ACTUAL country (e.g., "Japan", "France", "Thailand") — not the retreat destination unless the recommendation is actually in that country`;

  return prompt;
}

async function callClaude(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  maxTokens: number
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
      signal: createTimeoutSignal(AI_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`Claude API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Claude API call timed out');
    } else {
      console.error('Claude API call failed:', error);
    }
    return null;
  }
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  maxTokens: number
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
      signal: createTimeoutSignal(AI_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('OpenAI API call timed out');
    } else {
      console.error('OpenAI API call failed:', error);
    }
    return null;
  }
}

function parseAIResponse(text: string): ChatResponse | null {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (typeof parsed.text !== 'string') return null;

    const recommendations: RecommendationCard[] = [];
    if (Array.isArray(parsed.recommendations)) {
      for (const rec of parsed.recommendations) {
        if (rec.name && rec.cityName) {
          recommendations.push({
            id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: rec.type || 'activity',
            cityName: rec.cityName,
            country: rec.country || '',
            name: rec.name,
            description: rec.description || '',
            activityCategory: rec.activityCategory,
            days: rec.days,
            priceRange: rec.priceRange,
            link: rec.link || null,
            imageQuery: rec.imageQuery,
          });
        }
      }
    }

    return {
      text: parsed.text,
      recommendations,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = chatRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      destination,
      retreatName,
      retreatSlug,
      userMessage,
      conversationHistory,
      existingBoardItems,
      previouslyShownNames,
      userProfile,
      discoveryLocationChoice,
      discoveryVibeChoice,
      discoveryTypeChoices,
    } = parsed.data;

    // Look up retreat data server-side for saltyMeter
    const retreat = getRetreatBySlug(retreatSlug);
    const saltyMeter = retreat?.saltyMeter || null;

    const systemPrompt = buildSystemPrompt(
      destination,
      retreatName,
      retreatSlug,
      saltyMeter,
      userProfile,
      existingBoardItems,
      previouslyShownNames,
      {
        locationChoice: discoveryLocationChoice ?? null,
        vibeChoice: discoveryVibeChoice ?? null,
        typeChoices: discoveryTypeChoices ?? null,
      },
    );

    // Build messages from conversation history (last 10).
    // The client already includes the latest user message in conversationHistory,
    // so we don't append userMessage separately (avoids duplication).
    const messages: { role: string; content: string }[] = [];
    for (const msg of conversationHistory.slice(-10)) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Ensure at least one user message exists
    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      messages.push({
        role: 'user',
        content: userMessage || `I just selected the ${retreatName} retreat in ${destination}. Help me plan what to do before or after!`,
      });
    }

    // Try Claude first (increased token limit for richer responses)
    const claudeResult = await callClaude(messages, systemPrompt, 1536);
    if (claudeResult) {
      const parsed = parseAIResponse(claudeResult);
      if (parsed) {
        return NextResponse.json(parsed);
      }
      console.error('Claude returned unparseable response');
    }

    // Try OpenAI fallback
    const openAIResult = await callOpenAI(messages, systemPrompt, 1536);
    if (openAIResult) {
      const parsed = parseAIResponse(openAIResult);
      if (parsed) {
        return NextResponse.json(parsed);
      }
      console.error('OpenAI returned unparseable response');
    }

    // Smart fallback — cycles through expanded pools, filters already-shown items
    const assistantMsgCount = conversationHistory.filter((m) => m.role === 'assistant').length;
    return NextResponse.json(
      getFallbackResponse({
        destination,
        retreatName,
        existingBoardItems,
        previouslyShownNames,
        callIndex: assistantMsgCount,
      })
    );
  } catch (error) {
    console.error('Planner chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
