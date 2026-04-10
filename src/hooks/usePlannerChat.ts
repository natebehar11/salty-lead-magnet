'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Retreat } from '@/types';
import { ChatMessageV2, RecommendationCard, BoardItem } from '@/types/vision-board';
import { usePlannerStore } from '@/stores/planner-store';

// ─── Named constants ─────────────────────────────────────────────
/** Board item count at which chips switch from feeling → follow-up */
const FOLLOWUP_CHIP_THRESHOLD = 3;
/** How long the mobile "Added to board" toast stays visible (ms) */
const BOARD_NUDGE_DURATION_MS = 3000;

/**
 * Feeling-based chips mapped to SALTY Meter dimensions.
 * These replace generic destination chips with emotion-driven prompts
 * that make planning feel more intuitive ("How do you want to feel?").
 */
interface FeelingChip {
  label: string;
  icon: string;
  /** The message sent to the AI when tapped */
  prompt: string;
  /** SALTY Meter dimension this maps to */
  dimension: 'adventure' | 'culture' | 'party' | 'sweat' | 'rest';
}

const FEELING_CHIPS: FeelingChip[] = [
  {
    label: 'I want adventure',
    icon: '\u{1F919}',
    prompt: 'I want adventure — suggest exciting, adrenaline-filled activities and places I can explore before or after the retreat',
    dimension: 'adventure',
  },
  {
    label: 'Cultural deep dive',
    icon: '\u{1F3DB}',
    prompt: 'I want a cultural deep dive — suggest immersive local experiences, historic sites, markets, and art near the retreat',
    dimension: 'culture',
  },
  {
    label: "Where's the party?",
    icon: '\u{1F389}',
    prompt: "Where's the party? Suggest the best nightlife, bars, live music, and social scenes near the retreat",
    dimension: 'party',
  },
  {
    label: 'Make me sweat',
    icon: '\u{1F525}',
    prompt: 'Make me sweat — suggest high-intensity fitness activities, challenging hikes, surf spots, and active experiences near the retreat',
    dimension: 'sweat',
  },
  {
    label: 'Total relaxation',
    icon: '\u{1F30A}',
    prompt: 'I want total relaxation — suggest spas, wellness spots, quiet beaches, and peaceful places to unwind near the retreat',
    dimension: 'rest',
  },
];

/**
 * Follow-up chips shown after the user has some items on their board.
 * These encourage exploration of different categories than what they've already added.
 */
const FOLLOWUP_CHIPS: string[] = [
  'Best restaurants nearby',
  'Hidden gems only locals know',
  'Where to stay before flying in',
  'Plan my full before & after trip',
];

/**
 * Returns suggestion chips based on conversation stage:
 * - Initial: 5 feeling-based chips mapped to SALTY Meter
 * - After board has items: contextual follow-up chips
 */
export function getSuggestionChips(
  retreat: Retreat,
  boardItemCount: number
): { type: 'feeling'; chips: FeelingChip[] } | { type: 'followup'; chips: string[] } {
  if (boardItemCount >= FOLLOWUP_CHIP_THRESHOLD) {
    return { type: 'followup', chips: FOLLOWUP_CHIPS };
  }

  if (retreat.saltyMeter) {
    const meter = retreat.saltyMeter;
    const sorted = [...FEELING_CHIPS].sort((a, b) => {
      const aScore = meter[a.dimension as keyof typeof meter] as number;
      const bScore = meter[b.dimension as keyof typeof meter] as number;
      return aScore - bScore;
    });
    return { type: 'feeling', chips: sorted };
  }

  return { type: 'feeling', chips: FEELING_CHIPS };
}

interface UsePlannerChatOptions {
  retreat: Retreat;
}

export function usePlannerChat({ retreat }: UsePlannerChatOptions) {
  const addMessage = usePlannerStore((s) => s.addMessage);
  const addBoardItem = usePlannerStore((s) => s.addBoardItem);
  const boardItems = usePlannerStore((s) => s.boardItems);
  const setMobileActiveTab = usePlannerStore((s) => s.setMobileActiveTab);
  const completeDiscovery = usePlannerStore((s) => s.completeDiscovery);
  const discoveryStage = usePlannerStore((s) => s.discoveryStage);

  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [boardNudge, setBoardNudge] = useState(false);
  const usedChips = useRef(new Set<string>());

  const suggestionData = useMemo(
    () => getSuggestionChips(retreat, boardItems.length),
    [retreat, boardItems.length]
  );

  // Reset used chips when retreat changes
  useEffect(() => {
    usedChips.current = new Set<string>();
  }, [retreat.slug]);

  // ---------------------------------------------------------------------------
  // API communication
  // ---------------------------------------------------------------------------

  const sendToAPI = useCallback(
    async (userMessage: string, isAutoGreeting = false) => {
      if (isGenerating) return;
      setIsGenerating(true);

      const userMsg: ChatMessageV2 = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
        isAutoGreeting: isAutoGreeting || undefined,
      };
      addMessage(userMsg);

      try {
        // Read from store at call time (not closure) to avoid stale data
        const { boardItems: currentBoardItems, userProfile: currentProfile } =
          usePlannerStore.getState();

        const existingNames = currentBoardItems.map((item) => item.name).slice(-30);

        const currentMessages = usePlannerStore.getState().messages;
        const conversationHistory = currentMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const previouslyShownNames: string[] = [];
        for (const msg of currentMessages) {
          if (msg.recommendations) {
            for (const rec of msg.recommendations) {
              previouslyShownNames.push(rec.name);
            }
          }
        }
        const cappedPreviouslyShown = previouslyShownNames.slice(-50);

        const store = usePlannerStore.getState();

        const res = await fetch('/api/planner/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: retreat.destination,
            retreatName: retreat.title,
            retreatSlug: retreat.slug,
            userMessage,
            conversationHistory,
            existingBoardItems: existingNames,
            previouslyShownNames: cappedPreviouslyShown,
            userProfile: currentProfile,
            discoveryLocationChoice: store.discoveryLocationChoice,
            discoveryVibeChoice: store.discoveryVibeChoice,
            discoveryTypeChoices: store.discoveryTypeChoices,
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();

        const assistantMsg: ChatMessageV2 = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.text || "Here are some ideas for your trip!",
          recommendations: data.recommendations || [],
          timestamp: Date.now(),
        };

        addMessage(assistantMsg);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMsg: ChatMessageV2 = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Hmm, something went wrong on my end. Try asking again in a moment!",
          timestamp: Date.now(),
        };
        addMessage(errorMsg);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, retreat, addMessage]
  );

  // ---------------------------------------------------------------------------
  // User input handlers
  // ---------------------------------------------------------------------------

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isGenerating) return;
    setInputValue('');

    // If user types during discovery, complete it and send directly
    if (discoveryStage !== 'complete') {
      completeDiscovery();
    }

    sendToAPI(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChipClick(label: string, prompt: string) {
    if (isGenerating) return;
    usedChips.current.add(label);
    sendToAPI(prompt);
  }

  // ---------------------------------------------------------------------------
  // Board interactions
  // ---------------------------------------------------------------------------

  function handleAddToBoard(rec: RecommendationCard, messageId: string) {
    const item: BoardItem = {
      id: rec.id || `board-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: rec.type,
      cityName: rec.cityName,
      country: rec.country,
      name: rec.name,
      description: rec.description,
      activityCategory: rec.activityCategory,
      days: rec.days,
      priceRange: rec.priceRange,
      link: rec.link,
      imageUrl: null,
      addedAt: Date.now(),
      sourceMessageId: messageId,
    };
    addBoardItem(item);

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setBoardNudge(true);
      setTimeout(() => setBoardNudge(false), BOARD_NUDGE_DURATION_MS);
    }
  }

  function handleAddAllToBoard(recommendations: RecommendationCard[], messageId: string) {
    let addedCount = 0;
    for (const rec of recommendations) {
      if (!isItemOnBoard(rec)) {
        const item: BoardItem = {
          id: rec.id || `board-${Date.now()}-${addedCount}-${Math.random().toString(36).slice(2, 6)}`,
          type: rec.type,
          cityName: rec.cityName,
          country: rec.country,
          name: rec.name,
          description: rec.description,
          activityCategory: rec.activityCategory,
          days: rec.days,
          priceRange: rec.priceRange,
          link: rec.link,
          imageUrl: null,
          addedAt: Date.now() + addedCount,
          sourceMessageId: messageId,
        };
        addBoardItem(item);
        addedCount++;
      }
    }

    if (addedCount > 0 && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setBoardNudge(true);
      setTimeout(() => setBoardNudge(false), BOARD_NUDGE_DURATION_MS);
    }
  }

  function isItemOnBoard(rec: RecommendationCard): boolean {
    return boardItems.some(
      (item) =>
        item.name.toLowerCase() === rec.name.toLowerCase() &&
        item.cityName.toLowerCase() === rec.cityName.toLowerCase()
    );
  }

  return {
    // State
    inputValue,
    setInputValue,
    isGenerating,
    boardNudge,
    boardItems,
    suggestionData,
    usedChips,

    // API
    sendToAPI,

    // Handlers
    handleSend,
    handleKeyDown,
    handleChipClick,
    handleAddToBoard,
    handleAddAllToBoard,
    isItemOnBoard,

    // Board
    setMobileActiveTab,
  };
}
