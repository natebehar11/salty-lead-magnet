'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { ExperienceLevel } from '@/types';
import { cn } from '@/lib/utils';

const options: { value: ExperienceLevel; label: string; sublabel: string }[] = [
  {
    value: 'first-timer',
    label: 'This would be my first group trip',
    sublabel: 'That\'s exactly how most of us started. You\'re going to love it.',
  },
  {
    value: 'few-trips',
    label: 'I\'ve done a few trips',
    sublabel: 'Perfect. You know the vibe. Now upgrade the experience.',
  },
  {
    value: 'seasoned',
    label: 'I\'ve got stamps for days',
    sublabel: 'Welcome back, traveler. We\'ve got something new for you.',
  },
];

interface ExperienceQuestionProps {
  onNext: () => void;
}

export default function ExperienceQuestion({ onNext }: ExperienceQuestionProps) {
  const { answers, setAnswer } = useQuizStore();

  const handleSelect = (value: ExperienceLevel) => {
    setAnswer('experienceLevel', value);
    setTimeout(onNext, 300);
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        How well-traveled are you?
      </h2>
      <p className="font-body text-salty-deep-teal/60 mb-8">
        There&apos;s no wrong answer here. All roads lead to SALTY.
      </p>

      <div className="space-y-3 max-w-md mx-auto">
        {options.map((option) => {
          const isSelected = answers.experienceLevel === option.value;
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
              <span className="font-display text-lg text-salty-deep-teal block mb-1">
                {option.label}
              </span>
              <span className="font-body text-sm text-salty-deep-teal/50">
                {option.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
