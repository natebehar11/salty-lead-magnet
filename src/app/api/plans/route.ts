import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generatePlanId,
  savePlan,
  getPlan,
  addFriend,
  updateFriendStatus,
  addReaction,
  SharedPlan,
  SharedPlanV2,
} from '@/lib/shared-plans';

// --- Zod schemas for request validation ---

const boardItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  cityName: z.string(),
  country: z.string(),
  name: z.string(),
  description: z.string(),
  activityCategory: z.string().optional(),
  days: z.number().optional(),
  priceRange: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
});

const topLevelOrderItemSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('country'), country: z.string() }),
  z.object({ kind: z.literal('retreat') }),
]);

const createPlanBaseSchema = z.object({
  creatorName: z.string().min(1),
  retreatSlug: z.string().min(1),
  retreatName: z.string().default(''),
  retreatDates: z.string().default(''),
  version: z.number().optional(),
});

const createPlanV2Schema = createPlanBaseSchema.extend({
  version: z.literal(2),
  creatorEmail: z.string().optional(),
  boardItems: z.array(boardItemSchema).default([]),
  message: z.string().optional(),
  boardViewMode: z.enum(['dream', 'itinerary']).optional(),
  beforeAfterAssignment: z.record(z.enum(['before', 'after'])).optional(),
  topLevelOrder: z.array(topLevelOrderItemSchema).optional(),
  cityOrderByCountry: z.record(z.array(z.string())).optional(),
});

const createPlanV1Schema = createPlanBaseSchema.extend({
  originCity: z.string().default(''),
  flights: z.array(z.object({
    id: z.string(),
    airline: z.string(),
    route: z.string(),
    price: z.number(),
    date: z.string(),
  })).default([]),
  message: z.string().optional(),
  itinerary: z.object({
    cities: z.array(z.object({
      name: z.string(),
      country: z.string(),
      days: z.number(),
      description: z.string().optional(),
      activities: z.array(z.object({
        name: z.string(),
        category: z.string(),
        description: z.string(),
      })),
    })),
    totalDays: z.number(),
    reasoning: z.string(),
  }).optional(),
});

const joinActionSchema = z.object({
  planId: z.string().min(1),
  action: z.literal('join'),
  friendName: z.string().min(1),
  originCity: z.string().optional(),
});

const updateStatusActionSchema = z.object({
  planId: z.string().min(1),
  action: z.literal('updateStatus'),
  friendName: z.string().min(1),
  status: z.enum(['interested', 'in', 'maybe', 'out']),
});

const reactActionSchema = z.object({
  planId: z.string().min(1),
  action: z.literal('react'),
  friendName: z.string().min(1),
  itemId: z.string().min(1),
  reaction: z.enum(['love', 'interested', 'meh']),
});

const patchSchema = z.discriminatedUnion('action', [
  joinActionSchema,
  updateStatusActionSchema,
  reactActionSchema,
]);

// POST: Create a new shared plan
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    const now = new Date();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // V2: Vision board based plan
    if (rawBody.version === 2) {
      const parsed = createPlanV2Schema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const { creatorName, creatorEmail, retreatSlug, retreatName, retreatDates, boardItems, message, boardViewMode, beforeAfterAssignment, topLevelOrder, cityOrderByCountry } = parsed.data;
      const plan: SharedPlanV2 = {
        id: generatePlanId(),
        version: 2,
        creatorName,
        creatorEmail: creatorEmail || undefined,
        retreatSlug,
        retreatName: retreatName || retreatSlug,
        retreatDates: retreatDates || '',
        boardItems,
        friends: [],
        reactions: [],
        message,
        createdAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        boardViewMode: boardViewMode || undefined,
        beforeAfterAssignment: beforeAfterAssignment || undefined,
        topLevelOrder: topLevelOrder || undefined,
        cityOrderByCountry: cityOrderByCountry || undefined,
        _version: 0,
      };
      await savePlan(plan);
      return NextResponse.json({ success: true, plan });
    }

    // V1: Legacy itinerary based plan
    const parsed = createPlanV1Schema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { creatorName, retreatSlug, retreatName, retreatDates, originCity, flights, message, itinerary } = parsed.data;
    const plan: SharedPlan = {
      id: generatePlanId(),
      creatorName,
      retreatSlug,
      retreatName: retreatName || retreatSlug,
      retreatDates: retreatDates || '',
      originCity: originCity || '',
      flights,
      friends: [],
      message,
      itinerary: itinerary || undefined,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      _version: 0,
    };

    await savePlan(plan);

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get a shared plan by ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
  }

  const plan = await getPlan(id);

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  return NextResponse.json({ plan });
}

// PATCH: Add a friend, update friend status, or add a reaction
export async function PATCH(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = patchSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.action === 'join') {
      const { plan, alreadyJoined } = await addFriend(data.planId, {
        name: data.friendName,
        status: 'interested',
        originCity: data.originCity,
        joinedAt: new Date().toISOString(),
      });
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      return NextResponse.json({ plan, alreadyJoined });
    }

    if (data.action === 'updateStatus') {
      const plan = await updateFriendStatus(data.planId, data.friendName, data.status);
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      return NextResponse.json({ plan });
    }

    if (data.action === 'react') {
      const plan = await addReaction(data.planId, data.friendName, data.itemId, data.reaction);
      if (!plan) return NextResponse.json({ error: 'Plan not found or not v2' }, { status: 404 });
      return NextResponse.json({ plan });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
