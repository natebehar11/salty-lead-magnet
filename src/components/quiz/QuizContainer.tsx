'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '@/stores/quiz-store';
import { QUIZ_STEPS } from '@/types';
import QuizProgress from './QuizProgress';
import VibeQuestion from './questions/VibeQuestion';
import RoomPreferenceQuestion from './questions/RoomPreferenceQuestion';
import AvailabilityQuestion from './questions/AvailabilityQuestion';
import RegionQuestion from './questions/RegionQuestion';
import PartyRestQuestion from './questions/PartyRestQuestion';
import MustHavesQuestion from './questions/MustHavesQuestion';
import LeadCaptureGate from './LeadCaptureGate';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function QuizContainer() {
  const { currentStep, nextStep, prevStep } = useQuizStore();

  const handleNext = useCallback(() => {
    if (currentStep < QUIZ_STEPS.length - 1) {
      nextStep();
    }
  }, [currentStep, nextStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      prevStep();
    }
  }, [currentStep, prevStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep > 0) {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, handleBack]);

  const stepComponents = [
    <VibeQuestion key="vibes" onNext={handleNext} />,
    <RoomPreferenceQuestion key="roomPreference" onNext={handleNext} />,
    <AvailabilityQuestion key="availability" onNext={handleNext} />,
    <RegionQuestion key="regions" onNext={handleNext} />,
    <PartyRestQuestion key="partyVsRest" onNext={handleNext} />,
    <MustHavesQuestion key="mustHaves" onNext={handleNext} />,
    <LeadCaptureGate key="leadCapture" />,
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <QuizProgress currentStep={currentStep} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Step counter and back button */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-8">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="font-body text-sm text-salty-deep-teal/50 hover:text-salty-deep-teal transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <div />
          )}
          <span className="font-body text-xs text-salty-deep-teal/40 uppercase tracking-widest">
            {currentStep + 1} of {QUIZ_STEPS.length}
          </span>
        </div>

        {/* Question area */}
        <div className="w-full max-w-2xl relative overflow-hidden">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {stepComponents[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
