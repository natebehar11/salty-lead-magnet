'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { BudgetRange } from '@/types';
import { cn } from '@/lib/utils';

const options: { value: BudgetRange; label: string; note: string }[] = [
  { value: 'under-2000', label: 'Under $2,000', note: 'Our most affordable options' },
  { value: '2000-2500', label: '$2,000 - $2,500', note: 'Most popular range' },
  { value: '2500-3000', label: '$2,500 - $3,000', note: 'More room options' },
  { value: '3000-plus', label: '$3,000+', note: 'Premium experience' },
];

interface BudgetQuestionProps {
  onNext: () => void;
}

export default function BudgetQuestion({ onNext }: BudgetQuestionProps) {
  const { answers, setAnswer } = useQuizStore();

  const handleSelect = (value: BudgetRange) => {
    setAnswer('budget', value);
    setTimeout(onNext, 300);
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        Let&apos;s talk money.
      </h2>
      <p className="font-body text-salty-slate/60 mb-2">No judgment. Just helps us find the right fit.</p>
      <p className="font-body text-xs text-salty-slate/40 mb-8">
        This covers accommodation, meals, activities, and coaching. Flights are separate.
      </p>

      <div className="space-y-3 max-w-md mx-auto">
        {options.map((option) => {
          const isSelected = answers.budget === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full p-5 rounded-2xl border-2 text-left transition-all duration-200',
                'hover:shadow-md active:scale-[0.98] flex items-center justify-between',
                isSelected
                  ? 'border-salty-orange-red bg-salty-orange-red/5'
                  : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
              )}
            >
              <div>
                <span className="font-display text-lg text-salty-deep-teal block">
                  {option.label}
                </span>
                <span className="font-body text-sm text-salty-slate/50">
                  {option.note}
                </span>
              </div>
              {isSelected && (
                <div className="w-6 h-6 bg-salty-orange-red rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
