/**
 * Shared Trip Plans
 *
 * Storage strategy:
 * - When KV_REST_API_URL is set (Vercel production): uses Vercel KV (Redis)
 * - Otherwise: uses an in-memory Map (development)
 *
 * To enable Vercel KV:
 * 1. Connect a KV store in your Vercel dashboard
 * 2. The KV_REST_API_URL and KV_REST_API_TOKEN env vars are auto-injected
 */

export interface SharedPlanFriend {
  name: string;
  status: 'interested' | 'in' | 'maybe' | 'out';
  originCity?: string;
  joinedAt: string;
}

export interface SharedPlanActivity {
  name: string;
  category: string;
  description: string;
}

export interface SharedPlanCity {
  name: string;
  country: string;
  days: number;
  description?: string;
  activities: SharedPlanActivity[];
}

export interface SharedPlanItinerary {
  cities: SharedPlanCity[];
  totalDays: number;
  reasoning: string;
}

export interface SharedPlan {
  id: string;
  creatorName: string;
  retreatSlug: string;
  retreatName: string;
  retreatDates: string;
  originCity: string;
  flights: {
    id: string;
    airline: string;
    route: string;
    price: number;
    date: string;
  }[];
  friends: SharedPlanFriend[];
  message?: string;
  itinerary?: SharedPlanItinerary;
  createdAt: string;
  expiresAt: string;
  /** Optimistic concurrency version — incremented on each mutation */
  _version?: number;
}

// V2: Vision board based plan
export interface SharedPlanV2 {
  id: string;
  version: 2;
  creatorName: string;
  creatorEmail?: string;
  retreatSlug: string;
  retreatName: string;
  retreatDates: string;
  boardItems: SharedBoardItemData[];
  friends: SharedPlanFriend[];
  reactions: SharedReaction[];
  message?: string;
  createdAt: string;
  expiresAt: string;
  /** Board view mode creator was using — optional for backward compat */
  boardViewMode?: 'dream' | 'itinerary';
  /** City before/after retreat assignments — optional for backward compat */
  beforeAfterAssignment?: Record<string, 'before' | 'after'>;
  /** Board country ordering — optional for backward compat with existing plans */
  topLevelOrder?: ({ kind: 'country'; country: string } | { kind: 'retreat' })[];
  /** City ordering within each country — optional for backward compat */
  cityOrderByCountry?: Record<string, string[]>;
  /** Optimistic concurrency version — incremented on each mutation */
  _version?: number;
}

export interface SharedBoardItemData {
  id: string;
  type: string;
  cityName: string;
  country: string;
  name: string;
  description: string;
  activityCategory?: string;
  days?: number;
  priceRange?: string;
  imageUrl?: string | null;
}

export interface SharedReaction {
  friendName: string;
  itemId: string;
  reaction: 'love' | 'interested' | 'meh';
}

export type SharedPlanAny = SharedPlan | SharedPlanV2;

function isV2Plan(plan: SharedPlanAny): plan is SharedPlanV2 {
  return 'version' in plan && plan.version === 2;
}

const PLAN_TTL = 60 * 60 * 24 * 30; // 30 days in seconds
const KV_PREFIX = 'plan:';

function isKVEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Direct Vercel KV REST API calls (no SDK dependency required)
async function kvGet<T>(key: string): Promise<T | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.result) return null;
  return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
}

async function kvSet(key: string, value: unknown, ttl: number): Promise<void> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  await fetch(`${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, JSON.stringify(value), 'EX', ttl]),
  });
}

// In-memory store for development
const memoryStore = new Map<string, SharedPlanAny>();

export function generatePlanId(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function getPlan(id: string): Promise<SharedPlanAny | null> {
  if (isKVEnabled()) {
    try {
      return await kvGet<SharedPlanAny>(`${KV_PREFIX}${id}`);
    } catch (error) {
      console.error('[KV] getPlan error:', error);
      return null;
    }
  }
  return memoryStore.get(id) || null;
}

export async function savePlan(plan: SharedPlanAny): Promise<void> {
  if (isKVEnabled()) {
    try {
      await kvSet(`${KV_PREFIX}${plan.id}`, plan, PLAN_TTL);
      return;
    } catch (error) {
      console.error('[KV] savePlan error:', error);
    }
  }
  memoryStore.set(plan.id, plan);
}

const MAX_MUTATION_RETRIES = 3;

/**
 * Optimistic concurrency wrapper for plan mutations.
 * Reads the plan, applies the mutator, increments the version, saves,
 * then verifies the saved version matches. Retries on version conflict.
 */
async function mutatePlan<T>(
  planId: string,
  mutator: (plan: SharedPlanAny) => T
): Promise<{ plan: SharedPlanAny; result: T } | null> {
  for (let attempt = 0; attempt < MAX_MUTATION_RETRIES; attempt++) {
    const plan = await getPlan(planId);
    if (!plan) return null;

    const expectedVersion = plan._version ?? 0;
    const result = mutator(plan);
    plan._version = expectedVersion + 1;

    await savePlan(plan);

    // Verify our write stuck (detects concurrent overwrites)
    const verify = await getPlan(planId);
    if (verify && (verify._version ?? 0) === expectedVersion + 1) {
      return { plan, result };
    }

    // Version mismatch — another write happened concurrently. Retry.
    if (attempt < MAX_MUTATION_RETRIES - 1) {
      // Small jitter to reduce contention on retry
      await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
    }
  }

  // Retries exhausted — fall back to last-write-wins
  console.warn(`[shared-plans] mutatePlan retries exhausted for plan ${planId} after ${MAX_MUTATION_RETRIES} attempts — falling back to last-write-wins`);
  const plan = await getPlan(planId);
  if (!plan) return null;
  const result = mutator(plan);
  plan._version = (plan._version ?? 0) + 1;
  await savePlan(plan);
  return { plan, result };
}

export async function addFriend(planId: string, friend: SharedPlanFriend): Promise<{ plan: SharedPlanAny | null; alreadyJoined: boolean }> {
  const result = await mutatePlan(planId, (plan) => {
    // Prevent duplicate joins by name (case-insensitive)
    const existing = plan.friends.find(
      (f) => f.name.toLowerCase() === friend.name.toLowerCase()
    );
    if (existing) return { alreadyJoined: true };

    plan.friends.push(friend);
    return { alreadyJoined: false };
  });

  if (!result) return { plan: null, alreadyJoined: false };
  return { plan: result.plan, alreadyJoined: result.result.alreadyJoined };
}

export async function updateFriendStatus(
  planId: string,
  friendName: string,
  status: SharedPlanFriend['status']
): Promise<SharedPlanAny | null> {
  const result = await mutatePlan(planId, (plan) => {
    // Case-insensitive match to handle name variations
    const friend = plan.friends.find(
      (f) => f.name.toLowerCase() === friendName.toLowerCase()
    );
    if (friend) {
      friend.status = status;
    }
  });

  return result?.plan ?? null;
}

export async function addReaction(
  planId: string,
  friendName: string,
  itemId: string,
  reaction: 'love' | 'interested' | 'meh'
): Promise<SharedPlanV2 | null> {
  const result = await mutatePlan(planId, (plan) => {
    if (!isV2Plan(plan)) return;

    // Remove existing reaction from this friend on this item
    plan.reactions = plan.reactions.filter(
      (r) => !(r.friendName.toLowerCase() === friendName.toLowerCase() && r.itemId === itemId)
    );

    plan.reactions.push({ friendName, itemId, reaction });
  });

  if (!result) return null;
  return isV2Plan(result.plan) ? result.plan : null;
}
