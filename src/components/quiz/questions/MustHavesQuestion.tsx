'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { cn } from '@/lib/utils';
import Button from '@/components/shared/Button';

const activities = [
  { value: 'surfing', label: 'Surfing', emoji: '🏄' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'nightlife', label: 'Nightlife', emoji: '🍸' },
  { value: 'hiking', label: 'Hiking', emoji: '🥾' },
  { value: 'food', label: 'Food Experiences', emoji: '🍜' },
  { value: 'culture', label: 'Cultural Tours', emoji: '🏛' },
  { value: 'fitness', label: 'Fitness', emoji: '🏋' },
  { value: 'beach', label: 'Beach Time', emoji: '🏖' },
  { value: 'photography', label: 'Photography', emoji: '📸' },
  { value: 'wellness', label: 'Wellness & Spa', emoji: '💆' },
];

interface MustHavesQuestionProps {
  onNext: () => void;
}

export default function MustHavesQuestion({ onNext }: MustHavesQuestionProps) {
  const { answers, setAnswer } = useQuizStore();
  const selected = answers.mustHaves;

  const toggleActivity = (activity: string) => {
    if (selected.includes(activity)) {
      setAnswer('mustHaves', selected.filter((a) => a !== activity));
    } else {
      setAnswer('mustHaves', [...selected, activity]);
    }
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        What absolutely needs to happen on this trip?
      </h2>
      <p className="font-body text-salty-deep-teal/60 mb-8">
        Pick your non-negotiables. Select as many as you want.
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-lg mx-auto">
        {activities.map((activity) => {
          const isSelected = selected.includes(activity.value);
          return (
            <button
              key={activity.value}
              onClick={() => toggleActivity(activity.value)}
              className={cn(
                'px-4 py-3 rounded-full border-2 transition-all duration-200',
                'hover:shadow-sm active:scale-[0.97] flex items-center gap-2',
                isSelected
                  ? 'border-salty-orange-red bg-salty-orange-red/10 text-salty-deep-teal'
                  : 'border-salty-beige bg-salty-cream text-salty-deep-teal/70 hover:border-salty-deep-teal/20'
              )}
            >
              <span>{activity.emoji}</span>
              <span className="font-body text-sm font-bold">{activity.label}</span>
            </button>
          );
        })}
      </div>

      <Button onClick={onNext} size="lg">
        {selected.length === 0 ? 'Skip — Surprise Me' : 'See My Matches'}
      </Button>
    </div>
  );
}
