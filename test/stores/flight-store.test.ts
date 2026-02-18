import { useFlightStore } from '@/stores/flight-store';
import type { Airport } from '@/types/flight';
import type { LeadCaptureData } from '@/types/quiz';

beforeEach(() => {
  useFlightStore.setState({
    originAirport: null,
    selectedRetreatSlug: null,
    searchResults: null,
    filters: { maxStops: null, maxDuration: null, maxPrice: 3500, alliances: [] },
    sortMode: 'best',
    selectedDate: 'day-before',
    isLoading: false,
    hasSubmittedLead: false,
    leadData: null,
    compareAll: false,
    allResults: [],
    favouriteFlightIds: [],
    selectedOutboundIds: [],
    selectedReturnIds: [],
    returnResults: null,
    isReturnMode: false,
  });
});

describe('useFlightStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useFlightStore.getState();
      expect(state.originAirport).toBeNull();
      expect(state.filters.maxPrice).toBe(3500);
      expect(state.sortMode).toBe('best');
      expect(state.selectedDate).toBe('day-before');
      expect(state.isLoading).toBe(false);
      expect(state.favouriteFlightIds).toEqual([]);
      expect(state.selectedOutboundIds).toEqual([]);
      expect(state.selectedReturnIds).toEqual([]);
      expect(state.isReturnMode).toBe(false);
    });
  });

  describe('setOrigin', () => {
    it('sets the origin airport', () => {
      const airport: Airport = { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' };
      useFlightStore.getState().setOrigin(airport);
      expect(useFlightStore.getState().originAirport).toEqual(airport);
    });

    it('sets origin to null', () => {
      const airport: Airport = { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' };
      useFlightStore.getState().setOrigin(airport);
      useFlightStore.getState().setOrigin(null);
      expect(useFlightStore.getState().originAirport).toBeNull();
    });
  });

  describe('setFilters', () => {
    it('merges partial filters without overwriting existing values', () => {
      useFlightStore.getState().setFilters({ maxStops: 1 });
      const { filters } = useFlightStore.getState();
      expect(filters.maxStops).toBe(1);
      expect(filters.maxPrice).toBe(3500);
      expect(filters.maxDuration).toBeNull();
      expect(filters.alliances).toEqual([]);
    });
  });

  describe('toggleFavourite', () => {
    it('adds a flight id when not present', () => {
      useFlightStore.getState().toggleFavourite('flight-1');
      expect(useFlightStore.getState().favouriteFlightIds).toEqual(['flight-1']);
    });

    it('removes a flight id when already present', () => {
      useFlightStore.getState().toggleFavourite('flight-1');
      useFlightStore.getState().toggleFavourite('flight-1');
      expect(useFlightStore.getState().favouriteFlightIds).toEqual([]);
    });
  });

  describe('toggleOutboundSelection', () => {
    it('adds a flight id when not present', () => {
      useFlightStore.getState().toggleOutboundSelection('ob-1');
      expect(useFlightStore.getState().selectedOutboundIds).toEqual(['ob-1']);
    });

    it('removes a flight id when already present', () => {
      useFlightStore.getState().toggleOutboundSelection('ob-1');
      useFlightStore.getState().toggleOutboundSelection('ob-1');
      expect(useFlightStore.getState().selectedOutboundIds).toEqual([]);
    });
  });

  describe('clearOutboundSelection', () => {
    it('empties the selectedOutboundIds array', () => {
      useFlightStore.getState().toggleOutboundSelection('ob-1');
      useFlightStore.getState().toggleOutboundSelection('ob-2');
      useFlightStore.getState().clearOutboundSelection();
      expect(useFlightStore.getState().selectedOutboundIds).toEqual([]);
    });
  });

  describe('toggleReturnSelection', () => {
    it('adds a flight id when not present', () => {
      useFlightStore.getState().toggleReturnSelection('ret-1');
      expect(useFlightStore.getState().selectedReturnIds).toEqual(['ret-1']);
    });

    it('removes a flight id when already present', () => {
      useFlightStore.getState().toggleReturnSelection('ret-1');
      useFlightStore.getState().toggleReturnSelection('ret-1');
      expect(useFlightStore.getState().selectedReturnIds).toEqual([]);
    });
  });

  describe('clearReturnSelection', () => {
    it('empties the selectedReturnIds array', () => {
      useFlightStore.getState().toggleReturnSelection('ret-1');
      useFlightStore.getState().toggleReturnSelection('ret-2');
      useFlightStore.getState().clearReturnSelection();
      expect(useFlightStore.getState().selectedReturnIds).toEqual([]);
    });
  });

  describe('setLeadData', () => {
    it('sets leadData and hasSubmittedLead to true', () => {
      const lead: LeadCaptureData = { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1234567890' };
      useFlightStore.getState().setLeadData(lead);
      const state = useFlightStore.getState();
      expect(state.leadData).toEqual(lead);
      expect(state.hasSubmittedLead).toBe(true);
    });
  });

  describe('reset', () => {
    it('returns transient state to initial values', () => {
      useFlightStore.getState().toggleOutboundSelection('ob-1');
      useFlightStore.getState().toggleReturnSelection('ret-1');
      useFlightStore.getState().setFilters({ maxStops: 2, maxPrice: 1000 });
      useFlightStore.getState().setIsLoading(true);

      useFlightStore.getState().reset();
      const state = useFlightStore.getState();

      expect(state.selectedOutboundIds).toEqual([]);
      expect(state.selectedReturnIds).toEqual([]);
      expect(state.filters.maxPrice).toBe(3500);
      expect(state.filters.maxStops).toBeNull();
      expect(state.originAirport).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isReturnMode).toBe(false);
    });

    it('does NOT clear favouriteFlightIds', () => {
      useFlightStore.getState().toggleFavourite('fav-1');
      useFlightStore.getState().toggleFavourite('fav-2');
      useFlightStore.getState().reset();
      expect(useFlightStore.getState().favouriteFlightIds).toEqual(['fav-1', 'fav-2']);
    });

    it('does NOT clear leadData or hasSubmittedLead', () => {
      const lead: LeadCaptureData = { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1234567890' };
      useFlightStore.getState().setLeadData(lead);
      useFlightStore.getState().reset();
      const state = useFlightStore.getState();
      expect(state.leadData).toEqual(lead);
      expect(state.hasSubmittedLead).toBe(true);
    });
  });
});
