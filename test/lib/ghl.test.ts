import {
  generateQuizTags,
  generateFlightTags,
  generateIntentTags,
  generateQuizCustomFields,
} from '@/lib/ghl';

const defaultAnswers: Record<string, unknown> = {
  vibes: ['adventure'],
  groupStyle: 'friends',
  partyVsRest: 8,
  travelingSolo: true,
  experienceLevel: 'first-timer',
  roomPreference: 'private',
  regions: ['central-america'],
  availability: ['flexible'],
  mustHaves: ['surfing'],
};

describe('generateQuizTags', () => {
  it('always includes quiz_completed and source_salty_explorer', () => {
    const tags = generateQuizTags(defaultAnswers);
    expect(tags).toContain('quiz_completed');
    expect(tags).toContain('source_salty_explorer');
  });

  it('includes vibe tags for each vibe in answers', () => {
    const tags = generateQuizTags(defaultAnswers);
    expect(tags).toContain('quiz_vibe_adventure');
  });

  it('includes quiz_prefers_party when partyVsRest >= 7', () => {
    const tags = generateQuizTags({ ...defaultAnswers, partyVsRest: 8 });
    expect(tags).toContain('quiz_prefers_party');
  });

  it('includes quiz_prefers_chill when partyVsRest <= 3', () => {
    const tags = generateQuizTags({ ...defaultAnswers, partyVsRest: 2 });
    expect(tags).toContain('quiz_prefers_chill');
  });

  it('includes quiz_match_quality_high when matchScore >= 80', () => {
    const tags = generateQuizTags(defaultAnswers, 'costa-rica', 85);
    expect(tags).toContain('quiz_match_quality_high');
  });
});

describe('generateFlightTags', () => {
  it('includes flight_searched', () => {
    const tags = generateFlightTags('YYZ');
    expect(tags).toContain('flight_searched');
  });

  it('includes origin code tag', () => {
    const tags = generateFlightTags('YYZ');
    expect(tags).toContain('flight_origin_YYZ');
  });

  it('includes retreat tag when provided', () => {
    const tags = generateFlightTags('YYZ', 'costa-rica');
    expect(tags).toContain('flight_retreat_costa-rica');
  });
});

describe('generateIntentTags', () => {
  it('includes intent_{action} tag', () => {
    const tags = generateIntentTags('favourite_flight');
    expect(tags).toContain('intent_favourite_flight');
  });

  it('includes detail tags from provided details', () => {
    const tags = generateIntentTags('compare', { retreat: 'costa-rica' });
    expect(tags).toContain('intent_compare_retreat_costa-rica');
  });
});

describe('generateQuizCustomFields', () => {
  it('sets quiz_completed_at', () => {
    const fields = generateQuizCustomFields(defaultAnswers);
    expect(fields.quiz_completed_at).toBeDefined();
  });

  it('sets quiz_source to salty-explorer', () => {
    const fields = generateQuizCustomFields(defaultAnswers);
    expect(fields.quiz_source).toBe('salty-explorer');
  });

  it('maps answer values to custom fields', () => {
    const fields = generateQuizCustomFields(defaultAnswers, 'costa-rica', 85);
    expect(fields.quiz_top_match).toBe('costa-rica');
    expect(fields.quiz_match_score).toBe('85');
    expect(fields.quiz_vibes).toBe('adventure');
    expect(fields.quiz_room_preference).toBe('private');
    expect(fields.quiz_group_style).toBe('friends');
    expect(fields.quiz_experience).toBe('first-timer');
    expect(fields.quiz_must_haves).toBe('surfing');
  });
});
