'use client';

import { useQuizStore } from '@/stores/quiz-store';
import { cn } from '@/lib/utils';
import Button from '@/components/shared/Button';

const regions = [
  {
    value: 'central-america',
    label: 'Central America',
    countries: 'Costa Rica, Panama, El Salvador',
    emoji: '🌊',
  },
  {
    value: 'south-asia',
    label: 'South Asia',
    countries: 'Sri Lanka',
    emoji: '🏄',
  },
  {
    value: 'europe',
    label: 'Europe',
    countries: 'Sicily, Italy',
    emoji: '🍝',
  },
  {
    value: 'north-africa',
    label: 'North Africa',
    countries: 'Morocco',
    emoji: '🐪',
  },
];

interface RegionQuestionProps {
  onNext: () => void;
}

export default function RegionQuestion({ onNext }: RegionQuestionProps) {
  const { answers, setAnswer } = useQuizStore();
  const selected = answers.regions;
  const isSurpriseMe = selected.includes('surprise-me');

  const toggleRegion = (region: string) => {
    if (region === 'surprise-me') {
      setAnswer('regions', isSurpriseMe ? [] : ['surprise-me']);
      return;
    }
    if (isSurpriseMe) {
      setAnswer('regions', [region]);
      return;
    }
    if (selected.includes(region)) {
      setAnswer('regions', selected.filter((r) => r !== region));
    } else {
      setAnswer('regions', [...selected, region]);
    }
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-section text-salty-deep-teal mb-3">
        Where&apos;s calling your name?
      </h2>
      <p className="font-body text-salty-deep-teal/60 mb-8">
        Pick as many as you like. Or let us surprise you.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 max-w-lg mx-auto">
        {regions.map((region) => {
          const isSelected = selected.includes(region.value) || isSurpriseMe;
          return (
            <button
              key={region.value}
              onClick={() => toggleRegion(region.value)}
              className={cn(
                'p-6 rounded-2xl border-2 text-left transition-all duration-200',
                'hover:shadow-md active:scale-[0.98]',
                isSelected && !isSurpriseMe
                  ? 'border-salty-orange-red bg-salty-orange-red/5'
                  : isSurpriseMe
                  ? 'border-salty-gold/50 bg-salty-gold/5'
                  : 'border-salty-beige bg-salty-cream hover:border-salty-deep-teal/20'
              )}
            >
              <span className="text-2xl mb-2 block">{region.emoji}</span>
              <span className="font-display text-lg text-salty-deep-teal block mb-1">
                {region.label}
              </span>
              <span className="font-body text-sm text-salty-deep-teal/50">
                {region.countries}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => toggleRegion('surprise-me')}
        className={cn(
          'mb-8 px-6 py-3 rounded-full border-2 font-body font-bold text-sm transition-all',
          isSurpriseMe
            ? 'border-salty-gold bg-salty-gold/10 text-salty-deep-teal'
            : 'border-salty-beige text-salty-deep-teal/60 hover:border-salty-deep-teal/20'
        )}
      >
        Surprise me — I&apos;m open to anything
      </button>

      <div className="mt-6">
      <Button onClick={onNext} disabled={selected.length === 0} size="lg">
        Next
      </Button>
      </div>
    </div>
  );
}
