'use client';

import { motion } from 'framer-motion';
import { QUIZ_STEPS } from '@/types';

interface QuizProgressProps {
  currentStep: number;
}

export default function QuizProgress({ currentStep }: QuizProgressProps) {
  const totalSteps = QUIZ_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-salty-beige/50">
      <motion.div
        className="h-full bg-salty-orange-red"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}
