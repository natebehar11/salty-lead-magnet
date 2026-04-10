'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from '@/lib/utils';
import { BoardItem, ChatMessageV2, UserTravelProfile, TopLevelBoardItem, BoardViewMode, CityPosition } from '@/types/vision-board';
import type { DiscoveryStage } from '@/lib/discovery-messages';

const MAX_MESSAGES = 30;

interface PlannerState {
  // Core
  selectedRetreatSlug: string | null;
  messages: ChatMessageV2[];
  boardItems: BoardItem[];

  // Board ordering (Country > City hierarchy)
  topLevelOrder: TopLevelBoardItem[];
  cityOrderByCountry: Record<string, string[]>;

  // UI
  mobileActiveTab: 'chat' | 'board';
  boardViewMode: BoardViewMode;

  // Itinerary: maps cityName → 'before' | 'after' the retreat
  beforeAfterAssignment: Record<string, CityPosition>;

  // Discovery flow
  discoveryStage: DiscoveryStage;
  discoveryLocationChoice: string | null;
  discoveryVibeChoice: string | null;
  discoveryTypeChoices: string[] | null;
  discoveryIsSurprise: boolean;

  // Personalization
  userProfile: UserTravelProfile | null;

  // Lead capture & sharing
  creatorName: string;
  creatorEmail: string;
  formSubmitted: boolean;
  hasShared: boolean;
  sharedPlanUrl: string | null;

  // Actions
  setSelectedRetreatSlug: (slug: string | null) => void;
  addBoardItem: (item: BoardItem) => void;
  removeBoardItem: (itemId: string) => void;
  clearBoardItems: () => void;
  updateBoardItemImage: (itemId: string, imageUrl: string) => void;
  addMessage: (message: ChatMessageV2) => void;
  clearMessages: () => void;
  setMobileActiveTab: (tab: 'chat' | 'board') => void;
  setBoardViewMode: (mode: BoardViewMode) => void;
  setCityBeforeAfter: (cityName: string, position: CityPosition) => void;
  hydrateProfile: (quizProfile?: UserTravelProfile) => void;
  setCreatorName: (name: string) => void;
  setCreatorEmail: (email: string) => void;
  setFormSubmitted: (submitted: boolean) => void;
  setHasShared: (shared: boolean) => void;
  setSharedPlanUrl: (url: string | null) => void;
  setTopLevelOrder: (order: TopLevelBoardItem[]) => void;
  setCityOrder: (country: string, cityNames: string[]) => void;
  syncOrderFromItems: () => void;
  setDiscoveryStage: (stage: DiscoveryStage) => void;
  setDiscoveryLocationChoice: (choice: string) => void;
  setDiscoveryVibeChoice: (choice: string) => void;
  setDiscoveryTypeChoices: (choices: string[]) => void;
  setDiscoveryIsSurprise: (isSurprise: boolean) => void;
  completeDiscovery: () => void;
  restartDiscoveryAtLocation: () => void;
  resetDiscovery: () => void;
  reset: () => void;
}

/**
 * Reconciles ordering arrays with current boardItems.
 * - Seeds retreat marker if topLevelOrder is empty
 * - Appends new countries/cities not yet in order
 * - Removes countries/cities that no longer have items
 */
function buildSyncedOrder(
  boardItems: BoardItem[],
  currentTopLevel: TopLevelBoardItem[],
  currentCityOrder: Record<string, string[]>
): { topLevelOrder: TopLevelBoardItem[]; cityOrderByCountry: Record<string, string[]> } {
  // Collect unique countries and cities from items
  const countriesInItems = new Set<string>();
  const citiesByCountry = new Map<string, Set<string>>();

  for (const item of boardItems) {
    countriesInItems.add(item.country);
    if (!citiesByCountry.has(item.country)) {
      citiesByCountry.set(item.country, new Set());
    }
    citiesByCountry.get(item.country)!.add(item.cityName);
  }

  // --- Top-level order ---
  // Start with retreat if not present
  const hasRetreat = currentTopLevel.some((i) => i.kind === 'retreat');
  const newTopLevel: TopLevelBoardItem[] = [];

  if (currentTopLevel.length === 0) {
    // First time: seed with retreat, then all countries
    newTopLevel.push({ kind: 'retreat' });
    for (const country of countriesInItems) {
      newTopLevel.push({ kind: 'country', country });
    }
  } else {
    // Preserve existing order, prune removed countries, append new ones
    for (const entry of currentTopLevel) {
      if (entry.kind === 'retreat') {
        newTopLevel.push(entry);
      } else if (countriesInItems.has(entry.country)) {
        newTopLevel.push(entry);
      }
      // else: country removed, skip
    }
    // Add retreat if it was missing
    if (!hasRetreat) {
      newTopLevel.unshift({ kind: 'retreat' });
    }
    // Append new countries
    const existingCountries = new Set(
      newTopLevel.filter((i): i is { kind: 'country'; country: string } => i.kind === 'country').map((i) => i.country)
    );
    for (const country of countriesInItems) {
      if (!existingCountries.has(country)) {
        newTopLevel.push({ kind: 'country', country });
      }
    }
  }

  // --- City order per country ---
  const newCityOrder: Record<string, string[]> = {};

  for (const [country, cities] of citiesByCountry) {
    const existing = currentCityOrder[country] || [];
    const citySet = cities;

    // Preserve existing order, prune removed cities
    const ordered: string[] = [];
    for (const city of existing) {
      if (citySet.has(city)) {
        ordered.push(city);
      }
    }
    // Append new cities
    for (const city of citySet) {
      if (!ordered.includes(city)) {
        ordered.push(city);
      }
    }
    newCityOrder[country] = ordered;
  }

  return { topLevelOrder: newTopLevel, cityOrderByCountry: newCityOrder };
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      selectedRetreatSlug: null,
      messages: [],
      boardItems: [],
      topLevelOrder: [],
      cityOrderByCountry: {},
      mobileActiveTab: 'chat',
      boardViewMode: 'dream',
      beforeAfterAssignment: {},
      discoveryStage: 'greeting',
      discoveryLocationChoice: null,
      discoveryVibeChoice: null,
      discoveryTypeChoices: null,
      discoveryIsSurprise: false,
      userProfile: null,
      creatorName: '',
      creatorEmail: '',
      formSubmitted: false,
      hasShared: false,
      sharedPlanUrl: null,

      setSelectedRetreatSlug: (slug) =>
        set({
          selectedRetreatSlug: slug,
          messages: [],
          boardItems: [],
          topLevelOrder: [],
          cityOrderByCountry: {},
          beforeAfterAssignment: {},
          discoveryStage: 'greeting',
          discoveryLocationChoice: null,
          discoveryVibeChoice: null,
          discoveryTypeChoices: null,
          discoveryIsSurprise: false,
          // Preserve lead data across retreat switches — don't re-prompt a known lead
          // formSubmitted: kept, creatorName: kept, creatorEmail: kept
          hasShared: false,
          sharedPlanUrl: null,
          mobileActiveTab: 'chat',
        }),

      addBoardItem: (item) => {
        const state = get();
        // Deduplicate by name + cityName (case-insensitive)
        const exists = state.boardItems.some(
          (existing) =>
            existing.name.toLowerCase() === item.name.toLowerCase() &&
            existing.cityName.toLowerCase() === item.cityName.toLowerCase()
        );
        if (exists) return;

        const newItems = [...state.boardItems, item];
        const { topLevelOrder, cityOrderByCountry } = buildSyncedOrder(
          newItems,
          state.topLevelOrder,
          state.cityOrderByCountry
        );
        set({ boardItems: newItems, topLevelOrder, cityOrderByCountry });
      },

      removeBoardItem: (itemId) => {
        const state = get();
        const newItems = state.boardItems.filter((item) => item.id !== itemId);
        const { topLevelOrder, cityOrderByCountry } = buildSyncedOrder(
          newItems,
          state.topLevelOrder,
          state.cityOrderByCountry
        );
        set({ boardItems: newItems, topLevelOrder, cityOrderByCountry });
      },

      clearBoardItems: () => set({ boardItems: [], topLevelOrder: [], cityOrderByCountry: {} }),

      updateBoardItemImage: (itemId, imageUrl) =>
        set((state) => ({
          boardItems: state.boardItems.map((item) =>
            item.id === itemId ? { ...item, imageUrl } : item
          ),
        })),

      addMessage: (message) =>
        set((state) => {
          const updated = [...state.messages, message];
          return {
            messages: updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated,
          };
        }),

      clearMessages: () => set({ messages: [] }),

      setMobileActiveTab: (tab) => set({ mobileActiveTab: tab }),
      setBoardViewMode: (mode) => set({ boardViewMode: mode }),
      setCityBeforeAfter: (cityName, position) =>
        set((state) => ({
          beforeAfterAssignment: { ...state.beforeAfterAssignment, [cityName]: position },
        })),

      hydrateProfile: (quizProfile) => {
        if (quizProfile) {
          set({ userProfile: quizProfile });
        }
      },

      setCreatorName: (name) => set({ creatorName: name }),
      setCreatorEmail: (email) => set({ creatorEmail: email }),
      setFormSubmitted: (submitted) => set({ formSubmitted: submitted }),
      setHasShared: (shared) => set({ hasShared: shared }),
      setSharedPlanUrl: (url) => set({ sharedPlanUrl: url }),

      setTopLevelOrder: (order) => set({ topLevelOrder: order }),

      setCityOrder: (country, cityNames) =>
        set((state) => ({
          cityOrderByCountry: { ...state.cityOrderByCountry, [country]: cityNames },
        })),

      syncOrderFromItems: () => {
        const state = get();
        const { topLevelOrder, cityOrderByCountry } = buildSyncedOrder(
          state.boardItems,
          state.topLevelOrder,
          state.cityOrderByCountry
        );
        set({ topLevelOrder, cityOrderByCountry });
      },

      setDiscoveryStage: (stage) => set({ discoveryStage: stage }),
      setDiscoveryLocationChoice: (choice) => set({ discoveryLocationChoice: choice }),
      setDiscoveryVibeChoice: (choice) => set({ discoveryVibeChoice: choice }),
      setDiscoveryTypeChoices: (choices) => set({ discoveryTypeChoices: choices }),
      setDiscoveryIsSurprise: (isSurprise) => set({ discoveryIsSurprise: isSurprise }),

      completeDiscovery: () => set({ discoveryStage: 'complete' }),

      restartDiscoveryAtLocation: () =>
        set({
          discoveryStage: 'greeting',
          discoveryLocationChoice: null,
          // Intentionally keeps vibeChoice and typeChoices
        }),

      resetDiscovery: () =>
        set({
          discoveryStage: 'greeting',
          discoveryLocationChoice: null,
          discoveryVibeChoice: null,
          discoveryTypeChoices: null,
          discoveryIsSurprise: false,
        }),

      reset: () =>
        set({
          selectedRetreatSlug: null,
          messages: [],
          boardItems: [],
          topLevelOrder: [],
          cityOrderByCountry: {},
          mobileActiveTab: 'chat',
          boardViewMode: 'dream',
          beforeAfterAssignment: {},
          discoveryStage: 'greeting',
          discoveryLocationChoice: null,
          discoveryVibeChoice: null,
          discoveryTypeChoices: null,
          discoveryIsSurprise: false,
          userProfile: get().userProfile, // Keep profile on reset
          creatorName: '',
          creatorEmail: '',
          formSubmitted: false,
          hasShared: false,
          sharedPlanUrl: null,
        }),
    }),
    {
      name: 'salty-planner',
      storage: safeStorage,
      version: 4,
      migrate: (persisted, version) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persisted as Record<string, any>;

        if (version < 3) {
          // v1/v2 → v3: add ordering fields, clear all data for clean state
          return {
            selectedRetreatSlug: null,
            messages: [],
            boardItems: [],
            topLevelOrder: [],
            cityOrderByCountry: {},
            boardViewMode: 'dream' as const,
            beforeAfterAssignment: {},
            discoveryStage: 'greeting' as DiscoveryStage,
            discoveryLocationChoice: null,
            discoveryVibeChoice: null,
            discoveryTypeChoices: null,
            discoveryIsSurprise: false,
            userProfile: null,
            creatorName: '',
            creatorEmail: '',
            formSubmitted: false,
            hasShared: false,
            sharedPlanUrl: null,
          };
        }

        // v3 → v4: add discovery fields
        // If user already has messages, they've been through the old flow — mark complete.
        // Otherwise start fresh with greeting.
        const messages = (state.messages || []) as ChatMessageV2[];
        const discoveryStage: DiscoveryStage = messages.length > 0 ? 'complete' : 'greeting';

        return {
          selectedRetreatSlug: (state.selectedRetreatSlug as string | null) ?? null,
          messages,
          boardItems: (state.boardItems || []) as BoardItem[],
          topLevelOrder: (state.topLevelOrder || []) as TopLevelBoardItem[],
          cityOrderByCountry: (state.cityOrderByCountry || {}) as Record<string, string[]>,
          boardViewMode: (state.boardViewMode || 'dream') as BoardViewMode,
          beforeAfterAssignment: (state.beforeAfterAssignment || {}) as Record<string, CityPosition>,
          discoveryStage,
          discoveryLocationChoice: null,
          discoveryVibeChoice: null,
          discoveryTypeChoices: null,
          discoveryIsSurprise: false,
          userProfile: (state.userProfile as UserTravelProfile | null) ?? null,
          creatorName: (state.creatorName as string) || '',
          creatorEmail: (state.creatorEmail as string) || '',
          formSubmitted: (state.formSubmitted as boolean) || false,
          hasShared: (state.hasShared as boolean) || false,
          sharedPlanUrl: (state.sharedPlanUrl as string | null) ?? null,
        };
      },
      partialize: (state) => ({
        selectedRetreatSlug: state.selectedRetreatSlug,
        messages: state.messages.slice(-MAX_MESSAGES),
        boardItems: state.boardItems,
        topLevelOrder: state.topLevelOrder,
        cityOrderByCountry: state.cityOrderByCountry,
        boardViewMode: state.boardViewMode,
        beforeAfterAssignment: state.beforeAfterAssignment,
        discoveryStage: state.discoveryStage,
        discoveryLocationChoice: state.discoveryLocationChoice,
        discoveryVibeChoice: state.discoveryVibeChoice,
        discoveryTypeChoices: state.discoveryTypeChoices,
        discoveryIsSurprise: state.discoveryIsSurprise,
        userProfile: state.userProfile,
        creatorName: state.creatorName,
        creatorEmail: state.creatorEmail,
        formSubmitted: state.formSubmitted,
        hasShared: state.hasShared,
        sharedPlanUrl: state.sharedPlanUrl,
      }),
    }
  )
);
