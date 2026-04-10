/**
 * Smart fallback response generator for the planner chat.
 *
 * When both Claude and OpenAI fail, we serve curated recommendations
 * from a static pool, cycling through cities on successive calls and
 * filtering out items the user has already seen.
 */

import { RecommendationCard } from '@/types/vision-board';
import { FALLBACK_POOLS, FallbackPool } from '@/data/planner-fallbacks';

export interface FallbackOptions {
  destination: string;
  retreatName: string;
  existingBoardItems: string[];
  previouslyShownNames: string[];
  callIndex: number;
}

export interface FallbackResponse {
  text: string;
  recommendations: RecommendationCard[];
}

/**
 * Returns a curated fallback response for a destination.
 *
 * - Groups items by city and rotates cities across successive `callIndex` values
 * - Filters out items that are already on the board or have been previously shown
 * - Adds timestamped IDs to avoid React key collisions
 * - Falls back to a generic response for unknown destinations
 */
export function getFallbackResponse(opts: FallbackOptions): FallbackResponse {
  const { destination, retreatName, existingBoardItems, previouslyShownNames, callIndex } = opts;

  const pool: FallbackPool | undefined = FALLBACK_POOLS[destination];

  // Unknown destination — return a helpful generic response with a placeholder recommendation
  if (!pool) {
    return {
      text: `I don't have curated recommendations for ${destination} yet, but I'd love to help you explore! Tell me what kind of experiences you're after — adventure, food, culture, relaxation — and I'll find the best spots for you.`,
      recommendations: [
        {
          id: `generic-${destination}-${Date.now()}-0`,
          type: 'city',
          cityName: destination,
          country: destination,
          name: destination,
          description: `Explore ${destination} and discover what it has to offer.`,
          days: 3,
          imageQuery: destination,
        },
      ],
    };
  }

  // Build exclude set (case-insensitive)
  const excludeSet = new Set(
    [...existingBoardItems, ...previouslyShownNames].map((n) => n.toLowerCase()),
  );

  // Filter available items
  const available = pool.recommendations.filter(
    (r) => !excludeSet.has(r.name.toLowerCase()),
  );

  // Group available items by city
  const cityMap = new Map<string, RecommendationCard[]>();
  for (const rec of available) {
    const key = rec.cityName;
    if (!cityMap.has(key)) cityMap.set(key, []);
    cityMap.get(key)!.push(rec);
  }
  const cityKeys = Array.from(cityMap.keys());

  // Pick the city for this call (round-robin)
  let recommendations: RecommendationCard[] = [];
  if (cityKeys.length > 0) {
    const cityIndex = callIndex % cityKeys.length;
    const cityName = cityKeys[cityIndex];
    recommendations = cityMap.get(cityName) || [];
  }

  // Timestamp IDs to prevent React key collisions
  const now = Date.now();
  recommendations = recommendations.map((r, i) => ({
    ...r,
    id: `${r.id}-${now}-${i}`,
  }));

  // Pick intro vs follow-up text
  const texts = callIndex === 0 ? pool.introTexts : pool.followUpTexts;
  const textIndex = callIndex === 0 ? 0 : (callIndex - 1) % texts.length;
  const text =
    recommendations.length > 0
      ? texts[textIndex] || texts[0]
      : `I've shown you all the spots I know for ${retreatName}! Try asking me about something specific — "best street food" or "hidden gems" — and I'll see what I can find.`;

  return { text, recommendations };
}
