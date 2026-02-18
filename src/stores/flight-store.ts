'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Airport, FlightSearchResults, FlightFilters, FlightDateOption, FlightSortMode, LeadCaptureData } from '@/types';

interface FlightState {
  originAirport: Airport | null;
  selectedRetreatSlug: string | null;
  searchResults: FlightSearchResults | null;
  filters: FlightFilters;
  sortMode: FlightSortMode;
  selectedDate: FlightDateOption;
  isLoading: boolean;
  hasSubmittedLead: boolean;
  leadData: LeadCaptureData | null;
  compareAll: boolean;
  allResults: FlightSearchResults[];

  // Favourites & selection
  favouriteFlightIds: string[];
  selectedOutboundIds: string[];
  returnResults: FlightSearchResults | null;
  isReturnMode: boolean;

  setOrigin: (airport: Airport | null) => void;
  setRetreat: (slug: string | null) => void;
  setSearchResults: (results: FlightSearchResults | null) => void;
  setAllResults: (results: FlightSearchResults[]) => void;
  setFilters: (filters: Partial<FlightFilters>) => void;
  setSortMode: (mode: FlightSortMode) => void;
  setSelectedDate: (date: FlightDateOption) => void;
  setIsLoading: (loading: boolean) => void;
  setHasSubmittedLead: (value: boolean) => void;
  setLeadData: (data: LeadCaptureData) => void;
  setCompareAll: (value: boolean) => void;
  toggleFavourite: (flightId: string) => void;
  toggleOutboundSelection: (flightId: string) => void;
  setReturnResults: (results: FlightSearchResults | null) => void;
  setIsReturnMode: (value: boolean) => void;
  clearOutboundSelection: () => void;
  reset: () => void;
}

const defaultFilters: FlightFilters = {
  maxStops: null,
  maxDuration: null,
  maxPrice: null,
  alliances: [],
};

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      originAirport: null,
      selectedRetreatSlug: null,
      searchResults: null,
      filters: { ...defaultFilters },
      sortMode: 'best',
      selectedDate: 'day-before',
      isLoading: false,
      hasSubmittedLead: false,
      leadData: null,
      compareAll: false,
      allResults: [],
      favouriteFlightIds: [],
      selectedOutboundIds: [],
      returnResults: null,
      isReturnMode: false,

      setOrigin: (airport) => set({ originAirport: airport }),
      setRetreat: (slug) => set({ selectedRetreatSlug: slug }),
      setSearchResults: (results) => set({ searchResults: results }),
      setAllResults: (results) => set({ allResults: results }),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      setSortMode: (mode) => set({ sortMode: mode }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setHasSubmittedLead: (value) => set({ hasSubmittedLead: value }),
      setLeadData: (data) => set({ leadData: data, hasSubmittedLead: true }),
      setCompareAll: (value) => set({ compareAll: value }),
      toggleFavourite: (flightId) =>
        set((state) => ({
          favouriteFlightIds: state.favouriteFlightIds.includes(flightId)
            ? state.favouriteFlightIds.filter((id) => id !== flightId)
            : [...state.favouriteFlightIds, flightId],
        })),
      toggleOutboundSelection: (flightId) =>
        set((state) => ({
          selectedOutboundIds: state.selectedOutboundIds.includes(flightId)
            ? state.selectedOutboundIds.filter((id) => id !== flightId)
            : [...state.selectedOutboundIds, flightId],
        })),
      setReturnResults: (results) => set({ returnResults: results }),
      setIsReturnMode: (value) => set({ isReturnMode: value }),
      clearOutboundSelection: () => set({ selectedOutboundIds: [] }),
      reset: () =>
        set({
          originAirport: null,
          selectedRetreatSlug: null,
          searchResults: null,
          filters: { ...defaultFilters },
          sortMode: 'best',
          selectedDate: 'day-before',
          isLoading: false,
          compareAll: false,
          allResults: [],
          selectedOutboundIds: [],
          returnResults: null,
          isReturnMode: false,
        }),
    }),
    {
      name: 'salty-flight-state',
      partialize: (state) => ({
        leadData: state.leadData,
        hasSubmittedLead: state.hasSubmittedLead,
        filters: state.filters,
        favouriteFlightIds: state.favouriteFlightIds,
        selectedOutboundIds: state.selectedOutboundIds,
      }),
    }
  )
);
