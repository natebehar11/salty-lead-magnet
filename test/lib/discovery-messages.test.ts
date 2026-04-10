import { describe, it, expect } from 'vitest';
import {
  getLocationMessage,
  getLocationOptions,
  formatLocationChoice,
  getVibeMessage,
  getVibeOptions,
  formatVibeChoice,
  getTypesMessage,
  getTypesOptions,
  formatTypeChoices,
  buildDiscoveryPrompt,
  getOptionLabel,
  ALL_TYPE_VALUES,
} from '@/lib/discovery-messages';

// ---------------------------------------------------------------------------
// Layer 1 — Location
// ---------------------------------------------------------------------------

describe('getLocationMessage', () => {
  it('includes retreat title and destination', () => {
    const msg = getLocationMessage('SALTY Morocco', 'Morocco');
    expect(msg).toContain('SALTY Morocco');
    expect(msg).toContain('Morocco');
  });
});

describe('getLocationOptions', () => {
  it('returns 5 options', () => {
    expect(getLocationOptions('Morocco')).toHaveLength(5);
  });

  it('includes destination in first option label', () => {
    const opts = getLocationOptions('Costa Rica');
    expect(opts[0].label).toContain('Costa Rica');
  });

  it('each option has label, emoji, and value', () => {
    for (const opt of getLocationOptions('Morocco')) {
      expect(opt.label).toBeTruthy();
      expect(opt.emoji).toBeTruthy();
      expect(opt.value).toBeTruthy();
    }
  });

  it('has unique values', () => {
    const values = getLocationOptions('Morocco').map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('formatLocationChoice', () => {
  it('formats explore-same with destination', () => {
    expect(formatLocationChoice('explore-same', 'Morocco')).toContain('Morocco');
  });

  it('formats nearby-country with destination', () => {
    expect(formatLocationChoice('nearby-country', 'Morocco')).toContain('Morocco');
  });

  it('formats both with destination', () => {
    expect(formatLocationChoice('both', 'Morocco')).toContain('Morocco');
  });

  it('formats surprise as open to exploring', () => {
    expect(formatLocationChoice('surprise', 'Morocco')).toContain('open to exploring');
  });

  it('formats specific-places as has specific places', () => {
    expect(formatLocationChoice('specific-places', 'Morocco')).toContain('specific places');
  });

  it('formats custom text with the raw value', () => {
    expect(formatLocationChoice('Marrakech and Essaouira', 'Morocco')).toContain('Marrakech and Essaouira');
  });
});

// ---------------------------------------------------------------------------
// Layer 2 — Vibe
// ---------------------------------------------------------------------------

describe('getVibeMessage', () => {
  it('returns surprise variant when isSurprise is true', () => {
    const msg = getVibeMessage('surprise', 'Morocco', true);
    expect(msg).toContain('best of what');
    expect(msg).toContain('Morocco');
  });

  it('returns explore-same variant', () => {
    const msg = getVibeMessage('explore-same', 'Morocco', false);
    expect(msg).toContain('Morocco');
    expect(msg).toContain('so much to offer');
  });

  it('returns nearby-country variant', () => {
    const msg = getVibeMessage('nearby-country', 'Morocco', false);
    expect(msg).toContain('amazing spots near');
  });

  it('returns both variant', () => {
    const msg = getVibeMessage('both', 'Morocco', false);
    expect(msg).toContain('mix it up');
  });

  it('returns default variant for custom input', () => {
    const msg = getVibeMessage('Marrakech', 'Morocco', false);
    expect(msg).toContain('vibe');
  });
});

describe('getVibeOptions', () => {
  it('returns 6 options', () => {
    expect(getVibeOptions()).toHaveLength(6);
  });

  it('each option has label, emoji, and value', () => {
    for (const opt of getVibeOptions()) {
      expect(opt.label).toBeTruthy();
      expect(opt.emoji).toBeTruthy();
      expect(opt.value).toBeTruthy();
    }
  });

  it('has unique values', () => {
    const values = getVibeOptions().map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('includes surprise option', () => {
    expect(getVibeOptions().some((o) => o.value === 'surprise')).toBe(true);
  });

  it('includes mix-everything option', () => {
    expect(getVibeOptions().some((o) => o.value === 'mix-everything')).toBe(true);
  });
});

describe('formatVibeChoice', () => {
  it('formats chill-relax', () => {
    expect(formatVibeChoice('chill-relax')).toContain('chill');
  });

  it('formats explore-sightsee', () => {
    expect(formatVibeChoice('explore-sightsee')).toContain('explore');
  });

  it('formats adventure-adrenaline', () => {
    expect(formatVibeChoice('adventure-adrenaline')).toContain('adventure');
  });

  it('formats party-nightlife', () => {
    expect(formatVibeChoice('party-nightlife')).toContain('party');
  });

  it('formats mix-everything', () => {
    expect(formatVibeChoice('mix-everything')).toContain('mix');
  });

  it('formats surprise as open to all vibes', () => {
    expect(formatVibeChoice('surprise')).toContain('open to all vibes');
  });

  it('formats custom value', () => {
    expect(formatVibeChoice('beach vibes')).toContain('beach vibes');
  });
});

// ---------------------------------------------------------------------------
// Layer 3 — Types
// ---------------------------------------------------------------------------

describe('getTypesMessage', () => {
  it('returns surprise variant when isSurprise is true', () => {
    const msg = getTypesMessage('chill-relax', true);
    expect(msg).toContain('fun and open');
  });

  it('returns surprise variant when vibeChoice is surprise', () => {
    const msg = getTypesMessage('surprise', false);
    expect(msg).toContain('fun and open');
  });

  it('returns chill-relax variant', () => {
    const msg = getTypesMessage('chill-relax', false);
    expect(msg).toContain('Relaxation');
  });

  it('returns explore-sightsee variant', () => {
    const msg = getTypesMessage('explore-sightsee', false);
    expect(msg).toContain('Explorer');
  });

  it('returns adventure-adrenaline variant', () => {
    const msg = getTypesMessage('adventure-adrenaline', false);
    expect(msg).toContain('Adrenaline');
  });

  it('returns party-nightlife variant', () => {
    const msg = getTypesMessage('party-nightlife', false);
    expect(msg).toContain('Party');
  });

  it('returns mix-everything variant', () => {
    const msg = getTypesMessage('mix-everything', false);
    expect(msg).toContain('everything');
  });

  it('returns default variant for unknown vibe', () => {
    const msg = getTypesMessage('something-else', false);
    expect(msg).toContain('Almost there');
  });
});

describe('getTypesOptions', () => {
  it('returns 8 options', () => {
    expect(getTypesOptions()).toHaveLength(8);
  });

  it('each option has label, emoji, value, and description', () => {
    for (const opt of getTypesOptions()) {
      expect(opt.label).toBeTruthy();
      expect(opt.emoji).toBeTruthy();
      expect(opt.value).toBeTruthy();
      expect(opt.description).toBeTruthy();
    }
  });

  it('has unique values', () => {
    const values = getTypesOptions().map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('ALL_TYPE_VALUES', () => {
  it('has 8 values matching getTypesOptions', () => {
    expect(ALL_TYPE_VALUES).toHaveLength(8);
    expect(ALL_TYPE_VALUES).toEqual(getTypesOptions().map((o) => o.value));
  });
});

describe('formatTypeChoices', () => {
  it('formats a single type', () => {
    expect(formatTypeChoices(['restaurants'])).toBe('looking for restaurants & food');
  });

  it('formats two types with "and"', () => {
    expect(formatTypeChoices(['restaurants', 'beaches'])).toBe(
      'looking for restaurants & food and beaches & surf',
    );
  });

  it('formats three types with commas and "and"', () => {
    expect(formatTypeChoices(['restaurants', 'beaches', 'nightlife'])).toBe(
      'looking for restaurants & food, beaches & surf, and nightlife & bars',
    );
  });

  it('formats all types as "everything"', () => {
    expect(formatTypeChoices(ALL_TYPE_VALUES)).toBe('wants recommendations for everything');
  });

  it('falls back to raw value for unknown types', () => {
    expect(formatTypeChoices(['custom-thing'])).toBe('looking for custom-thing');
  });
});

// ---------------------------------------------------------------------------
// Combined Prompt Builder
// ---------------------------------------------------------------------------

describe('buildDiscoveryPrompt', () => {
  it('includes all three layers when provided', () => {
    const prompt = buildDiscoveryPrompt(
      'SALTY Morocco',
      'Morocco',
      'explore-same',
      'adventure-adrenaline',
      ['restaurants', 'outdoors'],
    );
    expect(prompt).toContain("TRAVELER'S STATED PREFERENCES:");
    expect(prompt).toContain('Location scope:');
    expect(prompt).toContain('Desired vibe:');
    expect(prompt).toContain('Looking for:');
    expect(prompt).toContain('SALTY Morocco');
  });

  it('omits location line when null', () => {
    const prompt = buildDiscoveryPrompt('SALTY Morocco', 'Morocco', null, 'chill-relax', ['beaches']);
    expect(prompt).not.toContain('Location scope:');
    expect(prompt).toContain('Desired vibe:');
  });

  it('omits vibe line when null', () => {
    const prompt = buildDiscoveryPrompt('SALTY Morocco', 'Morocco', 'explore-same', null, ['beaches']);
    expect(prompt).toContain('Location scope:');
    expect(prompt).not.toContain('Desired vibe:');
  });

  it('omits types line when null', () => {
    const prompt = buildDiscoveryPrompt('SALTY Morocco', 'Morocco', 'explore-same', 'chill-relax', null);
    expect(prompt).not.toContain('Looking for:');
  });

  it('omits types line when empty array', () => {
    const prompt = buildDiscoveryPrompt('SALTY Morocco', 'Morocco', 'explore-same', 'chill-relax', []);
    expect(prompt).not.toContain('Looking for:');
  });

  it('includes closing instruction', () => {
    const prompt = buildDiscoveryPrompt('SALTY Morocco', 'Morocco', 'explore-same', 'chill-relax', ['beaches']);
    expect(prompt).toContain('Lean into these preferences');
    expect(prompt).toContain('stated intent');
  });
});

// ---------------------------------------------------------------------------
// Option Label Lookup
// ---------------------------------------------------------------------------

describe('getOptionLabel', () => {
  it('returns destination-specific label for explore-same', () => {
    expect(getOptionLabel('location', 'explore-same', 'Morocco')).toBe('Explore more of Morocco');
  });

  it('returns generic label for explore-same without destination', () => {
    expect(getOptionLabel('location', 'explore-same')).toBe('Explore more of the area');
  });

  it('returns label for known vibe value', () => {
    expect(getOptionLabel('vibe', 'chill-relax')).toBe('Chill & relax');
  });

  it('returns label for known type value', () => {
    expect(getOptionLabel('types', 'restaurants')).toBe('Restaurants & Food');
  });

  it('returns raw value for unknown location value (custom text)', () => {
    expect(getOptionLabel('location', 'Marrakech and Fez')).toBe('Marrakech and Fez');
  });

  it('returns raw value for unknown vibe value', () => {
    expect(getOptionLabel('vibe', 'custom-vibe')).toBe('custom-vibe');
  });

  it('returns raw value for unknown type value', () => {
    expect(getOptionLabel('types', 'custom-type')).toBe('custom-type');
  });
});
