/**
 * Barrel export for all types
 * Single entry point for type imports across the project
 */

// Alliance types
export type { Alliance } from './alliances';

// Country code types
export type { CountryCode } from './country-codes';

// City cost anchor types
export type { CityAnchor, CityLineItem } from './city-cost-anchors';

// DIY pricing types
export type { DIYLineItem, DIYComparison } from './diy-pricing';

// Flight types
export type {
  Airport,
  FlightSegment,
  FlightOption,
  FlightSearch,
  FlightSearchResults,
  FlightFilters,
  FlightSortMode,
  FlightDateOption,
  ReturnDateOption,
} from './flight';

// Mock flight types
export type { MockFlightConfig } from './mock-flights';

// Quiz types
export type {
  VibePreference,
  GroupStyle,
  BudgetRange,
  ExperienceLevel,
  RoomPreference,
  QuizAnswers,
  LeadCaptureData,
  QuizResult,
  QuizStep,
} from './quiz';

// Quiz constants
export { QUIZ_STEPS } from './quiz';

// Planner types
export type { PlannerCity, ItinerarySuggestion } from './planner';

// Retreat types
export type {
  Location,
  RoomTier,
  Activity,
  Coach,
  Testimonial,
  SaltyMeter,
  Retreat,
} from './retreat';
