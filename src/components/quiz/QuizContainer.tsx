'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '@/stores/quiz-store';
import { useFlightStore } from '@/stores/flight-store';
import { QUIZ_STEPS } from '@/types/quiz';
import { retreats } from '@/data/retreats';
import { calculateAllMatches } from '@/lib/matching';
import { useRouter } from 'next/navigation';
import QuizProgress from './QuizProgress';
import VibeQuestion from './questions/VibeQuestion';
import BudgetQuestion from './questions/BudgetQuestion';
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
  const { currentStep, nextStep, prevStep, answers, hasSubmittedLead, leadData, setLeadData, setResults } = useQuizStore();
  const flightStore = useFlightStore();
  const router = useRouter();

  const hasExistingLead = hasSubmittedLead || flightStore.hasSubmittedLead;

  // If lead data exists in flight store but not quiz store, copy it over
  useEffect(() => {
    if (flightStore.leadData && !leadData) {
      setLeadData(flightStore.leadData);
    }
  }, [flightStore.leadData, leadData, setLeadData]);

  const handleNext = useCallback(() => {
    const nextStepIndex = currentStep + 1;
    const isLeadCaptureStep = nextStepIndex === QUIZ_STEPS.length - 1;

    // Skip lead capture for returning users
    if (isLeadCaptureStep && hasExistingLead) {
      const results = calculateAllMatches(retreats, answers);
      setResults(results);

      // Submit to GHL as quiz_completed event (non-blocking)
      const existingLead = leadData || flightStore.leadData;
      if (existingLead) {
        fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: existingLead.firstName,
            email: existingLead.email,
            whatsappNumber: existingLead.whatsappNumber,
            source: 'quiz',
            quizAnswers: answers,
            topMatch: results[0]?.retreat.slug,
          }),
        }).catch(() => {
          console.log('Lead capture API call failed, continuing to results');
        });
      }

      router.push('/quiz/results');
      return;
    }

    if (currentStep < QUIZ_STEPS.length - 1) {
      nextStep();
    }
  }, [currentStep, nextStep, hasExistingLead, answers, leadData, flightStore.leadData, setResults, router]);

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
    <BudgetQuestion key="budget" onNext={handleNext} />,
    <AvailabilityQuestion key="availability" onNext={handleNext} />,
    <RegionQuestion key="regions" onNext={handleNext} />,
    <PartyRestQuestion key="partyVsRest" onNext={handleNext} />,
    <MustHavesQuestion key="mustHaves" onNext={handleNext} />,
    <LeadCaptureGate key="leadCapture" />,
  ];

  // Adjust displayed total steps for returning users (skip lead capture)
  const totalDisplaySteps = hasExistingLead ? QUIZ_STEPS.length - 1 : QUIZ_STEPS.length;
  const displayStep = Math.min(currentStep + 1, totalDisplaySteps);

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
            {displayStep} of {totalDisplaySteps}
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
