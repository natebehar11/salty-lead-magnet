/**
 * Trip Cost Estimator
 *
 * Calculates estimated total trip cost for the planner board:
 * - Retreat cost (from retreat data)
 * - Activity costs (derived from priceRange field)
 * - Accommodation estimates (per-night by region, tiered)
 * - Total days calculation (board cities + retreat duration)
 *
 * This is separate from src/lib/trip-cost.ts which handles
 * the flight-specific cost bar on the flights page.
 */

import { BoardItem } from '@/types/vision-board';
import { Retreat } from '@/types';

// ── Price Range → Dollar Estimate ──────────────────────────────────

/** Estimated per-person cost for each price tier */
const PRICE_RANGE_ESTIMATES: Record<string, number> = {
  '$': 15,
  '$$': 45,
  '$$$': 100,
};

// ── Accommodation Estimates ────────────────────────────────────────

export type AccommodationTier = 'budget' | 'mid' | 'luxury';

/** Per-night accommodation rates (USD) by region and tier */
const ACCOMMODATION_RATES: Record<string, Record<AccommodationTier, number>> = {
  'Costa Rica': { budget: 30, mid: 70, luxury: 150 },
  'Sri Lanka': { budget: 20, mid: 50, luxury: 120 },
  'Panama': { budget: 35, mid: 80, luxury: 170 },
  'Morocco': { budget: 25, mid: 60, luxury: 140 },
  'Sicily': { budget: 40, mid: 90, luxury: 200 },
  'Italy': { budget: 40, mid: 90, luxury: 200 },
  'El Salvador': { budget: 20, mid: 45, luxury: 100 },
};

const DEFAULT_ACCOMMODATION_RATE: Record<AccommodationTier, number> = {
  budget: 30,
  mid: 70,
  luxury: 150,
};

// ── Types ──────────────────────────────────────────────────────────

export interface TripCostBreakdown {
  /** Retreat starting price */
  retreatCost: number;
  /** Estimated activity costs from board items */
  activityCost: number;
  /** Number of activities with a priced estimate */
  activityCount: number;
  /** Estimated accommodation for non-retreat days */
  accommodationCost: number;
  /** Number of nights accommodation is estimated for */
  accommodationNights: number;
  /** Total estimated trip cost */
  totalEstimate: number;
  /** How confident we are in the estimate */
  confidence: 'low' | 'medium' | 'high';
  /** Accommodation tier used */
  accommodationTier: AccommodationTier;
  /** Total trip days (board cities + retreat) */
  totalDays: number;
  /** Days from board cities only */
  boardDays: number;
  /** Retreat duration in days */
  retreatDays: number;
}

// ── Main Calculation ───────────────────────────────────────────────

export function calculateTripCost(
  boardItems: BoardItem[],
  retreat: Retreat,
  accommodationTier: AccommodationTier = 'mid'
): TripCostBreakdown {
  const retreatCost = retreat.lowestPrice || 0;
  const retreatDays = retreat.duration?.days || 7;
  const destination = retreat.destination;

  // Calculate activity costs from priceRange
  let activityCost = 0;
  let activityCount = 0;
  for (const item of boardItems) {
    if (item.type !== 'city' && item.priceRange) {
      const estimate = PRICE_RANGE_ESTIMATES[item.priceRange];
      if (estimate) {
        activityCost += estimate;
        activityCount++;
      }
    }
  }

  // Calculate total board days (from city items only)
  let boardDays = 0;
  for (const item of boardItems) {
    if (item.type === 'city' && item.days) {
      boardDays += item.days;
    }
  }

  // Accommodation for non-retreat days
  const accommodationNights = boardDays;
  const rates = ACCOMMODATION_RATES[destination] || DEFAULT_ACCOMMODATION_RATE;
  const perNight = rates[accommodationTier];
  const accommodationCost = accommodationNights * perNight;

  // Total
  const totalDays = boardDays + retreatDays;
  const totalEstimate = retreatCost + activityCost + accommodationCost;

  // Confidence based on how much data we have
  let confidence: TripCostBreakdown['confidence'] = 'low';
  if (boardDays > 0 && activityCount >= 2) {
    confidence = 'medium';
  }
  if (boardDays >= 3 && activityCount >= 4) {
    confidence = 'high';
  }

  return {
    retreatCost,
    activityCost,
    activityCount,
    accommodationCost,
    accommodationNights,
    totalEstimate,
    confidence,
    accommodationTier,
    totalDays,
    boardDays,
    retreatDays,
  };
}

// ── Formatting Helpers ─────────────────────────────────────────────

export function formatEstimate(amount: number): string {
  if (amount === 0) return '$0';
  return `$${amount.toLocaleString()}`;
}

export function confidenceLabel(confidence: TripCostBreakdown['confidence']): string {
  switch (confidence) {
    case 'high':
      return 'Good estimate';
    case 'medium':
      return 'Rough estimate';
    case 'low':
      return 'Very rough estimate';
  }
}

export const ACCOMMODATION_TIER_LABELS: Record<AccommodationTier, string> = {
  budget: 'Budget',
  mid: 'Mid-Range',
  luxury: 'Luxury',
};
