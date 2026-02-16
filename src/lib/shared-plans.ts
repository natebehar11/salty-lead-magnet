/**
 * Shared Trip Plans
 *
 * Storage strategy:
 * - When KV_REST_API_URL is set (Vercel production): uses Vercel KV (Redis)
 * - Otherwise: uses an in-memory Map (development)
 *
 * To enable Vercel KV:
 * 1. `npm install @vercel/kv`
 * 2. Connect a KV store in your Vercel dashboard
 * 3. The KV_REST_API_URL and KV_REST_API_TOKEN env vars are auto-injected
 */

export interface SharedPlanFriend {
  name: string;
  status: 'interested' | 'in' | 'maybe' | 'out';
  originCity?: string;
  joinedAt: string;
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
  createdAt: string;
  expiresAt: string;
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
const memoryStore = new Map<string, SharedPlan>();

export function generatePlanId(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function getPlan(id: string): Promise<SharedPlan | null> {
  if (isKVEnabled()) {
    try {
      return await kvGet<SharedPlan>(`${KV_PREFIX}${id}`);
    } catch (error) {
      console.error('[KV] getPlan error:', error);
      return null;
    }
  }
  return memoryStore.get(id) || null;
}

export async function savePlan(plan: SharedPlan): Promise<void> {
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

export async function addFriend(planId: string, friend: SharedPlanFriend): Promise<SharedPlan | null> {
  const plan = await getPlan(planId);
  if (!plan) return null;

  plan.friends.push(friend);
  await savePlan(plan);
  return plan;
}

export async function updateFriendStatus(
  planId: string,
  friendName: string,
  status: SharedPlanFriend['status']
): Promise<SharedPlan | null> {
  const plan = await getPlan(planId);
  if (!plan) return null;

  const friend = plan.friends.find((f) => f.name === friendName);
  if (friend) {
    friend.status = status;
    await savePlan(plan);
  }
  return plan;
}
