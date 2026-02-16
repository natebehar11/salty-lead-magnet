'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAnswers, QuizResult, LeadCaptureData, QUIZ_STEPS, QuizStep } from '@/types/quiz';

interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  leadData: LeadCaptureData | null;
  results: QuizResult[] | null;
  isComplete: boolean;
  hasSubmittedLead: boolean;

  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setLeadData: (data: LeadCaptureData) => void;
  setResults: (results: QuizResult[]) => void;
  setHasSubmittedLead: (value: boolean) => void;
  reset: () => void;
  getCurrentStepName: () => QuizStep;
}

const initialAnswers: QuizAnswers = {
  vibes: [],
  groupStyle: null,
  budget: null,
  roomPreference: null,
  availability: [],
  regions: [],
  partyVsRest: 5,
  travelingSolo: null,
  experienceLevel: null,
  mustHaves: [],
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      answers: { ...initialAnswers },
      leadData: null,
      results: null,
      isComplete: false,
      hasSubmittedLead: false,

      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, QUIZ_STEPS.length - 1),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      goToStep: (step) => set({ currentStep: step }),

      setLeadData: (data) => set({ leadData: data, hasSubmittedLead: true }),

      setResults: (results) => set({ results, isComplete: true }),

      setHasSubmittedLead: (value) => set({ hasSubmittedLead: value }),

      reset: () =>
        set({
          currentStep: 0,
          answers: { ...initialAnswers },
          leadData: null,
          results: null,
          isComplete: false,
          hasSubmittedLead: false,
        }),

      getCurrentStepName: () => QUIZ_STEPS[get().currentStep],
    }),
    {
      name: 'salty-quiz-state',
      partialize: (state) => ({
        answers: state.answers,
        leadData: state.leadData,
        results: state.results,
        isComplete: state.isComplete,
        hasSubmittedLead: state.hasSubmittedLead,
        currentStep: state.currentStep,
      }),
    }
  )
);
