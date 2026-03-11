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
  FlightBuckets,
  FlightSearchResults,
  FlightFilters,
  FlightSortMode,
  FlightDateOption,
  ReturnDateOption,
  TripType,
  MultiCityLeg,
  MultiCityLegResult,
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

// Vision Board types (v2 — chat-first planner)
export type {
  BoardItemCategory,
  ActivityCategoryV2,
  BoardItem,
  BoardCityGroup,
  RecommendationCard,
  ChatMessageV2,
  UserTravelProfile,
} from './vision-board';

// Shared plan types — canonical source is @/lib/shared-plans
export type {
  SharedBoardItemData,
  SharedReaction,
  SharedPlanFriend,
  SharedPlanV2,
  SharedPlanAny,
} from '../lib/shared-plans';

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
