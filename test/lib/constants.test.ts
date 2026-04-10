import { describe, it, expect } from 'vitest';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_ICON_FALLBACK,
  CITY_ICON,
  REACTION_EMOJIS,
  STATUS_LABELS,
  STATUS_COLORS,
  REGION_GRADIENTS,
  REGION_GRADIENT_FALLBACK,
} from '../constants';
import type { ActivityCategoryV2 } from '@/types/vision-board';

const ALL_CATEGORIES: ActivityCategoryV2[] = [
  'landmark', 'fitness', 'restaurant', 'neighborhood',
  'hidden-gem', 'outdoor', 'nightlife', 'wellness',
];

describe('CATEGORY_ICONS', () => {
  it('has an entry for every ActivityCategoryV2', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_ICONS[cat]).toBeDefined();
      expect(typeof CATEGORY_ICONS[cat]).toBe('string');
    }
  });
});

describe('CATEGORY_LABELS', () => {
  it('has a label for every ActivityCategoryV2', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    }
  });
});

describe('CATEGORY_ICON_FALLBACK', () => {
  it('is a non-empty string', () => {
    expect(CATEGORY_ICON_FALLBACK).toBeTruthy();
  });
});

describe('CITY_ICON', () => {
  it('is a non-empty string', () => {
    expect(CITY_ICON).toBeTruthy();
  });
});

describe('REACTION_EMOJIS', () => {
  it('has entries for love, interested, meh', () => {
    expect(REACTION_EMOJIS.love).toBeTruthy();
    expect(REACTION_EMOJIS.interested).toBeTruthy();
    expect(REACTION_EMOJIS.meh).toBeTruthy();
  });
});

describe('STATUS_LABELS', () => {
  it('has labels for all friend statuses', () => {
    expect(STATUS_LABELS.in).toBeTruthy();
    expect(STATUS_LABELS.interested).toBeTruthy();
    expect(STATUS_LABELS.maybe).toBeTruthy();
    expect(STATUS_LABELS.out).toBeTruthy();
  });
});

describe('STATUS_COLORS', () => {
  it('has tailwind classes for all friend statuses', () => {
    expect(STATUS_COLORS.in).toContain('bg-');
    expect(STATUS_COLORS.interested).toContain('bg-');
    expect(STATUS_COLORS.maybe).toContain('bg-');
    expect(STATUS_COLORS.out).toContain('bg-');
  });
});

describe('REGION_GRADIENTS', () => {
  it('has gradients for retreat destinations', () => {
    expect(REGION_GRADIENTS['Costa Rica']).toContain('from-');
    expect(REGION_GRADIENTS['Sri Lanka']).toContain('from-');
    expect(REGION_GRADIENTS['Morocco']).toContain('from-');
  });
});

describe('REGION_GRADIENT_FALLBACK', () => {
  it('is a valid gradient class', () => {
    expect(REGION_GRADIENT_FALLBACK).toContain('from-');
    expect(REGION_GRADIENT_FALLBACK).toContain('to-');
  });
});
