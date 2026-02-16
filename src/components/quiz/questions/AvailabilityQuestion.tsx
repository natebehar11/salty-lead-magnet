'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { cn } from '@/lib/utils';
import Button from '@/components/shared/Button';
import { retreats } from '@/data/retreats';

const months = [
  { key: '2026-01', label: 'Jan 2026' },
  { key: '2026-02', label: 'Feb 2026' },
  { key: '2026-03', label: 'Mar 2026' },
  { key: '2026-04', label: 'Apr 2026' },
  { key: '2026-05', label: 'May 2026' },
  { key: '2026-06', label: 'Jun 2026' },
  { key: '2026-07', label: 'Jul 2026' },
  { key: '2026-08', label: 'Aug 2026' },
  { key: '2026-09', label: 'Sep 2026' },
  { key: '2026-10', label: 'Oct 2026' },
  { key: '2026-11', label: 'Nov 2026' },
  { key: '2026-12', label: 'Dec 2026' },
  { key: '2027-01', label: 'Jan 2027' },
];

function hasRetreatInMonth(monthKey: string): boolean {
  return retreats.some((r) => r.startDate.startsWith(monthKey));
}

interface AvailabilityQuestionProps {
  onNext: () => void;
}

export default function AvailabilityQuestion({ onNext }: AvailabilityQuestionProps) {
  const { answers, setAnswer } = useQuizStore();
  const selected = answers.availability;
  const isFlexible = selected.includes('flexible');

  const toggleMonth = (month: string) => {
    if (month === 'flexible') {
      setAnswer('availability', isFlexible ? [] : ['flexible']);
      return;
    }
    if (isFlexible) {
      setAnswer('availability', [month]);
      return;
    }
    if (selected.includes(month)) {
      setAnswer('availability', selected.filter((m) => m !== month));
    } else {
      setAnswer('availability', [...selected, month]);
    }
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        When can you escape?
      </h2>
      <p className="font-body text-salty-deep-teal/60 mb-8">
        Pick the months that work for you, or go flexible.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4 max-w-lg mx-auto">
        {months.map((month) => {
          const isSelected = selected.includes(month.key) || isFlexible;
          const hasRetreat = hasRetreatInMonth(month.key);
          return (
            <button
              key={month.key}
              onClick={() => toggleMonth(month.key)}
              className={cn(
                'relative p-3 rounded-xl border-2 text-center transition-all duration-200',
                'hover:shadow-sm active:scale-[0.98] text-sm',
                isSelected && !isFlexible
                  ? 'border-salty-orange-red bg-salty-orange-red/5'
                  : isFlexible
                  ? 'border-salty-gold/50 bg-salty-gold/5'
                  : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
              )}
            >
              <span className="font-body font-bold text-salty-deep-teal block">{month.label}</span>
              {hasRetreat && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-salty-orange-red mt-1" />
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => toggleMonth('flexible')}
        className={cn(
          'mb-8 px-6 py-3 rounded-full border-2 font-body font-bold text-sm transition-all',
          isFlexible
            ? 'border-salty-gold bg-salty-gold/10 text-salty-deep-teal'
            : 'border-salty-beige text-salty-deep-teal/60 hover:border-salty-deep-teal/20'
        )}
      >
        I&apos;m flexible — surprise me
      </button>

      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="inline-block w-2 h-2 rounded-full bg-salty-orange-red" />
        <span className="font-body text-xs text-salty-deep-teal/40">= retreat happening this month</span>
      </div>

      <Button onClick={onNext} disabled={selected.length === 0} size="lg">
        Next
      </Button>
    </div>
  );
}
