'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { GroupStyle } from '@/types/quiz';
import { cn } from '@/lib/utils';

const options: { value: GroupStyle; label: string; sublabel: string }[] = [
  { value: 'solo', label: 'Just me', sublabel: '(and that\'s perfect)' },
  { value: 'couple', label: 'Me + my person', sublabel: 'Couples welcome' },
  { value: 'small-group', label: 'Small crew', sublabel: '3-5 friends' },
  { value: 'big-crew', label: 'The more the merrier', sublabel: '6+' },
];

interface GroupStyleQuestionProps {
  onNext: () => void;
}

export default function GroupStyleQuestion({ onNext }: GroupStyleQuestionProps) {
  const { answers, setAnswer } = useQuizStore();

  const handleSelect = (value: GroupStyle) => {
    setAnswer('groupStyle', value);
    setTimeout(onNext, 300);
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        Who&apos;s coming with you?
      </h2>
      <p className="font-body text-salty-slate/60 mb-8">
        65% of SALTY guests come solo. You&apos;re in good company either way.
      </p>

      <div className="space-y-3 max-w-md mx-auto">
        {options.map((option) => {
          const isSelected = answers.groupStyle === option.value;
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
                  {option.sublabel}
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
