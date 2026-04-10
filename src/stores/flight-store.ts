'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from '@/lib/utils';
import { Airport, FlightSearchResults, FlightFilters, FlightDateOption, FlightSortMode, LeadCaptureData, TripType, MultiCityLeg, MultiCityLegResult } from '@/types';

interface FlightState {
  originAirport: Airport | null;
  selectedRetreatSlug: string | null;
  searchResults: FlightSearchResults | null;
  filters: FlightFilters;
  sortMode: FlightSortMode;
  selectedDate: FlightDateOption;
  isLoading: boolean;
  searchError: string | null;
  hasSubmittedLead: boolean;
  leadData: LeadCaptureData | null;
  compareAll: boolean;
  allResults: FlightSearchResults[];

  // Trip type
  tripType: TripType;

  // Favourites & selection
  favouriteFlightIds: string[];
  selectedOutboundIds: string[];
  selectedReturnIds: string[];
  returnResults: FlightSearchResults | null;
  isReturnMode: boolean;

  // Multi-city
  multiCityLegs: MultiCityLeg[];
  multiCityLegResults: MultiCityLegResult[];
  multiCityActiveLeg: number;

  setOrigin: (airport: Airport | null) => void;
  setRetreat: (slug: string | null) => void;
  setSearchResults: (results: FlightSearchResults | null) => void;
  setAllResults: (results: FlightSearchResults[]) => void;
  setFilters: (filters: Partial<FlightFilters>) => void;
  setSortMode: (mode: FlightSortMode) => void;
  setSelectedDate: (date: FlightDateOption) => void;
  setIsLoading: (loading: boolean) => void;
  setSearchError: (error: string | null) => void;
  setHasSubmittedLead: (value: boolean) => void;
  setLeadData: (data: LeadCaptureData) => void;
  setCompareAll: (value: boolean) => void;
  toggleFavourite: (flightId: string) => void;
  toggleOutboundSelection: (flightId: string) => void;
  setReturnResults: (results: FlightSearchResults | null) => void;
  setIsReturnMode: (value: boolean) => void;
  clearOutboundSelection: () => void;
  toggleReturnSelection: (flightId: string) => void;
  clearReturnSelection: () => void;

  // Trip type actions
  setTripType: (type: TripType) => void;

  // Multi-city actions
  setMultiCityLegs: (legs: MultiCityLeg[]) => void;
  updateMultiCityLeg: (legId: string, updates: Partial<Omit<MultiCityLeg, 'id'>>) => void;
  addMultiCityLeg: () => void;
  removeMultiCityLeg: (legId: string) => void;
  setMultiCityLegResults: (results: MultiCityLegResult[]) => void;
  appendMultiCityLegResult: (result: MultiCityLegResult) => void;
  selectMultiCityFlight: (legIndex: number, flightId: string, departureToken: string | null) => void;
  setMultiCityActiveLeg: (index: number) => void;
  resetMultiCity: () => void;

  reset: () => void;
}

const defaultFilters: FlightFilters = {
  maxStops: null,
  maxDuration: null,
  maxPrice: 3500,
  alliances: [],
};

function createMultiCityLeg(): MultiCityLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    origin: null,
    destination: null,
    date: '',
  };
}

const defaultMultiCityLegs: MultiCityLeg[] = [createMultiCityLeg(), createMultiCityLeg()];

export const useFlightStore = create<FlightState>()(
  persist(
    (set, get) => ({
      originAirport: null,
      selectedRetreatSlug: null,
      searchResults: null,
      filters: { ...defaultFilters },
      sortMode: 'best',
      selectedDate: 'day-before',
      isLoading: false,
      searchError: null,
      hasSubmittedLead: false,
      leadData: null,
      compareAll: false,
      allResults: [],
      tripType: 'round-trip',
      favouriteFlightIds: [],
      selectedOutboundIds: [],
      selectedReturnIds: [],
      returnResults: null,
      isReturnMode: false,
      multiCityLegs: defaultMultiCityLegs,
      multiCityLegResults: [],
      multiCityActiveLeg: 0,

      setOrigin: (airport) => set({ originAirport: airport }),
      setRetreat: (slug) => set({ selectedRetreatSlug: slug }),
      setSearchResults: (results) => set({ searchResults: results }),
      setAllResults: (results) => set({ allResults: results }),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      setSortMode: (mode) => set({ sortMode: mode }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setSearchError: (error) => set({ searchError: error }),
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
      toggleReturnSelection: (flightId) =>
        set((state) => ({
          selectedReturnIds: state.selectedReturnIds.includes(flightId)
            ? state.selectedReturnIds.filter((id) => id !== flightId)
            : [...state.selectedReturnIds, flightId],
        })),
      clearReturnSelection: () => set({ selectedReturnIds: [] }),

      // Trip type — clears all stale results and selections when switching
      setTripType: (tripType) =>
        set({
          tripType,
          searchResults: null,
          returnResults: null,
          allResults: [],
          favouriteFlightIds: [],
          selectedOutboundIds: [],
          selectedReturnIds: [],
          isReturnMode: false,
          multiCityLegResults: [],
          multiCityActiveLeg: 0,
          searchError: null,
        }),

      // Multi-city actions
      setMultiCityLegs: (legs) => set({ multiCityLegs: legs }),

      updateMultiCityLeg: (legId, updates) =>
        set((state) => ({
          multiCityLegs: state.multiCityLegs.map((leg) =>
            leg.id === legId ? { ...leg, ...updates } : leg
          ),
        })),

      addMultiCityLeg: () => {
        const { multiCityLegs } = get();
        if (multiCityLegs.length >= 6) return;
        set({ multiCityLegs: [...multiCityLegs, createMultiCityLeg()] });
      },

      removeMultiCityLeg: (legId) => {
        const { multiCityLegs } = get();
        if (multiCityLegs.length <= 2) return;
        set({ multiCityLegs: multiCityLegs.filter((leg) => leg.id !== legId) });
      },

      setMultiCityLegResults: (results) => set({ multiCityLegResults: results }),

      appendMultiCityLegResult: (result) =>
        set((state) => ({
          multiCityLegResults: [...state.multiCityLegResults, result],
        })),

      selectMultiCityFlight: (legIndex, flightId, departureToken) =>
        set((state) => ({
          multiCityLegResults: state.multiCityLegResults.map((r) =>
            r.legIndex === legIndex
              ? { ...r, selectedFlightId: flightId, departureToken }
              : r
          ),
        })),

      setMultiCityActiveLeg: (index) => set({ multiCityActiveLeg: index }),

      resetMultiCity: () =>
        set({
          multiCityLegResults: [],
          multiCityActiveLeg: 0,
          searchError: null,
        }),

      reset: () =>
        set({
          originAirport: null,
          selectedRetreatSlug: null,
          searchResults: null,
          filters: { ...defaultFilters },
          sortMode: 'best',
          selectedDate: 'day-before',
          isLoading: false,
          searchError: null,
          compareAll: false,
          allResults: [],
          tripType: 'round-trip',
          favouriteFlightIds: [],
          selectedOutboundIds: [],
          selectedReturnIds: [],
          returnResults: null,
          isReturnMode: false,
          multiCityLegs: [createMultiCityLeg(), createMultiCityLeg()],
          multiCityLegResults: [],
          multiCityActiveLeg: 0,
        }),
    }),
    {
      name: 'salty-flight-state',
      storage: safeStorage,
      partialize: (state) => ({
        leadData: state.leadData,
        hasSubmittedLead: state.hasSubmittedLead,
        filters: state.filters,
        favouriteFlightIds: state.favouriteFlightIds,
        tripType: state.tripType,
      }),
    }
  )
);
