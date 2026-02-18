'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlannerCity, ItinerarySuggestion } from '@/types/planner';

interface PlannerState {
  selectedRetreatSlug: string | null;
  beforeCities: PlannerCity[];
  afterCities: PlannerCity[];
  prompt: string;
  suggestion: ItinerarySuggestion | null;
  formSubmitted: boolean;

  setSelectedRetreatSlug: (slug: string | null) => void;
  addCity: (type: 'before' | 'after') => void;
  updateCity: (id: string, updates: Partial<PlannerCity>) => void;
  removeCity: (id: string) => void;
  setPrompt: (prompt: string) => void;
  setSuggestion: (suggestion: ItinerarySuggestion | null) => void;
  setFormSubmitted: (submitted: boolean) => void;
  reset: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      selectedRetreatSlug: null,
      beforeCities: [],
      afterCities: [],
      prompt: '',
      suggestion: null,
      formSubmitted: false,

      setSelectedRetreatSlug: (slug) => set({ selectedRetreatSlug: slug, suggestion: null }),

      addCity: (type) => {
        const newCity: PlannerCity = {
          id: `${type}-${Date.now()}`,
          name: '',
          country: '',
          days: 3,
          type,
        };
        if (type === 'before') {
          set((state) => ({ beforeCities: [...state.beforeCities, newCity] }));
        } else {
          set((state) => ({ afterCities: [...state.afterCities, newCity] }));
        }
      },

      updateCity: (id, updates) =>
        set((state) => ({
          beforeCities: state.beforeCities.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          afterCities: state.afterCities.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      removeCity: (id) =>
        set((state) => ({
          beforeCities: state.beforeCities.filter((c) => c.id !== id),
          afterCities: state.afterCities.filter((c) => c.id !== id),
        })),

      setPrompt: (prompt) => set({ prompt }),
      setSuggestion: (suggestion) => set({ suggestion }),
      setFormSubmitted: (submitted) => set({ formSubmitted: submitted }),
      reset: () => set({
        selectedRetreatSlug: null,
        beforeCities: [],
        afterCities: [],
        prompt: '',
        suggestion: null,
        formSubmitted: false,
      }),
    }),
    {
      name: 'salty-planner',
      partialize: (state) => ({
        selectedRetreatSlug: state.selectedRetreatSlug,
        beforeCities: state.beforeCities,
        afterCities: state.afterCities,
        prompt: state.prompt,
        suggestion: state.suggestion,
        formSubmitted: state.formSubmitted,
      }),
    }
  )
);
