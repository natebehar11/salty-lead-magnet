/**
 * Go High Level (GHL) API Client
 *
 * Pipeline: SALTY Explorer
 * Stages: Quiz Lead → Exploring → High Intent → Booked
 *
 * When GHL_API_KEY is not set, all functions log to console and return
 * successfully — enabling development without a GHL account.
 *
 * To configure:
 * 1. Set GHL_API_KEY in .env.local
 * 2. Set GHL_LOCATION_ID to your GHL location
 * 3. Set GHL_PIPELINE_ID to the SALTY Explorer pipeline
 * 4. Set GHL_STAGE_* IDs for each pipeline stage
 */

const GHL_API_BASE = process.env.GHL_API_BASE || 'https://rest.gohighlevel.com/v1';
const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '';
const GHL_PIPELINE_ID = process.env.GHL_PIPELINE_ID || '';

// Pipeline stage IDs — set these in .env.local after creating the pipeline in GHL
const GHL_STAGES = {
  quizLead: process.env.GHL_STAGE_QUIZ_LEAD || '',
  exploring: process.env.GHL_STAGE_EXPLORING || '',
  highIntent: process.env.GHL_STAGE_HIGH_INTENT || '',
  booked: process.env.GHL_STAGE_BOOKED || '',
};

function isConfigured(): boolean {
  return Boolean(GHL_API_KEY && GHL_LOCATION_ID);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ghlRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  if (!isConfigured()) {
    console.log(`[GHL Mock] ${method} ${endpoint}`, body || '');
    return null;
  }

  const res = await fetch(`${GHL_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    console.error(`[GHL Error] ${method} ${endpoint}: ${res.status} ${res.statusText}`);
    return null;
  }

  return res.json();
}

export interface GHLContactData {
  firstName: string;
  email: string;
  phone: string;
  tags: string[];
  source?: string;
  customFields?: Record<string, string>;
}

/**
 * Create or update a contact in GHL.
 * If GHL is not configured, logs the data and returns a mock contact ID.
 */
export async function createOrUpdateContact(data: GHLContactData): Promise<string> {
  if (!isConfigured()) {
    console.log('[GHL Mock] Create/Update Contact:', {
      ...data,
      locationId: GHL_LOCATION_ID,
    });
    return `mock-contact-${Date.now()}`;
  }

  // First, try to find existing contact by email
  const search = await ghlRequest(
    `/contacts/lookup?email=${encodeURIComponent(data.email)}&locationId=${GHL_LOCATION_ID}`
  );

  const existingId = search?.contacts?.[0]?.id;

  if (existingId) {
    // Update existing contact — merge tags
    await ghlRequest(`/contacts/${existingId}`, 'PUT', {
      firstName: data.firstName,
      phone: data.phone,
      tags: data.tags,
      source: data.source,
      customField: data.customFields,
    });
    return existingId as string;
  }

  // Create new contact
  const result = await ghlRequest('/contacts/', 'POST', {
    firstName: data.firstName,
    email: data.email,
    phone: data.phone,
    locationId: GHL_LOCATION_ID,
    tags: data.tags,
    source: data.source || 'salty-explorer',
    customField: data.customFields,
  });

  return result?.contact?.id as string || `mock-${Date.now()}`;
}

/**
 * Add tags to an existing contact.
 */
export async function addContactTags(contactId: string, tags: string[]): Promise<void> {
  if (!isConfigured()) {
    console.log(`[GHL Mock] Add tags to ${contactId}:`, tags);
    return;
  }

  await ghlRequest(`/contacts/${contactId}`, 'PUT', { tags });
}

/**
 * Move a contact to a pipeline stage.
 * Creates an opportunity if one doesn't exist.
 */
export async function moveToStage(
  contactId: string,
  stage: keyof typeof GHL_STAGES
): Promise<void> {
  const stageId = GHL_STAGES[stage];

  if (!isConfigured() || !GHL_PIPELINE_ID || !stageId) {
    console.log(`[GHL Mock] Move contact ${contactId} to stage: ${stage} (${stageId})`);
    return;
  }

  // Search for existing opportunity
  const opps = await ghlRequest(
    `/pipelines/${GHL_PIPELINE_ID}/opportunities?contact_id=${contactId}`
  );

  const existingOpp = opps?.opportunities?.[0];

  if (existingOpp) {
    // Move existing opportunity to new stage
    await ghlRequest(`/pipelines/${GHL_PIPELINE_ID}/opportunities/${existingOpp.id}`, 'PUT', {
      stageId,
    });
  } else {
    // Create new opportunity in pipeline
    await ghlRequest(`/pipelines/${GHL_PIPELINE_ID}/opportunities/`, 'POST', {
      contactId,
      stageId,
      title: `SALTY Explorer - ${contactId}`,
      status: 'open',
    });
  }
}

/**
 * Trigger a GHL automation/workflow for a contact.
 */
export async function triggerWorkflow(workflowId: string, contactId: string): Promise<void> {
  if (!isConfigured() || !workflowId) {
    console.log(`[GHL Mock] Trigger workflow ${workflowId} for contact ${contactId}`);
    return;
  }

  await ghlRequest(`/contacts/${contactId}/workflow/${workflowId}`, 'POST');
}

/**
 * Generate comprehensive tags from quiz answers for GHL segmentation.
 * Per handoff addendum: extensive tagging for segmentation & automation.
 */
export function generateQuizTags(
  answers: Record<string, unknown>,
  topMatchSlug?: string,
  matchScore?: number
): string[] {
  const prefix = process.env.GHL_QUIZ_TAG_PREFIX || 'quiz_';
  const tags: string[] = [`${prefix}completed`, 'source_salty_explorer'];

  // Vibe tags
  const vibes = answers.vibes as string[] | undefined;
  if (vibes) {
    vibes.forEach((v) => tags.push(`${prefix}vibe_${v}`));
  }

  // Group style
  if (answers.groupStyle) {
    tags.push(`${prefix}group_${answers.groupStyle}`);
  }

  // Room preference (replaces budget)
  if (answers.roomPreference) {
    tags.push(`${prefix}room_${answers.roomPreference}`);
  }

  // Region tags
  const regions = answers.regions as string[] | undefined;
  if (regions) {
    regions.forEach((r) => tags.push(`${prefix}region_${r}`));
  }

  // Availability tags
  const availability = answers.availability as string[] | undefined;
  if (availability) {
    if (availability.includes('flexible')) {
      tags.push(`${prefix}dates_flexible`);
    } else {
      availability.forEach((m) => tags.push(`${prefix}avail_${m}`));
    }
  }

  // Party vs rest preference
  const partyVsRest = answers.partyVsRest as number | undefined;
  if (partyVsRest !== undefined) {
    if (partyVsRest >= 7) tags.push(`${prefix}prefers_party`);
    else if (partyVsRest <= 3) tags.push(`${prefix}prefers_chill`);
    else tags.push(`${prefix}prefers_balanced`);
  }

  // Solo traveler
  if (answers.travelingSolo === true) {
    tags.push(`${prefix}solo`);
  } else if (answers.travelingSolo === false) {
    tags.push(`${prefix}with_others`);
  }

  // Experience level
  if (answers.experienceLevel) {
    tags.push(`${prefix}experience_${answers.experienceLevel}`);
  }

  // Must-haves
  const mustHaves = answers.mustHaves as string[] | undefined;
  if (mustHaves) {
    mustHaves.forEach((mh) => tags.push(`${prefix}musthave_${mh}`));
  }

  // Top match
  if (topMatchSlug) {
    tags.push(`${prefix}match_${topMatchSlug}`);
  }

  // Match quality tier
  if (matchScore !== undefined) {
    if (matchScore >= 80) tags.push(`${prefix}match_quality_high`);
    else if (matchScore >= 60) tags.push(`${prefix}match_quality_medium`);
    else tags.push(`${prefix}match_quality_low`);
  }

  return tags;
}

/**
 * Generate custom field values for GHL contact from quiz data.
 */
export function generateQuizCustomFields(
  answers: Record<string, unknown>,
  topMatchSlug?: string,
  matchScore?: number
): Record<string, string> {
  const fields: Record<string, string> = {};

  fields.quiz_completed_at = new Date().toISOString();
  fields.quiz_source = 'salty-explorer';

  if (topMatchSlug) {
    fields.quiz_top_match = topMatchSlug;
  }
  if (matchScore !== undefined) {
    fields.quiz_match_score = String(matchScore);
  }

  const vibes = answers.vibes as string[] | undefined;
  if (vibes) {
    fields.quiz_vibes = vibes.join(', ');
  }

  if (answers.roomPreference) {
    fields.quiz_room_preference = String(answers.roomPreference);
  }

  if (answers.groupStyle) {
    fields.quiz_group_style = String(answers.groupStyle);
  }

  if (answers.experienceLevel) {
    fields.quiz_experience = String(answers.experienceLevel);
  }

  const mustHaves = answers.mustHaves as string[] | undefined;
  if (mustHaves) {
    fields.quiz_must_haves = mustHaves.join(', ');
  }

  return fields;
}

/**
 * Generate tags from flight search for GHL segmentation.
 */
export function generateFlightTags(
  originCode: string,
  retreatSlug?: string
): string[] {
  const prefix = process.env.GHL_FLIGHT_TAG_PREFIX || 'flight_';
  const tags: string[] = [`${prefix}searched`];

  if (originCode) {
    tags.push(`${prefix}origin_${originCode}`);
  }

  if (retreatSlug) {
    tags.push(`${prefix}retreat_${retreatSlug}`);
  }

  return tags;
}

/**
 * Generate tags from high-intent actions (favourite flights, share, compare page visits).
 */
export function generateIntentTags(action: string, details?: Record<string, string>): string[] {
  const prefix = 'intent_';
  const tags: string[] = [`${prefix}${action}`];

  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      tags.push(`${prefix}${action}_${key}_${value}`);
    });
  }

  return tags;
}
