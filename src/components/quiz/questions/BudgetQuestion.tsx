'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { BudgetRange, RoomPreference } from '@/types';
import { useCurrencyStore } from '@/stores/currency-store';
import { cn } from '@/lib/utils';

const budgetToRoom: Record<BudgetRange, RoomPreference> = {
  'under-2000': 'dorm',
  '2000-2400': 'triple',
  '2300-2800': 'premium',
  '2800-plus': 'single',
};

interface BudgetOption {
  value: BudgetRange;
  label: string;
  thresholds: { low: number; high: number | null };
  roomType: string;
  description: string;
}

const options: BudgetOption[] = [
  {
    value: 'under-2000',
    label: '<$1,999',
    thresholds: { low: 0, high: 1999 },
    roomType: 'Dorm or Shared Accommodations.',
    description:
      "This is for people who want to get on the trip first and foremost. You're prioritizing the experience over the room \u2014 and honestly, you'll barely be in it. You'll be too busy surfing, training, and making lifelong friends.",
  },
  {
    value: '2000-2400',
    label: '$2,000 \u2013 $2,399',
    thresholds: { low: 2000, high: 2399 },
    roomType: 'Triple or Standard Double.',
    description:
      'You want the experience AND a bit more comfort. Share a room with one or two others, but still have quality beds and space to recharge. Best of both worlds.',
  },
  {
    value: '2300-2800',
    label: '$2,300 \u2013 $2,799',
    thresholds: { low: 2300, high: 2799 },
    roomType: 'Premium Doubles.',
    description:
      'Comfort is key for you. You want a quality room that feels like a real vacation. Expect upgraded bedding, better views, and the space to unwind after big days.',
  },
  {
    value: '2800-plus',
    label: '$2,800+',
    thresholds: { low: 2800, high: null },
    roomType: 'Single Room.',
    description:
      "Traveling solo and want your own space? This is for you. Full privacy, your own bathroom, and a room that's all yours. Recharge on your terms.",
  },
];

function formatRangeLabel(option: BudgetOption, currency: string, rate: number): string {
  if (currency === 'USD' || rate === 1) return option.label;

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount * rate));

  const { low, high } = option.thresholds;

  if (low === 0 && high !== null) return `<${fmt(high)}`;
  if (high === null) return `${fmt(low)}+`;
  return `${fmt(low)} \u2013 ${fmt(high)}`;
}

interface BudgetQuestionProps {
  onNext: () => void;
}

export default function BudgetQuestion({ onNext }: BudgetQuestionProps) {
  const { answers, setAnswer } = useQuizStore();
  const { selectedCurrency, rates } = useCurrencyStore();
  const rate = rates[selectedCurrency] || 1;
  const isConverted = selectedCurrency !== 'USD' && rate !== 1;

  const handleSelect = (value: BudgetRange) => {
    setAnswer('budget', value);
    setAnswer('roomPreference', budgetToRoom[value]);
    setTimeout(onNext, 300);
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        What&apos;s your budget?
      </h2>
      <p className="font-body text-salty-slate/60 mb-2">
        This helps us find retreats that fit your travel style and comfort level.
      </p>
      <p className="font-body text-xs text-salty-slate/40 mb-8">
        All options include accommodation, meals, activities, and coaching.
      </p>

      <div className="space-y-3 max-w-md mx-auto">
        {options.map((option) => {
          const isSelected = answers.budget === option.value;
          const rangeLabel = formatRangeLabel(option, selectedCurrency, rate);

          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full p-5 rounded-2xl border-2 text-left transition-all duration-200',
                'hover:shadow-md active:scale-[0.98]',
                isSelected
                  ? 'border-salty-orange-red bg-salty-orange-red/5'
                  : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="font-display text-lg text-salty-deep-teal block">
                    {rangeLabel}
                  </span>
                  {isConverted && (
                    <span className="font-body text-[10px] text-salty-slate/40 block">
                      {option.label} USD
                    </span>
                  )}
                  <span className="font-body text-sm font-bold text-salty-deep-teal/80 block mt-1">
                    {option.roomType}
                  </span>
                  <span className="font-body text-sm text-salty-slate/50 block mt-0.5 leading-relaxed">
                    {option.description}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-salty-orange-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
