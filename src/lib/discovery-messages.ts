/**
 * Guided discovery flow — scripted messages, options, and prompt builder.
 *
 * Three layers of questions (Location → Vibe → Types) are served as scripted
 * messages with tappable options. No API calls until discovery completes.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DiscoveryStage = 'greeting' | 'location' | 'vibe' | 'types' | 'complete';

export interface DiscoveryOption {
  label: string;
  emoji: string;
  value: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Layer 1 — Location Scope
// ---------------------------------------------------------------------------

export function getLocationMessage(retreatTitle: string, destination: string): string {
  return `You picked ${retreatTitle}! 🎉 Before I start finding spots, where do you want to explore around your trip to ${destination}?`;
}

export function getLocationOptions(destination: string): DiscoveryOption[] {
  return [
    { label: `Explore more of ${destination}`, emoji: '🗺', value: 'explore-same' },
    { label: 'Visit a nearby country', emoji: '✈️', value: 'nearby-country' },
    { label: 'I have places in mind', emoji: '📍', value: 'specific-places' },
    { label: 'Both — mix it up', emoji: '🌍', value: 'both' },
    { label: 'Help me explore!', emoji: '✨', value: 'surprise' },
  ];
}

/**
 * Formats the raw location choice value into a human-readable string for the
 * system prompt sent to the AI.
 */
export function formatLocationChoice(value: string, destination: string): string {
  switch (value) {
    case 'explore-same':
      return `wants to explore more of ${destination}`;
    case 'nearby-country':
      return `wants to visit a country near ${destination}`;
    case 'specific-places':
      // When "specific-places" is selected, the actual text typed replaces the value
      // before reaching formatLocationChoice, so this is the fallback.
      return 'has specific places in mind';
    case 'both':
      return `wants to explore ${destination} and nearby countries`;
    case 'surprise':
      return 'is open to exploring anywhere near the retreat';
    default:
      // Custom text typed by the user (from "specific-places" or freeform input)
      return `wants to explore: ${value}`;
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — Vibe
// ---------------------------------------------------------------------------

export function getVibeMessage(locationChoice: string, destination: string, isSurprise: boolean): string {
  if (isSurprise) {
    return `Love it — I'll find the best of what's around ${destination}! What vibe are you going for on this trip?`;
  }

  switch (locationChoice) {
    case 'explore-same':
      return `Great choice — ${destination} has so much to offer! What vibe are you going for?`;
    case 'nearby-country':
      return `Awesome, I know some amazing spots near ${destination}! What vibe are you going for?`;
    case 'both':
      return `Love the ambition — let's mix it up! What vibe are you going for?`;
    default:
      return `Got it! What vibe are you going for on this trip?`;
  }
}

export function getVibeOptions(): DiscoveryOption[] {
  return [
    { label: 'Chill & relax', emoji: '🌴', value: 'chill-relax' },
    { label: 'Explore & sightsee', emoji: '🏛', value: 'explore-sightsee' },
    { label: 'Adventure & adrenaline', emoji: '🤙', value: 'adventure-adrenaline' },
    { label: 'Party & nightlife', emoji: '🪩', value: 'party-nightlife' },
    { label: 'Mix of everything', emoji: '🎨', value: 'mix-everything' },
    { label: "I'm not sure — surprise me", emoji: '🤷', value: 'surprise' },
  ];
}

export function formatVibeChoice(value: string): string {
  switch (value) {
    case 'chill-relax':
      return 'wants a chill, relaxing trip';
    case 'explore-sightsee':
      return 'wants to explore and sightsee';
    case 'adventure-adrenaline':
      return 'wants adventure and adrenaline';
    case 'party-nightlife':
      return 'wants party and nightlife';
    case 'mix-everything':
      return 'wants a mix of everything';
    case 'surprise':
      return 'is open to all vibes';
    default:
      return `wants: ${value}`;
  }
}

// ---------------------------------------------------------------------------
// Layer 3 — Types of Recommendations (multi-select)
// ---------------------------------------------------------------------------

export function getTypesMessage(vibeChoice: string, isSurprise: boolean): string {
  if (isSurprise || vibeChoice === 'surprise') {
    return "I'll keep it fun and open! Last thing — what kind of recommendations do you want? Pick all that sound good.";
  }

  switch (vibeChoice) {
    case 'chill-relax':
      return "Relaxation mode — I'm into it. What kind of spots should I find for you? Pick all that apply.";
    case 'explore-sightsee':
      return "Explorer vibes! What kind of recommendations do you want? Pick all that apply.";
    case 'adventure-adrenaline':
      return "Adrenaline junkie — love it. What should I help you find? Pick all that apply.";
    case 'party-nightlife':
      return "Party mode activated! What kind of spots do you need? Pick all that apply.";
    case 'mix-everything':
      return "A little bit of everything — my kind of trip. What should I focus on? Pick all that apply.";
    default:
      return "Almost there! What kind of recommendations do you want? Pick all that apply.";
  }
}

export function getTypesOptions(): DiscoveryOption[] {
  return [
    { label: 'Restaurants & Food', emoji: '🍽', value: 'restaurants', description: 'Local eats, cafes, street food' },
    { label: 'Beaches & Surf', emoji: '🏄', value: 'beaches', description: 'Coastline, surf breaks, beach clubs' },
    { label: 'Landmarks & Culture', emoji: '🏛', value: 'landmarks', description: 'Museums, temples, historic sites' },
    { label: 'Outdoor Adventures', emoji: '🌿', value: 'outdoors', description: 'Hiking, diving, nature tours' },
    { label: 'Nightlife & Bars', emoji: '🌙', value: 'nightlife', description: 'Bars, clubs, live music' },
    { label: 'Wellness & Spa', emoji: '🧘', value: 'wellness', description: 'Spas, yoga, hammams' },
    { label: 'Hidden Gems', emoji: '💎', value: 'hidden-gems', description: 'Off-the-beaten-path finds' },
    { label: 'Where to Stay', emoji: '🏨', value: 'accommodation', description: 'Hotels, riads, hostels' },
  ];
}

/** All type option values, used for "Show me everything" */
export const ALL_TYPE_VALUES = getTypesOptions().map((o) => o.value);

export function formatTypeChoices(values: string[]): string {
  const labelMap: Record<string, string> = {
    restaurants: 'restaurants & food',
    beaches: 'beaches & surf',
    landmarks: 'landmarks & culture',
    outdoors: 'outdoor adventures',
    nightlife: 'nightlife & bars',
    wellness: 'wellness & spa',
    'hidden-gems': 'hidden gems',
    accommodation: 'where to stay',
  };

  const labels = values.map((v) => labelMap[v] || v);

  if (labels.length === ALL_TYPE_VALUES.length) {
    return 'wants recommendations for everything';
  }

  if (labels.length === 1) return `looking for ${labels[0]}`;
  if (labels.length === 2) return `looking for ${labels[0]} and ${labels[1]}`;

  return `looking for ${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Combined Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Builds the combined discovery prompt injected into the system prompt when
 * the AI is first called after discovery completes.
 */
export function buildDiscoveryPrompt(
  retreatTitle: string,
  destination: string,
  locationChoice: string | null,
  vibeChoice: string | null,
  typeChoices: string[] | null,
): string {
  const parts: string[] = [];
  parts.push(`TRAVELER'S STATED PREFERENCES:`);

  if (locationChoice) {
    parts.push(`- Location scope: ${formatLocationChoice(locationChoice, destination)}`);
  }
  if (vibeChoice) {
    parts.push(`- Desired vibe: ${formatVibeChoice(vibeChoice)}`);
  }
  if (typeChoices && typeChoices.length > 0) {
    parts.push(`- Looking for: ${formatTypeChoices(typeChoices)}`);
  }

  parts.push(`Lean into these preferences when making recommendations for their trip around ${retreatTitle}.`);
  parts.push(`They told you this directly — treat it as their stated intent, not a guess.`);

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Option label lookup (for rendering user-facing messages)
// ---------------------------------------------------------------------------

const LOCATION_LABEL_MAP: Record<string, string> = Object.fromEntries(
  // destination-independent values only; getLocationOptions() is called with dest
  [
    ['explore-same', 'Explore more of the area'],
    ['nearby-country', 'Visit a nearby country'],
    ['specific-places', 'I have places in mind'],
    ['both', 'Both — mix it up'],
    ['surprise', 'Help me explore!'],
  ],
);

const VIBE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  getVibeOptions().map((o) => [o.value, o.label]),
);

const TYPE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  getTypesOptions().map((o) => [o.value, o.label]),
);

/**
 * Returns a human-readable label for a discovery option value.
 * Falls back to the raw value for custom text.
 */
export function getOptionLabel(
  stage: 'location' | 'vibe' | 'types',
  value: string,
  destination?: string,
): string {
  switch (stage) {
    case 'location': {
      if (value === 'explore-same' && destination) {
        return `Explore more of ${destination}`;
      }
      return LOCATION_LABEL_MAP[value] || value;
    }
    case 'vibe':
      return VIBE_LABEL_MAP[value] || value;
    case 'types':
      return TYPE_LABEL_MAP[value] || value;
  }
}
