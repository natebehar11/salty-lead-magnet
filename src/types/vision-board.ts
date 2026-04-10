// --- Vision Board Types ---
// Used by the Trip Planner v2 chat-first flow

export type BoardItemCategory =
  | 'city'
  | 'activity'
  | 'restaurant'
  | 'experience';

export type ActivityCategoryV2 =
  | 'landmark'
  | 'fitness'
  | 'restaurant'
  | 'neighborhood'
  | 'hidden-gem'
  | 'outdoor'
  | 'nightlife'
  | 'wellness';

export interface BoardItem {
  id: string;
  type: BoardItemCategory;
  cityName: string;
  country: string;
  name: string;
  description: string;
  activityCategory?: ActivityCategoryV2;
  days?: number;
  priceRange?: '$' | '$$' | '$$$';
  link?: string | null;
  imageUrl?: string | null;
  addedAt: number;
  sourceMessageId: string;
}

/** Computed grouping of board items by city — not stored, derived from flat BoardItem[] */
export interface BoardCityGroup {
  cityName: string;
  country: string;
  days: number;
  imageUrl: string | null;
  items: BoardItem[];
}

/** Country containing one or more city groups — derived, not stored */
export interface BoardCountryGroup {
  country: string;
  cities: BoardCityGroup[];
}

/** Discriminated union for top-level reorderable items on the vision board */
export type TopLevelBoardItem =
  | { kind: 'country'; country: string }
  | { kind: 'retreat' };

/** Board display mode — dream board (visual/aspirational) or itinerary (timeline) */
export type BoardViewMode = 'dream' | 'itinerary';

/** Whether a city falls before or after the retreat in the itinerary timeline */
export type CityPosition = 'before' | 'after';

// --- Chat Types (V2) ---

export interface RecommendationCard {
  id: string;
  type: BoardItemCategory;
  cityName: string;
  country: string;
  name: string;
  description: string;
  activityCategory?: ActivityCategoryV2;
  days?: number;
  priceRange?: '$' | '$$' | '$$$';
  link?: string | null;
  imageQuery?: string;
}

export interface ChatMessageV2 {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: RecommendationCard[];
  timestamp: number;
  /** When true, this message is hidden from the UI but kept in conversation history */
  isAutoGreeting?: boolean;
}

// --- Personalization Bridge ---

export interface UserTravelProfile {
  vibes: string[];
  partyVsRest: number;
  groupStyle: string | null;
  experienceLevel: string | null;
  mustHaves: string[];
  hasCompletedQuiz: boolean;
}

// Shared plan types (SharedBoardItemData, SharedPlanV2, SharedReaction, SharedPlanFriend)
// are canonical in @/lib/shared-plans — import from there.
