import { describe, it, expect, beforeEach } from 'vitest';
import { usePlannerStore } from '@/stores/planner-store';
import { BoardItem } from '@/types/vision-board';

function makeItem(overrides: Partial<BoardItem> & { name: string; cityName: string; country: string }): BoardItem {
  return {
    id: `test-${overrides.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    type: 'activity',
    description: 'Test description',
    addedAt: Date.now(),
    sourceMessageId: 'msg-1',
    imageUrl: null,
    ...overrides,
  };
}

beforeEach(() => {
  usePlannerStore.getState().reset();
  // Explicitly clear ordering fields (reset keeps userProfile)
  usePlannerStore.setState({
    boardItems: [],
    topLevelOrder: [],
    cityOrderByCountry: {},
    messages: [],
  });
});

describe('usePlannerStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = usePlannerStore.getState();
      expect(state.selectedRetreatSlug).toBeNull();
      expect(state.boardItems).toEqual([]);
      expect(state.messages).toEqual([]);
      expect(state.topLevelOrder).toEqual([]);
      expect(state.cityOrderByCountry).toEqual({});
    });
  });

  describe('addBoardItem', () => {
    it('adds item and syncs order', () => {
      const item = makeItem({ name: 'Restaurant A', cityName: 'Lisbon', country: 'Portugal' });
      usePlannerStore.getState().addBoardItem(item);

      const state = usePlannerStore.getState();
      expect(state.boardItems).toHaveLength(1);
      expect(state.boardItems[0].name).toBe('Restaurant A');

      // Order should be synced — retreat + Portugal
      expect(state.topLevelOrder).toHaveLength(2);
      expect(state.topLevelOrder[0]).toEqual({ kind: 'retreat' });
      expect(state.topLevelOrder[1]).toEqual({ kind: 'country', country: 'Portugal' });

      // City order should include Lisbon
      expect(state.cityOrderByCountry['Portugal']).toEqual(['Lisbon']);
    });

    it('deduplicates by name + cityName', () => {
      const item1 = makeItem({ name: 'Restaurant A', cityName: 'Lisbon', country: 'Portugal' });
      const item2 = makeItem({ name: 'restaurant a', cityName: 'lisbon', country: 'Portugal' });

      usePlannerStore.getState().addBoardItem(item1);
      usePlannerStore.getState().addBoardItem(item2);

      expect(usePlannerStore.getState().boardItems).toHaveLength(1);
    });

    it('adds new country to topLevelOrder', () => {
      const item1 = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      const item2 = makeItem({ name: 'Place B', cityName: 'Barcelona', country: 'Spain' });

      usePlannerStore.getState().addBoardItem(item1);
      usePlannerStore.getState().addBoardItem(item2);

      const state = usePlannerStore.getState();
      expect(state.topLevelOrder).toHaveLength(3); // retreat + Portugal + Spain
      expect(state.topLevelOrder[2]).toEqual({ kind: 'country', country: 'Spain' });
    });

    it('adds new city to cityOrderByCountry', () => {
      const item1 = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      const item2 = makeItem({ name: 'Place B', cityName: 'Porto', country: 'Portugal' });

      usePlannerStore.getState().addBoardItem(item1);
      usePlannerStore.getState().addBoardItem(item2);

      expect(usePlannerStore.getState().cityOrderByCountry['Portugal']).toEqual(['Lisbon', 'Porto']);
    });
  });

  describe('removeBoardItem', () => {
    it('removes item and prunes empty country from order', () => {
      const item = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      usePlannerStore.getState().addBoardItem(item);

      const itemId = usePlannerStore.getState().boardItems[0].id;
      usePlannerStore.getState().removeBoardItem(itemId);

      const state = usePlannerStore.getState();
      expect(state.boardItems).toHaveLength(0);
      // Portugal should be removed from order
      const countries = state.topLevelOrder.filter((i) => i.kind === 'country');
      expect(countries).toHaveLength(0);
    });

    it('preserves other countries when removing items from one', () => {
      const item1 = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      const item2 = makeItem({ name: 'Place B', cityName: 'Barcelona', country: 'Spain' });

      usePlannerStore.getState().addBoardItem(item1);
      usePlannerStore.getState().addBoardItem(item2);

      const itemId = usePlannerStore.getState().boardItems[0].id;
      usePlannerStore.getState().removeBoardItem(itemId);

      const state = usePlannerStore.getState();
      const countries = state.topLevelOrder.filter(
        (i): i is { kind: 'country'; country: string } => i.kind === 'country'
      );
      expect(countries).toHaveLength(1);
      expect(countries[0].country).toBe('Spain');
    });
  });

  describe('setTopLevelOrder', () => {
    it('stores the reordered array', () => {
      const item1 = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      const item2 = makeItem({ name: 'Place B', cityName: 'Barcelona', country: 'Spain' });

      usePlannerStore.getState().addBoardItem(item1);
      usePlannerStore.getState().addBoardItem(item2);

      const newOrder = [
        { kind: 'country' as const, country: 'Spain' },
        { kind: 'retreat' as const },
        { kind: 'country' as const, country: 'Portugal' },
      ];
      usePlannerStore.getState().setTopLevelOrder(newOrder);

      expect(usePlannerStore.getState().topLevelOrder).toEqual(newOrder);
    });
  });

  describe('setCityOrder', () => {
    it('stores city order for a given country', () => {
      usePlannerStore.getState().setCityOrder('Portugal', ['Porto', 'Lisbon']);
      expect(usePlannerStore.getState().cityOrderByCountry['Portugal']).toEqual(['Porto', 'Lisbon']);
    });
  });

  describe('clearBoardItems', () => {
    it('clears items and order', () => {
      const item = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      usePlannerStore.getState().addBoardItem(item);
      usePlannerStore.getState().clearBoardItems();

      const state = usePlannerStore.getState();
      expect(state.boardItems).toEqual([]);
      expect(state.topLevelOrder).toEqual([]);
      expect(state.cityOrderByCountry).toEqual({});
    });
  });

  describe('setSelectedRetreatSlug', () => {
    it('clears board and order when selecting a new retreat', () => {
      const item = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      usePlannerStore.getState().addBoardItem(item);

      usePlannerStore.getState().setSelectedRetreatSlug('morocco');

      const state = usePlannerStore.getState();
      expect(state.selectedRetreatSlug).toBe('morocco');
      expect(state.boardItems).toEqual([]);
      expect(state.topLevelOrder).toEqual([]);
      expect(state.cityOrderByCountry).toEqual({});
    });
  });

  describe('reset', () => {
    it('clears everything back to initial state', () => {
      const item = makeItem({ name: 'Place A', cityName: 'Lisbon', country: 'Portugal' });
      usePlannerStore.getState().addBoardItem(item);
      usePlannerStore.getState().setCreatorName('Nate');
      usePlannerStore.getState().setFormSubmitted(true);

      usePlannerStore.getState().reset();
      const state = usePlannerStore.getState();

      expect(state.selectedRetreatSlug).toBeNull();
      expect(state.boardItems).toEqual([]);
      expect(state.topLevelOrder).toEqual([]);
      expect(state.cityOrderByCountry).toEqual({});
      expect(state.creatorName).toBe('');
      expect(state.formSubmitted).toBe(false);
    });
  });

  describe('syncOrderFromItems', () => {
    it('preserves existing user reordering when adding items', () => {
      // Add items from two countries
      const item1 = makeItem({ name: 'A', cityName: 'Lisbon', country: 'Portugal' });
      const item2 = makeItem({ name: 'B', cityName: 'Barcelona', country: 'Spain' });
      usePlannerStore.getState().addBoardItem(item1);
      usePlannerStore.getState().addBoardItem(item2);

      // User reorders: Spain before Portugal
      usePlannerStore.getState().setTopLevelOrder([
        { kind: 'country', country: 'Spain' },
        { kind: 'retreat' },
        { kind: 'country', country: 'Portugal' },
      ]);

      // Add a third country — should append, not reset order
      const item3 = makeItem({ name: 'C', cityName: 'Paris', country: 'France' });
      usePlannerStore.getState().addBoardItem(item3);

      const order = usePlannerStore.getState().topLevelOrder;
      // Spain should still be first (user's choice preserved)
      const countries = order.filter(
        (i): i is { kind: 'country'; country: string } => i.kind === 'country'
      );
      expect(countries[0].country).toBe('Spain');
      expect(countries[1].country).toBe('Portugal');
      expect(countries[2].country).toBe('France'); // appended
    });
  });
});
