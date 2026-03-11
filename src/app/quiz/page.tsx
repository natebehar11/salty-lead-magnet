'use client';

import { useState } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import QuizContainer from '@/components/quiz/QuizContainer';
import Button from '@/components/shared/Button';
import { motion } from 'motion/react';

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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-surface-base relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-xl relative z-10"
      >
        <p className="font-body text-sm text-salty-coral font-bold uppercase tracking-widest mb-4">
          The SALTY Trip Matcher
        </p>
        <h1 className="font-display text-hero text-salty-deep-teal mb-6">
          Find your perfect trip.
        </h1>
        <p className="font-body text-lg text-salty-deep-teal/70 mb-4 leading-relaxed">
          Answer 7 quick questions and we&apos;ll match you with the SALTY retreat
          that fits your vibe, budget, and schedule.
        </p>
        <p className="font-body text-sm text-salty-deep-teal/50 mb-8">
          Takes about 2 minutes. No wrong answers. Seriously.
        </p>
        <Button onClick={handleStart} size="lg">
          Let&apos;s Go
        </Button>
      </motion.div>

    </div>
  );
}
