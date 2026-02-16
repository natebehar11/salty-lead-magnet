import { Retreat } from './retreat';

export type VibePreference = 'adventure' | 'culture' | 'party' | 'fitness' | 'rest';
export type GroupStyle = 'solo' | 'couple' | 'small-group' | 'big-crew';
export type ExperienceLevel = 'first-timer' | 'few-trips' | 'seasoned';
export type BudgetRange = 'under-2000' | '2000-2500' | '2500-3000' | '3000-plus';
export type RoomPreference = 'dorm' | 'triple' | 'premium' | 'single';

export interface QuizAnswers {
  vibes: VibePreference[];
  groupStyle: GroupStyle | null;
  budget: BudgetRange | null;
  roomPreference: RoomPreference | null;
  availability: string[];
  regions: string[];
  partyVsRest: number;
  travelingSolo: boolean | null;
  experienceLevel: ExperienceLevel | null;
  mustHaves: string[];
}

export interface QuizResult {
  retreat: Retreat;
  matchScore: number;
  breakdown: {
    vibeScore: number;
    roomScore: number;
    dateScore: number;
    regionScore: number;
    activityScore: number;
    partyRestScore: number;
  };
  whyMatch: string[];
}

export interface LeadCaptureData {
  firstName: string;
  email: string;
  whatsappNumber: string;
}

export const QUIZ_STEPS = [
  'vibes',
  'roomPreference',
  'availability',
  'regions',
  'partyVsRest',
  'mustHaves',
  'leadCapture',
] as const;

export type QuizStep = (typeof QUIZ_STEPS)[number];
