'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyCode, FALLBACK_RATES, CACHE_DURATION, fetchExchangeRates } from '@/lib/currency';

interface CurrencyState {
  selectedCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  lastFetched: number | null;
  isLoading: boolean;
  isStale: boolean;

  setCurrency: (currency: CurrencyCode) => void;
  fetchRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: 'USD',
      rates: { ...FALLBACK_RATES },
      lastFetched: null,
      isLoading: false,
      isStale: true,

      setCurrency: (currency) => set({ selectedCurrency: currency }),

      fetchRates: async () => {
        const { lastFetched, isLoading } = get();
        if (isLoading) return;
        if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) return;

        set({ isLoading: true });
        const { rates, isStale } = await fetchExchangeRates();
        set({
          rates,
          isStale,
          lastFetched: Date.now(),
          isLoading: false,
        });
      },
    }),
    {
      name: 'salty-currency',
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
      }),
    }
  )
);
