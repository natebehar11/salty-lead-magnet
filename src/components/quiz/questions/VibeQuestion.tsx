'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { VibePreference } from '@/types/quiz';
import { cn } from '@/lib/utils';
import Button from '@/components/shared/Button';

const vibeOptions: { value: VibePreference; label: string; emoji: string; description: string }[] = [
  { value: 'adventure', label: 'Adventure', emoji: '🏔', description: 'I want stories, not souvenirs' },
  { value: 'culture', label: 'Culture', emoji: '🕌', description: 'Feed me history, food, and local life' },
  { value: 'party', label: 'Party', emoji: '🪩', description: 'I came to dance and make friends' },
  { value: 'fitness', label: 'Fitness', emoji: '💪', description: 'I want to sweat somewhere beautiful' },
  { value: 'rest', label: 'Rest', emoji: '🌴', description: 'Pool, book, nap, repeat' },
];

interface VibeQuestionProps {
  onNext: () => void;
}

export default function VibeQuestion({ onNext }: VibeQuestionProps) {
  const { answers, setAnswer } = useQuizStore();
  const selected = answers.vibes;

  const toggleVibe = (vibe: VibePreference) => {
    if (selected.includes(vibe)) {
      setAnswer('vibes', selected.filter((v) => v !== vibe));
    } else if (selected.length < 3) {
      setAnswer('vibes', [...selected, vibe]);
    }
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        What kind of trip makes your soul happy?
      </h2>
      <p className="font-body text-salty-slate/60 mb-8">Pick up to 3. No wrong answers.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {vibeOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleVibe(option.value)}
              className={cn(
                'relative p-6 rounded-2xl border-2 text-left transition-all duration-200',
                'hover:shadow-md active:scale-[0.98]',
                isSelected
                  ? 'border-salty-orange-red bg-salty-orange-red/5 shadow-md'
                  : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
              )}
            >
              <span className="text-3xl mb-3 block">{option.emoji}</span>
              <span className="font-display text-lg text-salty-deep-teal block mb-1">
                {option.label}
              </span>
              <span className="font-body text-sm text-salty-slate/60">
                {option.description}
              </span>
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-salty-orange-red rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={selected.length === 0}
        size="lg"
      >
        Next
      </Button>
    </div>
  );
}
