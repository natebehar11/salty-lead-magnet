export interface PlannerCity {
  id: string;
  name: string;
  country: string;
  days: number;
  type: 'before' | 'after';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type ActivityCategory =
  | 'landmark'
  | 'fitness'
  | 'restaurant'
  | 'neighborhood'
  | 'hidden-gem'
  | 'outdoor';

export interface SuggestedActivity {
  name: string;
  category: ActivityCategory;
  description: string;
  link: string | null;
  priceRange?: '$' | '$$' | '$$$';
}

export interface SuggestedCity {
  id: string;
  name: string;
  country: string;
  days: number;
  description?: string;
  activities: SuggestedActivity[];
  highlights?: string[]; // backward compat with old localStorage data
}

export interface ItinerarySuggestion {
  cities: SuggestedCity[];
  totalDays: number;
  reasoning: string;
}
