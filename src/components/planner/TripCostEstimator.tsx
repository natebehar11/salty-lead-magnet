'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Retreat } from '@/types';
import { usePlannerStore } from '@/stores/planner-store';
import {
  calculateTripCost,
  formatEstimate,
  confidenceLabel,
  AccommodationTier,
  ACCOMMODATION_TIER_LABELS,
} from '@/lib/trip-cost-estimator';

interface TripCostEstimatorProps {
  retreat: Retreat;
}

/**
 * Collapsible trip cost breakdown panel.
 * Shows: retreat + activities + accommodation = total estimate.
 * Appears below the board/itinerary when the user has items on the board.
 */
export default function TripCostEstimator({ retreat }: TripCostEstimatorProps) {
  const boardItems = usePlannerStore((s) => s.boardItems);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tier, setTier] = useState<AccommodationTier>('mid');

  const breakdown = useMemo(
    () => calculateTripCost(boardItems, retreat, tier),
    [boardItems, retreat, tier]
  );

  // Don't show if there's nothing to estimate
  if (boardItems.length === 0) return null;

  const bookingUrl = `https://getsaltyretreats.com/retreats/${retreat.slug}`;

  return (
    <div className="border-t border-salty-beige/30">
      {/* Collapsed summary — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-salty-cream/30 transition-colors"
        aria-expanded={isExpanded}
        aria-label="Toggle trip cost breakdown"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">💰</span>
          <span className="font-display text-[11px] tracking-widest uppercase text-salty-deep-teal/60">
            Trip estimate
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-sm text-salty-deep-teal font-bold">
            ~{formatEstimate(breakdown.totalEstimate)}
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-salty-slate/40 text-xs"
          >
            ▼
          </motion.span>
        </div>
      </button>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Cost breakdown rows */}
              <div className="space-y-2">
                <CostRow
                  label="Retreat"
                  sublabel={retreat.title}
                  amount={breakdown.retreatCost}
                  highlight
                />
                {breakdown.activityCount > 0 && (
                  <CostRow
                    label="Activities"
                    sublabel={`${breakdown.activityCount} on your board`}
                    amount={breakdown.activityCost}
                  />
                )}
                {breakdown.accommodationNights > 0 && (
                  <CostRow
                    label="Accommodation"
                    sublabel={`${breakdown.accommodationNights} ${breakdown.accommodationNights === 1 ? 'night' : 'nights'} (${ACCOMMODATION_TIER_LABELS[tier].toLowerCase()})`}
                    amount={breakdown.accommodationCost}
                  />
                )}
              </div>

              {/* Divider + Total */}
              <div className="border-t border-salty-beige/40 pt-2 flex items-baseline justify-between">
                <div>
                  <span className="font-display text-xs text-salty-deep-teal uppercase tracking-wider">
                    Estimated Total
                  </span>
                  <span className="ml-2 font-body text-[10px] text-salty-slate/40">
                    {confidenceLabel(breakdown.confidence)}
                  </span>
                </div>
                <span className="font-display text-lg text-salty-deep-teal font-bold">
                  ~{formatEstimate(breakdown.totalEstimate)}
                </span>
              </div>

              {/* Days summary */}
              <p className="font-body text-[11px] text-salty-slate/40">
                ~{breakdown.totalDays} days total
                {breakdown.boardDays > 0 && (
                  <> ({breakdown.boardDays} exploring + {breakdown.retreatDays} retreat)</>
                )}
              </p>

              {/* Accommodation tier selector */}
              {breakdown.accommodationNights > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-body text-[11px] text-salty-slate/40">Stay:</span>
                  <div className="flex gap-1">
                    {(['budget', 'mid', 'luxury'] as AccommodationTier[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTier(t)}
                        className={`font-body text-[10px] px-2 py-0.5 rounded-full transition-all ${
                          tier === t
                            ? 'bg-salty-deep-teal text-white'
                            : 'bg-salty-beige/30 text-salty-slate/50 hover:bg-salty-beige/50'
                        }`}
                      >
                        {ACCOMMODATION_TIER_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-full bg-salty-deep-teal text-white font-display text-[11px] tracking-wider uppercase px-4 py-2.5 hover:bg-salty-deep-teal/90 transition-colors"
              >
                Book Your Retreat — from {formatEstimate(breakdown.retreatCost)}
              </a>

              <p className="font-body text-[10px] text-salty-slate/30 text-center">
                Flights not included · Prices are estimates for planning purposes
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Cost Row ────────────────────────────────────────────────────────

function CostRow({
  label,
  sublabel,
  amount,
  highlight = false,
}: {
  label: string;
  sublabel: string;
  amount: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <span className={`font-body text-sm ${highlight ? 'font-bold text-salty-deep-teal' : 'text-salty-deep-teal/70'}`}>
          {label}
        </span>
        <span className="font-body text-[11px] text-salty-slate/40 ml-1.5">
          {sublabel}
        </span>
      </div>
      <span className={`font-body text-sm ${highlight ? 'font-bold text-salty-deep-teal' : 'text-salty-deep-teal/70'}`}>
        {amount > 0 ? `${formatEstimate(amount)}` : '—'}
      </span>
    </div>
  );
}
