'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { cn } from '@/lib/utils';

interface SoloQuestionProps {
  onNext: () => void;
}

export default function SoloQuestion({ onNext }: SoloQuestionProps) {
  const { answers, setAnswer } = useQuizStore();

  const handleSelect = (solo: boolean) => {
    setAnswer('travelingSolo', solo);
    setTimeout(onNext, 400);
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        Are you traveling solo?
      </h2>
      <p className="font-body text-salty-deep-teal/60 mb-8">
        Either way, you&apos;re going to meet incredible people.
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        <button
          onClick={() => handleSelect(true)}
          className={cn(
            'w-full p-6 rounded-2xl border-2 text-left transition-all duration-200',
            'hover:shadow-md active:scale-[0.98]',
            answers.travelingSolo === true
              ? 'border-salty-orange-red bg-salty-orange-red/5'
              : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
          )}
        >
          <span className="font-display text-lg text-salty-deep-teal block mb-1">
            Yep, solo and excited
          </span>
          <span className="font-body text-sm text-salty-deep-teal/50">
            65% of SALTY guests travel solo. You&apos;ll have a crew by day two.
          </span>
        </button>

        <button
          onClick={() => handleSelect(false)}
          className={cn(
            'w-full p-6 rounded-2xl border-2 text-left transition-all duration-200',
            'hover:shadow-md active:scale-[0.98]',
            answers.travelingSolo === false
              ? 'border-salty-orange-red bg-salty-orange-red/5'
              : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
          )}
        >
          <span className="font-display text-lg text-salty-deep-teal block mb-1">
            Nope, bringing people
          </span>
          <span className="font-body text-sm text-salty-deep-teal/50">
            Even better. Your crew is about to get way bigger.
          </span>
        </button>
      </div>
    </div>
  );
}
