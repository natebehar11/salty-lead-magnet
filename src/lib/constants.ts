import type { ActivityCategoryV2 } from '@/types/vision-board';
import type { SharedPlanFriend, SharedReaction } from '@/lib/shared-plans';

// --- Category Icons ---
// Maps activity categories to emoji icons. Single source of truth for the entire app.

export const CATEGORY_ICONS: Record<ActivityCategoryV2, string> = {
  landmark: '📍',
  fitness: '💪',
  restaurant: '🍽',
  neighborhood: '🏘',
  'hidden-gem': '💎',
  outdoor: '🌿',
  nightlife: '🌙',
  wellness: '🧘',
};

export const CATEGORY_LABELS: Record<ActivityCategoryV2, string> = {
  landmark: 'Landmark',
  fitness: 'Fitness',
  restaurant: 'Restaurant',
  neighborhood: 'Neighborhood',
  'hidden-gem': 'Hidden Gem',
  outdoor: 'Outdoor',
  nightlife: 'Nightlife',
  wellness: 'Wellness',
};

/** Fallback icon for unknown or missing activity categories */
export const CATEGORY_ICON_FALLBACK = '📌';

/** Category accent colors for vision board items — subtle background tints */
export const CATEGORY_ACCENT_COLORS: Record<ActivityCategoryV2, string> = {
  landmark: 'bg-amber-50 border-amber-200/60',
  fitness: 'bg-rose-50 border-rose-200/60',
  restaurant: 'bg-orange-50 border-orange-200/60',
  neighborhood: 'bg-violet-50 border-violet-200/60',
  'hidden-gem': 'bg-fuchsia-50 border-fuchsia-200/60',
  outdoor: 'bg-emerald-50 border-emerald-200/60',
  nightlife: 'bg-indigo-50 border-indigo-200/60',
  wellness: 'bg-teal-50 border-teal-200/60',
};

export const CATEGORY_ACCENT_FALLBACK = 'bg-white/60 border-salty-beige/40';

/** Icon for city-type items */
export const CITY_ICON = '🏙';

// --- Reaction Emojis ---

export const REACTION_EMOJIS: Record<SharedReaction['reaction'], string> = {
  love: '❤️',
  interested: '👀',
  meh: '😐',
};

// --- Friend Status Labels ---

export const STATUS_LABELS: Record<SharedPlanFriend['status'], string> = {
  in: "I'm in!",
  interested: 'Interested',
  maybe: 'Maybe',
  out: 'Not this time',
};

export const STATUS_COLORS: Record<SharedPlanFriend['status'], string> = {
  in: 'bg-salty-seafoam text-salty-deep-teal',
  interested: 'bg-salty-light-blue text-salty-deep-teal',
  maybe: 'bg-salty-yellow text-salty-deep-teal',
  out: 'bg-salty-beige text-salty-slate',
};

// --- Region Gradient Fallbacks ---
// Used when Unsplash hero image is unavailable for a city

export const REGION_GRADIENTS: Record<string, string> = {
  'Costa Rica': 'from-emerald-600 to-teal-400',
  'Sri Lanka': 'from-amber-500 to-orange-400',
  'Morocco': 'from-orange-600 to-amber-500',
  'Italy': 'from-blue-500 to-sky-400',
  'Sicily': 'from-blue-500 to-sky-400',
  'El Salvador': 'from-teal-500 to-emerald-400',
  'Panama': 'from-sky-500 to-blue-400',
};

export const REGION_GRADIENT_FALLBACK = 'from-salty-deep-teal to-salty-seafoam';
