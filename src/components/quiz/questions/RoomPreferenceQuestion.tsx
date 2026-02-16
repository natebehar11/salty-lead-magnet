'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { RoomPreference, QuizAnswers } from '@/types/quiz';
import { cn } from '@/lib/utils';

const options: { value: RoomPreference; label: string; note: string; icon: string }[] = [
  { value: 'dorm', label: 'Dorm Style', note: 'The most social option. Shared room, single beds, instant friends.', icon: '🛏️' },
  { value: 'triple', label: 'Triple Room', note: 'Small crew energy. King + Queen in a shared suite.', icon: '👥' },
  { value: 'premium', label: 'Split or Cozy Double', note: 'Two guests, your own beds (or share one). The sweet spot.', icon: '✨' },
  { value: 'single', label: 'Private Room', note: 'Your own space to recharge. Full privacy, full comfort.', icon: '🏠' },
];

interface RoomPreferenceQuestionProps {
  onNext: () => void;
}

export default function RoomPreferenceQuestion({ onNext }: RoomPreferenceQuestionProps) {
  const { answers, setAnswer } = useQuizStore();

  const handleSelect = (value: RoomPreference) => {
    setAnswer('roomPreference', value);
    // Also map to budget range for backward compat in matching
    const roomToBudget: Record<RoomPreference, QuizAnswers['budget']> = {
      dorm: 'under-2000',
      triple: '2000-2500',
      premium: '2500-3000',
      single: '3000-plus',
    };
    setAnswer('budget', roomToBudget[value]);
    setTimeout(onNext, 300);
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        How do you like to sleep?
      </h2>
      <p className="font-body text-salty-slate/60 mb-2">Pick the vibe that feels right. This helps us match you to the best room option.</p>
      <p className="font-body text-xs text-salty-slate/40 mb-8">
        All options include accommodation, meals, activities, and coaching.
      </p>

      <div className="space-y-3 max-w-md mx-auto">
        {options.map((option) => {
          const isSelected = answers.roomPreference === option.value;
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
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <span className="font-display text-lg text-salty-deep-teal block">
                    {option.label}
                  </span>
                  <span className="font-body text-sm text-salty-slate/50">
                    {option.note}
                  </span>
                </div>
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
