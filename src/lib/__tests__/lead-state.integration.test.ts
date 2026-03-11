import { describe, it, expect, beforeEach } from 'vitest';
import { getExistingLead, hasAnyLeadData, hydrateLeadFromOtherStores } from '@/lib/lead-state';
import { useQuizStore } from '@/stores/quiz-store';
import { useFlightStore } from '@/stores/flight-store';
import { usePlannerStore } from '@/stores/planner-store';
import type { LeadCaptureData } from '@/types';

const quizLead: LeadCaptureData = {
  firstName: 'Nate',
  email: 'nate@salty.com',
  whatsappNumber: '+14318291135',
};

const flightLead: LeadCaptureData = {
  firstName: 'Erin',
  email: 'erin@salty.com',
  whatsappNumber: '+15551234567',
};

beforeEach(() => {
  // Reset all stores to clean state
  useQuizStore.setState({
    currentStep: 0,
    leadData: null,
    results: null,
    isComplete: false,
    hasSubmittedLead: false,
  });
  useFlightStore.setState({
    leadData: null,
    hasSubmittedLead: false,
  });
  usePlannerStore.setState({
    creatorName: '',
    creatorEmail: '',
    userProfile: null,
  });
});

// ---------------------------------------------------------------------------
// getExistingLead — cross-store resolution
// ---------------------------------------------------------------------------

describe('getExistingLead', () => {
  it('returns quiz store lead data when available', () => {
    useQuizStore.getState().setLeadData(quizLead);
    const result = getExistingLead();
    expect(result).toEqual(quizLead);
  });

  it('returns flight store lead data when quiz has none', () => {
    useFlightStore.getState().setLeadData(flightLead);
    const result = getExistingLead();
    expect(result).toEqual(flightLead);
  });

  it('returns null when no stores have lead data', () => {
    expect(getExistingLead()).toBeNull();
  });

  it('prefers quiz store data over flight store when both have data', () => {
    useQuizStore.getState().setLeadData(quizLead);
    useFlightStore.getState().setLeadData(flightLead);

    const result = getExistingLead();
    expect(result?.firstName).toBe('Nate');
    expect(result?.email).toBe('nate@salty.com');
  });

  it('returns planner-derived lead when quiz and flight stores are empty', () => {
    usePlannerStore.setState({ creatorName: 'Lisa', creatorEmail: 'lisa@salty.com' });
    const result = getExistingLead();
    expect(result).not.toBeNull();
    expect(result?.firstName).toBe('Lisa');
    expect(result?.email).toBe('lisa@salty.com');
    expect(result?.whatsappNumber).toBe('');
  });

  it('does not treat planner with only name (no email) as valid lead', () => {
    usePlannerStore.setState({ creatorName: 'Lisa', creatorEmail: '' });
    expect(getExistingLead()).toBeNull();
  });

  it('does not treat planner with only email (no name) as valid lead', () => {
    usePlannerStore.setState({ creatorName: '', creatorEmail: 'lisa@salty.com' });
    expect(getExistingLead()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// hasAnyLeadData
// ---------------------------------------------------------------------------

describe('hasAnyLeadData', () => {
  it('returns false when all stores are empty', () => {
    expect(hasAnyLeadData()).toBe(false);
  });

  it('returns true when quiz store has lead data', () => {
    useQuizStore.getState().setLeadData(quizLead);
    expect(hasAnyLeadData()).toBe(true);
  });

  it('returns true when planner has name and email', () => {
    usePlannerStore.setState({ creatorName: 'Lisa', creatorEmail: 'lisa@salty.com' });
    expect(hasAnyLeadData()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// hydrateLeadFromOtherStores — cross-store hydration
// ---------------------------------------------------------------------------

describe('hydrateLeadFromOtherStores', () => {
  it('returns null when no stores have lead data', () => {
    expect(hydrateLeadFromOtherStores('quiz')).toBeNull();
  });

  it('hydrates quiz store from flight store lead data', () => {
    useFlightStore.getState().setLeadData(flightLead);
    const result = hydrateLeadFromOtherStores('quiz');
    expect(result).toEqual(flightLead);
    expect(useQuizStore.getState().leadData).toEqual(flightLead);
    expect(useQuizStore.getState().hasSubmittedLead).toBe(true);
  });

  it('hydrates flight store from quiz store lead data', () => {
    useQuizStore.getState().setLeadData(quizLead);
    const result = hydrateLeadFromOtherStores('flights');
    expect(result).toEqual(quizLead);
    expect(useFlightStore.getState().leadData).toEqual(quizLead);
    expect(useFlightStore.getState().hasSubmittedLead).toBe(true);
  });

  it('hydrates planner store from quiz store lead data', () => {
    useQuizStore.getState().setLeadData(quizLead);
    hydrateLeadFromOtherStores('planner');
    expect(usePlannerStore.getState().creatorName).toBe('Nate');
    expect(usePlannerStore.getState().creatorEmail).toBe('nate@salty.com');
  });

  it('does not overwrite existing quiz store lead data', () => {
    useQuizStore.getState().setLeadData(quizLead);
    useFlightStore.getState().setLeadData(flightLead);
    hydrateLeadFromOtherStores('quiz');
    // Quiz already had data — should keep its own
    expect(useQuizStore.getState().leadData).toEqual(quizLead);
  });

  it('does not overwrite existing planner store lead data', () => {
    usePlannerStore.setState({ creatorName: 'Lisa', creatorEmail: 'lisa@salty.com' });
    useQuizStore.getState().setLeadData(quizLead);
    hydrateLeadFromOtherStores('planner');
    expect(usePlannerStore.getState().creatorName).toBe('Lisa');
  });
});

// ---------------------------------------------------------------------------
// Planner hydrateProfile — quiz → planner user profile mapping
// ---------------------------------------------------------------------------

describe('planner hydrateProfile', () => {
  it('correctly maps quiz-derived user profile to planner state', () => {
    usePlannerStore.getState().hydrateProfile({
      vibes: ['adventure', 'culture'],
      partyVsRest: 3,
      groupStyle: 'small-group',
      experienceLevel: 'few-trips',
      mustHaves: ['yoga', 'surfing'],
      hasCompletedQuiz: true,
    });

    const profile = usePlannerStore.getState().userProfile;
    expect(profile?.vibes).toEqual(['adventure', 'culture']);
    expect(profile?.partyVsRest).toBe(3);
    expect(profile?.mustHaves).toEqual(['yoga', 'surfing']);
    expect(profile?.hasCompletedQuiz).toBe(true);
  });

  it('does not set profile when called with undefined', () => {
    usePlannerStore.getState().hydrateProfile(undefined);
    expect(usePlannerStore.getState().userProfile).toBeNull();
  });

  it('overwrites existing profile with new quiz data', () => {
    usePlannerStore.getState().hydrateProfile({
      vibes: ['rest'],
      partyVsRest: 8,
      groupStyle: 'solo',
      experienceLevel: 'first-timer',
      mustHaves: [],
      hasCompletedQuiz: true,
    });

    usePlannerStore.getState().hydrateProfile({
      vibes: ['adventure', 'party'],
      partyVsRest: 2,
      groupStyle: 'big-crew',
      experienceLevel: 'seasoned',
      mustHaves: ['surfing'],
      hasCompletedQuiz: true,
    });

    expect(usePlannerStore.getState().userProfile?.vibes).toEqual(['adventure', 'party']);
    expect(usePlannerStore.getState().userProfile?.partyVsRest).toBe(2);
  });
});
