'use client';

import { motion } from 'motion/react';
import { QUIZ_STEPS } from '@/types';

interface QuizProgressProps {
  currentStep: number;
}

export default function QuizProgress({ currentStep }: QuizProgressProps) {
  const totalSteps = QUIZ_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="fixed top-16 left-0 right-0 z-40">
      <div className="h-1.5 bg-salty-sand/50">
        <motion.div
          className="h-full bg-salty-coral rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <p className="font-body text-[10px] text-salty-deep-teal/40 text-center mt-1.5">
        Question {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}
