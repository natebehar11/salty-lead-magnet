'use client';

import { motion } from 'motion/react';
import { Retreat } from '@/types';
import { formatDateRange } from '@/lib/utils';

interface RetreatSelectorProps {
  retreats: Retreat[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export default function RetreatSelector({ retreats, selectedSlug, onSelect }: RetreatSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Select a retreat">
      {retreats.map((retreat) => {
        const isSelected = selectedSlug === retreat.slug;
        return (
          <motion.button
            key={retreat.slug}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(retreat.slug)}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${retreat.destination} — ${retreat.title}`}
            className={`relative rounded-2xl px-5 py-4 text-left transition-colors duration-200 ${
              isSelected
                ? 'bg-salty-deep-teal text-white ring-2 ring-salty-coral'
                : 'bg-surface-base text-salty-deep-teal'
            }`}
            style={{ boxShadow: isSelected ? 'var(--shadow-card-hover)' : 'var(--shadow-card-resting)' }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = 'var(--shadow-card-resting)'; }}
          >
            <div className="font-display text-sm tracking-wider uppercase">
              {retreat.destination}
            </div>
            <div className="font-body text-xs mt-1 opacity-70">
              {retreat.title} &middot; {formatDateRange(retreat.startDate, retreat.endDate)}
            </div>
            {isSelected && (
              <motion.div
                layoutId="retreat-check"
                className="absolute top-3 right-3 size-5 rounded-full bg-salty-seafoam flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6L5 9L10 3" stroke="#0E3A2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
