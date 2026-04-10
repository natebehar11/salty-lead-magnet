/**
 * Cross-store lead state utilities.
 *
 * Three stores independently track lead capture (quiz, flights, planner).
 * This module provides a single source of truth for "has this user already
 * given us their contact info?" so no store re-prompts a returning lead.
 */

import { LeadCaptureData } from '@/types';
import { useQuizStore } from '@/stores/quiz-store';
import { useFlightStore } from '@/stores/flight-store';
import { usePlannerStore } from '@/stores/planner-store';

/**
 * Returns the first available LeadCaptureData from any store, or null.
 * Priority: quiz → flights → planner (planner uses separate field names).
 *
 * Call from outside React (event handlers, callbacks) via getState().
 */
export function getExistingLead(): LeadCaptureData | null {
  const quiz = useQuizStore.getState();
  if (quiz.leadData) return quiz.leadData;

  const flight = useFlightStore.getState();
  if (flight.leadData) return flight.leadData;

  const planner = usePlannerStore.getState();
  if (planner.creatorEmail && planner.creatorName) {
    return {
      firstName: planner.creatorName,
      email: planner.creatorEmail,
      whatsappNumber: '', // planner doesn't always collect this
    };
  }

  return null;
}

/**
 * Returns true if ANY store has captured lead info.
 */
export function hasAnyLeadData(): boolean {
  return getExistingLead() !== null;
}

/**
 * Hydrates a target store with lead data from other stores if available.
 * Call this on mount for any lead-gated feature to check cross-store state.
 */
export function hydrateLeadFromOtherStores(
  target: 'quiz' | 'flights' | 'planner'
): LeadCaptureData | null {
  const existing = getExistingLead();
  if (!existing) return null;

  if (target === 'quiz') {
    const quiz = useQuizStore.getState();
    if (!quiz.leadData) {
      quiz.setLeadData(existing);
    }
  } else if (target === 'flights') {
    const flight = useFlightStore.getState();
    if (!flight.leadData) {
      flight.setLeadData(existing);
    }
  } else if (target === 'planner') {
    const planner = usePlannerStore.getState();
    if (!planner.creatorName && !planner.creatorEmail) {
      planner.setCreatorName(existing.firstName);
      planner.setCreatorEmail(existing.email);
    }
  }

  return existing;
}
