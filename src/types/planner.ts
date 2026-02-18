export interface PlannerCity {
  id: string;
  name: string;
  country: string;
  days: number;
  type: 'before' | 'after';
}

export interface ItinerarySuggestion {
  cities: { name: string; country: string; days: number; highlights: string[] }[];
  totalDays: number;
  reasoning: string;
}
