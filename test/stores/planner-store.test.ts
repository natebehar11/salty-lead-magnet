import { usePlannerStore } from '@/stores/planner-store';

beforeEach(() => {
  usePlannerStore.setState({
    selectedRetreatSlug: null,
    beforeCities: [],
    afterCities: [],
    prompt: '',
    suggestion: null,
    formSubmitted: false,
  });
});

describe('usePlannerStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = usePlannerStore.getState();
      expect(state.selectedRetreatSlug).toBeNull();
      expect(state.beforeCities).toEqual([]);
      expect(state.afterCities).toEqual([]);
    });
  });

  describe('setSelectedRetreatSlug', () => {
    it('sets slug and clears suggestion', () => {
      usePlannerStore.setState({
        suggestion: { cities: [], totalDays: 5, reasoning: 'test' },
      });
      usePlannerStore.getState().setSelectedRetreatSlug('costa-rica');
      const state = usePlannerStore.getState();
      expect(state.selectedRetreatSlug).toBe('costa-rica');
      expect(state.suggestion).toBeNull();
    });
  });

  describe('addCity', () => {
    it('adds to beforeCities with days=3', () => {
      usePlannerStore.getState().addCity('before');
      const { beforeCities } = usePlannerStore.getState();
      expect(beforeCities).toHaveLength(1);
      expect(beforeCities[0].days).toBe(3);
      expect(beforeCities[0].type).toBe('before');
      expect(beforeCities[0].name).toBe('');
      expect(beforeCities[0].country).toBe('');
    });

    it('adds to afterCities with days=3', () => {
      usePlannerStore.getState().addCity('after');
      const { afterCities } = usePlannerStore.getState();
      expect(afterCities).toHaveLength(1);
      expect(afterCities[0].days).toBe(3);
      expect(afterCities[0].type).toBe('after');
    });
  });

  describe('updateCity', () => {
    it('updates matching city fields', () => {
      usePlannerStore.getState().addCity('before');
      const { beforeCities } = usePlannerStore.getState();
      const cityId = beforeCities[0].id;

      usePlannerStore.getState().updateCity(cityId, { name: 'San Jose', country: 'Costa Rica', days: 5 });
      const updated = usePlannerStore.getState().beforeCities[0];
      expect(updated.name).toBe('San Jose');
      expect(updated.country).toBe('Costa Rica');
      expect(updated.days).toBe(5);
    });
  });

  describe('removeCity', () => {
    it('removes from the correct array', () => {
      usePlannerStore.getState().addCity('before');
      usePlannerStore.getState().addCity('after');
      const beforeId = usePlannerStore.getState().beforeCities[0].id;
      const afterId = usePlannerStore.getState().afterCities[0].id;

      usePlannerStore.getState().removeCity(beforeId);
      expect(usePlannerStore.getState().beforeCities).toHaveLength(0);
      expect(usePlannerStore.getState().afterCities).toHaveLength(1);

      usePlannerStore.getState().removeCity(afterId);
      expect(usePlannerStore.getState().afterCities).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('clears everything back to initial state', () => {
      usePlannerStore.getState().setSelectedRetreatSlug('morocco');
      usePlannerStore.getState().addCity('before');
      usePlannerStore.getState().addCity('after');
      usePlannerStore.getState().setPrompt('Plan my trip');

      usePlannerStore.getState().reset();
      const state = usePlannerStore.getState();

      expect(state.selectedRetreatSlug).toBeNull();
      expect(state.beforeCities).toEqual([]);
      expect(state.afterCities).toEqual([]);
      expect(state.prompt).toBe('');
      expect(state.suggestion).toBeNull();
      expect(state.formSubmitted).toBe(false);
    });
  });
});
