'use client';

import { useMemo } from 'react';
import { Retreat, PlannerCity } from '@/types';
import { cn } from '@/lib/utils';

interface TripConfidenceScoreProps {
  selectedRetreat: Retreat | null;
  beforeCities: PlannerCity[];
  afterCities: PlannerCity[];
  hasSuggestion: boolean;
  hasSubmittedLead: boolean;
  hasSearchedFlights: boolean;
  hasFavouritedFlights: boolean;
  hasShared: boolean;
}

interface Milestone {
  label: string;
  weight: number;
  isComplete: boolean;
}

const tiers = [
  { min: 0, max: 24, label: 'Exploring', color: 'text-salty-slate/50', ring: 'stroke-salty-beige' },
  { min: 25, max: 49, label: 'Planning', color: 'text-salty-light-blue', ring: 'stroke-salty-light-blue' },
  { min: 50, max: 79, label: 'Almost There', color: 'text-salty-gold', ring: 'stroke-salty-gold' },
  { min: 80, max: 100, label: 'Ready to Book', color: 'text-salty-orange-red', ring: 'stroke-salty-orange-red' },
] as const;

export default function TripConfidenceScore({
  selectedRetreat,
  beforeCities,
  afterCities,
  hasSuggestion,
  hasSubmittedLead,
  hasSearchedFlights,
  hasFavouritedFlights,
  hasShared,
}: TripConfidenceScoreProps) {
  const milestones: Milestone[] = useMemo(() => [
    { label: 'Choose a retreat', weight: 15, isComplete: !!selectedRetreat },
    { label: 'Add a destination before', weight: 10, isComplete: beforeCities.length > 0 },
    { label: 'Add a destination after', weight: 10, isComplete: afterCities.length > 0 },
    { label: 'Get city suggestions', weight: 10, isComplete: hasSuggestion },
    { label: 'Name all your cities', weight: 10, isComplete: [...beforeCities, ...afterCities].every((c) => c.name.length > 0) && (beforeCities.length + afterCities.length > 0) },
    { label: 'Search flights', weight: 15, isComplete: hasSearchedFlights },
    { label: 'Save favourite flights', weight: 10, isComplete: hasFavouritedFlights },
    { label: 'Save your contact info', weight: 10, isComplete: hasSubmittedLead },
    { label: 'Share with friends', weight: 5, isComplete: hasShared },
    { label: 'Book your spot', weight: 5, isComplete: false }, // Always pending until actual booking
  ], [selectedRetreat, beforeCities, afterCities, hasSuggestion, hasSubmittedLead, hasSearchedFlights, hasFavouritedFlights, hasShared]);

  const score = milestones.reduce((sum, m) => sum + (m.isComplete ? m.weight : 0), 0);
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-display text-3xl', currentTier.color)}>{score}</span>
            <span className="font-body text-[10px] text-salty-slate/40 uppercase tracking-wider">/ 100</span>
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
