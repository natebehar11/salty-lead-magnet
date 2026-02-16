'use client';

import { useQuizStore } from '@/stores/quiz-store';
import Button from '@/components/shared/Button';

interface PartyRestQuestionProps {
  onNext: () => void;
}

export default function PartyRestQuestion({ onNext }: PartyRestQuestionProps) {
  const { answers, setAnswer } = useQuizStore();
  const value = answers.partyVsRest;

  const labels = [
    '', // 0 - not used
    'Pure zen',
    'Mostly chill',
    'Relaxed vibes',
    'Easy going',
    'Perfect balance',
    'Leaning social',
    'Fun-forward',
    'Party curious',
    'Let\'s go out',
    'Full send',
  ];

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        On a scale of &apos;zen garden&apos; to &apos;dance floor&apos;...
      </h2>
      <p className="font-body text-salty-deep-teal/60 mb-12">
        Where do you fall?
      </p>

      <div className="max-w-md mx-auto mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-sm text-salty-deep-teal/60">Ommmmm</span>
          <span className="font-body text-sm text-salty-deep-teal/60">LET&apos;S GOOO</span>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => setAnswer('partyVsRest', parseInt(e.target.value))}
          className="w-full"
        />

        <div className="flex items-center justify-between mt-2">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={`font-body text-xs ${
                i + 1 === value ? 'text-salty-orange-red font-bold' : 'text-salty-deep-teal/30'
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      <p className="font-display text-xl text-salty-orange-red mb-8">
        {labels[value]}
      </p>

      <Button onClick={onNext} size="lg">
        Next
      </Button>
    </div>
  );
}
