/**
 * DIY Pricing Types
 */

export interface DIYLineItem {
  category: string;
  description: string;
  saltyIncluded: boolean;
  saltyPrice: number;  // What SALTY charges (or 0 if included)
  diyPrice: number;    // What you'd pay doing it yourself
  emoji: string;
  sourceUrl?: string;  // Primary durable search/category URL that won't break
  sourceName?: string; // Display name for the source link
  methodology?: string; // 1-2 sentence explanation of how the price was researched
}

export interface DIYComparison {
  retreatSlug: string;
  destination: string;
  retreatName: string; // Full retreat title
  nights: number;
  /** @deprecated Derive from getRetreatBySlug(retreatSlug).lowestPrice instead */
  saltyPriceFrom: number;
  estimatedDate: string; // ISO date string e.g. "2026-02-09"
  estimatedPlanningHours: number; // Hours you'd spend planning a DIY version of this trip
  roomTierNote?: string; // If comparing against a non-dorm tier, explain which tier
  items: DIYLineItem[];
}
