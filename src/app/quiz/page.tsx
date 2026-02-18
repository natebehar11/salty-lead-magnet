'use client';

import { useState } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import QuizContainer from '@/components/quiz/QuizContainer';
import Button from '@/components/shared/Button';
import { motion } from 'framer-motion';

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const { reset, isComplete } = useQuizStore();

  const handleStart = () => {
    reset();
    setStarted(true);
  };

  if (started || isComplete) {
    return <QuizContainer />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-salty-cream">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-xl"
      >
        <p className="font-body text-sm text-salty-orange-red font-bold uppercase tracking-widest mb-4">
          The SALTY Trip Matcher
        </p>
        <h1 className="font-display text-hero text-salty-deep-teal mb-6">
          Find your perfect trip.
        </h1>
        <p className="font-body text-lg text-salty-deep-teal mb-4 leading-relaxed">
          Answer 7 quick questions and we&apos;ll match you with the SALTY retreat
          that fits your vibe, budget, and schedule.
        </p>
        <p className="font-body text-sm text-salty-deep-teal mb-8">
          Takes about 2 minutes. No wrong answers. Seriously.
        </p>
        <Button onClick={handleStart} size="lg">
          Let&apos;s Go
        </Button>

        <div className="mt-12 flex items-center justify-center gap-10 text-center">
          {[
            { stat: '7', label: 'retreats' },
            { stat: '6', label: 'countries' },
            { stat: '65%', label: 'come solo' },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-display text-4xl text-salty-orange-red">{item.stat}</p>
              <p className="font-body text-sm text-salty-deep-teal/40 uppercase tracking-wide">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
