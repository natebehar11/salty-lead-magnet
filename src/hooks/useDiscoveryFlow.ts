'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Retreat } from '@/types';
import { ChatMessageV2 } from '@/types/vision-board';
import { usePlannerStore } from '@/stores/planner-store';
import { useQuizStore } from '@/stores/quiz-store';
import {
  getLocationMessage,
  getLocationOptions,
  getVibeMessage,
  getVibeOptions,
  getTypesMessage,
  getTypesOptions,
  getOptionLabel,
  buildDiscoveryPrompt,
  ALL_TYPE_VALUES,
} from '@/lib/discovery-messages';
import type { DiscoveryStage } from '@/lib/discovery-messages';

/** Delay (ms) between discovery steps so the UI doesn't feel instant */
const DISCOVERY_STEP_DELAY_MS = 400;

const REENGAGEMENT_OPTIONS = [
  { label: 'Try another location', emoji: '🗺', value: 'restart-location' },
  { label: 'New discovery', emoji: '🔄', value: 'restart-full' },
];

interface UseDiscoveryFlowOptions {
  retreat: Retreat;
  /** Callback to send a combined discovery prompt to the AI */
  onDiscoveryComplete: (prompt: string) => void;
}

export function useDiscoveryFlow({ retreat, onDiscoveryComplete }: UseDiscoveryFlowOptions) {
  const messages = usePlannerStore((s) => s.messages);
  const addMessage = usePlannerStore((s) => s.addMessage);

  // Discovery state
  const discoveryStage = usePlannerStore((s) => s.discoveryStage);
  const discoveryIsSurprise = usePlannerStore((s) => s.discoveryIsSurprise);
  const setDiscoveryStage = usePlannerStore((s) => s.setDiscoveryStage);
  const setDiscoveryLocationChoice = usePlannerStore((s) => s.setDiscoveryLocationChoice);
  const setDiscoveryVibeChoice = usePlannerStore((s) => s.setDiscoveryVibeChoice);
  const setDiscoveryTypeChoices = usePlannerStore((s) => s.setDiscoveryTypeChoices);
  const setDiscoveryIsSurprise = usePlannerStore((s) => s.setDiscoveryIsSurprise);
  const completeDiscovery = usePlannerStore((s) => s.completeDiscovery);
  const restartDiscoveryAtLocation = usePlannerStore((s) => s.restartDiscoveryAtLocation);
  const resetDiscovery = usePlannerStore((s) => s.resetDiscovery);

  const [showReengagement, setShowReengagement] = useState(false);
  const hasInitiatedDiscovery = useRef(false);

  // Initiate discovery on first load (replaces auto-greeting)
  useEffect(() => {
    if (
      messages.length === 0 &&
      discoveryStage === 'greeting' &&
      !hasInitiatedDiscovery.current
    ) {
      hasInitiatedDiscovery.current = true;
      initiateDiscovery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate quiz profile on mount
  useEffect(() => {
    const quizState = useQuizStore.getState();
    if (quizState.isComplete && quizState.answers) {
      usePlannerStore.getState().hydrateProfile({
        vibes: quizState.answers.vibes || [],
        partyVsRest: quizState.answers.partyVsRest ?? 5,
        groupStyle: quizState.answers.groupStyle || null,
        experienceLevel: quizState.answers.experienceLevel || null,
        mustHaves: quizState.answers.mustHaves || [],
        hasCompletedQuiz: true,
      });
    }
  }, []);

  function initiateDiscovery() {
    const text = getLocationMessage(retreat.title, retreat.destination);
    addMessage({
      id: `discovery-location-${Date.now()}`,
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    });
    setDiscoveryStage('location');
  }

  function handleDiscoveryLocationSelect(value: string) {
    if (value === 'surprise') {
      setDiscoveryIsSurprise(true);
    }
    setDiscoveryLocationChoice(value);

    const label = getOptionLabel('location', value, retreat.destination);
    addMessage({
      id: `user-location-${Date.now()}`,
      role: 'user',
      content: label,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      const isSurprise = value === 'surprise' || discoveryIsSurprise;
      const text = getVibeMessage(value, retreat.destination, isSurprise);
      addMessage({
        id: `discovery-vibe-${Date.now()}`,
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
      });
      setDiscoveryStage('vibe');
    }, DISCOVERY_STEP_DELAY_MS);
  }

  function handleDiscoveryVibeSelect(value: string) {
    if (value === 'surprise' && !discoveryIsSurprise) {
      setDiscoveryIsSurprise(true);
    }
    setDiscoveryVibeChoice(value);

    const label = getOptionLabel('vibe', value);
    addMessage({
      id: `user-vibe-${Date.now()}`,
      role: 'user',
      content: label,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      const isSurprise = value === 'surprise' || discoveryIsSurprise;
      const text = getTypesMessage(value, isSurprise);
      addMessage({
        id: `discovery-types-${Date.now()}`,
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
      });
      setDiscoveryStage('types');
    }, DISCOVERY_STEP_DELAY_MS);
  }

  function handleDiscoveryTypesSubmit(values: string[]) {
    setDiscoveryTypeChoices(values);

    const labels = values.map((v) => getOptionLabel('types', v));
    const isAll = values.length === ALL_TYPE_VALUES.length;
    const userText = isAll ? 'Show me everything!' : labels.join(', ');
    addMessage({
      id: `user-types-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    });

    completeDiscovery();

    const store = usePlannerStore.getState();
    const combinedPrompt = buildDiscoveryPrompt(
      retreat.title,
      retreat.destination,
      store.discoveryLocationChoice,
      store.discoveryVibeChoice,
      values,
    );

    onDiscoveryComplete(
      `Based on my preferences: ${combinedPrompt}. Help me plan my trip!`
    );
    setShowReengagement(true);
  }

  function handleReengagement(value: string) {
    setShowReengagement(false);

    if (value === 'restart-location') {
      restartDiscoveryAtLocation();
      const text = getLocationMessage(retreat.title, retreat.destination);
      addMessage({
        id: `discovery-location-restart-${Date.now()}`,
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
      });
      setDiscoveryStage('location');
    } else if (value === 'restart-full') {
      resetDiscovery();
      initiateDiscovery();
    }
  }

  const isDiscoveryActive = discoveryStage !== 'complete' && discoveryStage !== 'greeting';

  return {
    discoveryStage,
    isDiscoveryActive,
    showReengagement,
    completeDiscovery,
    handleDiscoveryLocationSelect,
    handleDiscoveryVibeSelect,
    handleDiscoveryTypesSubmit,
    handleReengagement,
    /** Options data for rendering discovery UI */
    getLocationOptions: () => getLocationOptions(retreat.destination),
    getVibeOptions,
    getTypesOptions,
    REENGAGEMENT_OPTIONS,
  };
}
