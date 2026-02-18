'use client';

import { useMemo } from 'react';
import { Retreat } from '@/types/retreat';
import { PlannerCity } from '@/types/planner';
import { cn } from '@/lib/utils';

interface TripConfidenceScoreProps {
  selectedRetreat: Retreat | null;
  beforeCities: PlannerCity[];
  afterCities: PlannerCity[];
  hasSuggestion: boolean;
  hasExpandedCity: boolean;
  hasSubmittedLead: boolean;
  hasSearchedFlights: boolean;
  hasFavouritedFlights: boolean;
  hasShared: boolean;
}

interface Milestone {
  label: string;
  isComplete: boolean;
}

const tiers = [
  { min: 0, max: 24, label: 'Exploring', subtext: 'Pick a retreat to start', color: 'text-salty-slate/50', ring: 'stroke-salty-beige' },
  { min: 25, max: 49, label: 'Planning', subtext: 'Your trip is taking shape', color: 'text-salty-light-blue', ring: 'stroke-salty-light-blue' },
  { min: 50, max: 79, label: 'Almost There', subtext: 'A few more steps to go', color: 'text-salty-gold', ring: 'stroke-salty-gold' },
  { min: 80, max: 100, label: 'Ready to Book', subtext: 'Lock in your spot', color: 'text-salty-orange-red', ring: 'stroke-salty-orange-red' },
] as const;

export default function TripConfidenceScore({
  selectedRetreat,
  beforeCities,
  afterCities,
  hasSuggestion,
  hasExpandedCity,
  hasSubmittedLead,
  hasSearchedFlights,
  hasFavouritedFlights,
  hasShared,
}: TripConfidenceScoreProps) {
  const milestones: Milestone[] = useMemo(() => [
    { label: 'Choose a retreat', isComplete: !!selectedRetreat },
    { label: 'Add a destination before or after', isComplete: beforeCities.length > 0 || afterCities.length > 0 },
    { label: 'Get AI suggestions', isComplete: hasSuggestion },
    { label: 'Explore suggested activities', isComplete: hasExpandedCity },
    { label: 'Search flights', isComplete: hasSearchedFlights },
    { label: 'Select flights to save', isComplete: hasFavouritedFlights },
    { label: 'Save your contact info', isComplete: hasSubmittedLead },
    { label: 'Share with friends', isComplete: hasShared },
    { label: 'Book your spot', isComplete: false }, // Always pending until actual booking
  ], [selectedRetreat, beforeCities, afterCities, hasSuggestion, hasExpandedCity, hasSubmittedLead, hasSearchedFlights, hasFavouritedFlights, hasShared]);

  // Scoring: each of first 8 milestones = 15% (capped at 90%). "Book your spot" adds final 10%.
  const completedNonBook = milestones.slice(0, 8).filter((m) => m.isComplete).length;
  const score = Math.min(Math.round(completedNonBook * (90 / 6)), 90);
  const completedCount = milestones.filter((m) => m.isComplete).length;
  const currentTier = tiers.find((t) => score >= t.min && score <= t.max) || tiers[0];

  // SVG circle math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-salty-cream rounded-2xl border-2 border-salty-beige p-6">
      <div className="flex items-center gap-6">
        {/* Progress Ring */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              className="stroke-salty-beige"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(currentTier.ring, 'transition-all duration-700 ease-out')}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          {/* Tier label inside ring (replaces percentage) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <span className={cn('font-display text-base leading-tight', currentTier.color)}>
              {currentTier.label}
            </span>
            <span className="font-body text-[9px] text-salty-slate/40 mt-0.5 leading-tight">
              {currentTier.subtext}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex-1">
          <p className={cn('font-display text-lg', currentTier.color)}>{currentTier.label}</p>
          <p className="font-body text-sm text-salty-slate/50 mb-3">
            {completedCount} of {milestones.length} milestones
          </p>

          {/* Next incomplete milestone */}
          {(() => {
            const next = milestones.find((m) => !m.isComplete);
            if (!next) return null;
            return (
              <p className="font-body text-xs text-salty-deep-teal/60">
                Next: <span className="font-bold">{next.label}</span>
              </p>
            );
          })()}

          {score >= 80 && (
            <a
              href={selectedRetreat ? `https://getsaltyretreats.com/retreats/${selectedRetreat.slug}` : '/quiz'}
              className="inline-block mt-2 font-body text-sm font-bold text-salty-orange-red hover:underline"
            >
              Book Your Spot &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Milestone checklist */}
      <div className="mt-4 pt-4 border-t border-salty-beige/50">
        <div className="grid grid-cols-2 gap-1.5">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                'w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0',
                m.isComplete ? 'bg-salty-forest-green' : 'border border-salty-beige'
              )}>
                {m.isComplete && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={cn(
                'font-body text-xs',
                m.isComplete ? 'text-salty-slate/40 line-through' : 'text-salty-deep-teal/60'
              )}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
