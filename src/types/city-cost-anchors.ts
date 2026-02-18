/**
 * City Cost Anchor Types
 * For "Cost of Staying Home" comparison feature
 */

export interface CityLineItem {
  emoji: string;
  category: string;
  description: string;
  cost: number;
  source: string;
  sourceUrl?: string;
}

export interface CityAnchor {
  cityId: string;
  cityName: string;
  province: string;
  country: string;
  currency: string;
  lineItems: CityLineItem[];
  totalCost: number;
  funComparison: string;
  sourceNote: string;
}
