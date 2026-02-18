import { useQuizStore } from '@/stores/quiz-store';
import type { LeadCaptureData, QuizResult } from '@/types/quiz';

beforeEach(() => {
  useQuizStore.setState({
    currentStep: 0,
    answers: {
      vibes: [],
      groupStyle: null,
      budget: null,
      roomPreference: null,
      availability: [],
      regions: [],
      partyVsRest: 5,
      travelingSolo: null,
      experienceLevel: null,
      mustHaves: [],
    },
    leadData: null,
    results: null,
    isComplete: false,
    hasSubmittedLead: false,
  });
});

describe('useQuizStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useQuizStore.getState();
      expect(state.currentStep).toBe(0);
      expect(state.answers.vibes).toEqual([]);
      expect(state.isComplete).toBe(false);
      expect(state.hasSubmittedLead).toBe(false);
    });
  });

  describe('setAnswer', () => {
    it('sets a specific key without affecting others', () => {
      useQuizStore.getState().setAnswer('vibes', ['adventure', 'culture']);
      const state = useQuizStore.getState();
      expect(state.answers.vibes).toEqual(['adventure', 'culture']);
      expect(state.answers.groupStyle).toBeNull();
      expect(state.answers.partyVsRest).toBe(5);
    });
  });

  describe('nextStep', () => {
    it('increments currentStep by 1', () => {
      useQuizStore.getState().nextStep();
      expect(useQuizStore.getState().currentStep).toBe(1);
    });

    it('does not exceed the max step index (6)', () => {
      useQuizStore.setState({ currentStep: 6 });
      useQuizStore.getState().nextStep();
      expect(useQuizStore.getState().currentStep).toBe(6);
    });
  });

  describe('prevStep', () => {
    it('decrements currentStep by 1', () => {
      useQuizStore.setState({ currentStep: 3 });
      useQuizStore.getState().prevStep();
      expect(useQuizStore.getState().currentStep).toBe(2);
    });

    it('does not go below 0', () => {
      useQuizStore.setState({ currentStep: 0 });
      useQuizStore.getState().prevStep();
      expect(useQuizStore.getState().currentStep).toBe(0);
    });
  });

  describe('goToStep', () => {
    it('sets currentStep directly', () => {
      useQuizStore.getState().goToStep(4);
      expect(useQuizStore.getState().currentStep).toBe(4);
    });
  });

  describe('setResults', () => {
    it('sets results and marks isComplete as true', () => {
      const mockResults: QuizResult[] = [
        {
          retreat: { slug: 'costa-rica' } as QuizResult['retreat'],
          matchScore: 85,
          breakdown: { vibeScore: 9, roomScore: 8, dateScore: 7, regionScore: 6, activityScore: 8, partyRestScore: 7 },
          whyMatch: ['Great vibes'],
        },
      ];
      useQuizStore.getState().setResults(mockResults);
      const state = useQuizStore.getState();
      expect(state.results).toEqual(mockResults);
      expect(state.isComplete).toBe(true);
    });
  });

  describe('setLeadData', () => {
    it('sets leadData and hasSubmittedLead to true', () => {
      const lead: LeadCaptureData = { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1234567890' };
      useQuizStore.getState().setLeadData(lead);
      const state = useQuizStore.getState();
      expect(state.leadData).toEqual(lead);
      expect(state.hasSubmittedLead).toBe(true);
    });
  });

  describe('reset', () => {
    it('returns all state to initial values', () => {
      useQuizStore.getState().setAnswer('vibes', ['party']);
      useQuizStore.getState().nextStep();
      useQuizStore.getState().nextStep();
      useQuizStore.getState().setLeadData({ firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1' });

      useQuizStore.getState().reset();
      const state = useQuizStore.getState();

      expect(state.currentStep).toBe(0);
      expect(state.answers.vibes).toEqual([]);
      expect(state.isComplete).toBe(false);
      expect(state.hasSubmittedLead).toBe(false);
      expect(state.leadData).toBeNull();
      expect(state.results).toBeNull();
    });
  });
});
