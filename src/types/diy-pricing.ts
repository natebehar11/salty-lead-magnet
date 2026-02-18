/**
 * DIY Pricing Types
 */

export interface DIYLineItem {
  category: string;
  description: string;
  saltyIncluded: boolean;
  saltyPrice: number;  // What SALTY charges (or 0 if included)
  diyPrice: number;    // What you'd pay doing it yourself
  perDay?: boolean;    // Is this a per-day rate?
  emoji: string;
  sourceUrl?: string;  // Link to validate the price (Airbnb, TripAdvisor, etc.)
  sourceName?: string; // Display name for the source link
}

export interface DIYComparison {
  retreatSlug: string;
  destination: string;
  retreatName: string; // Full retreat title
  nights: number;
  saltyPriceFrom: number;
  estimatedDate: string; // Month Year when prices were last verified (e.g. "February 2026")
  items: DIYLineItem[];
}
