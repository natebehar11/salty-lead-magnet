import { NextRequest, NextResponse } from 'next/server';
import {
  generatePlanId,
  savePlan,
  getPlan,
  addFriend,
  updateFriendStatus,
  SharedPlan,
} from '@/lib/shared-plans';

// POST: Create a new shared plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorName, retreatSlug, retreatName, retreatDates, originCity, flights, message } = body;

    if (!creatorName || !retreatSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const plan: SharedPlan = {
      id: generatePlanId(),
      creatorName,
      retreatSlug,
      retreatName: retreatName || retreatSlug,
      retreatDates: retreatDates || '',
      originCity: originCity || '',
      flights: flights || [],
      friends: [],
      message,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
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

// PATCH: Add a friend or update friend status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, action, friendName, status, originCity } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    if (action === 'join') {
      if (!friendName) {
        return NextResponse.json({ error: 'Missing friendName' }, { status: 400 });
      }
      const plan = await addFriend(planId, {
        name: friendName,
        status: 'interested',
        originCity,
        joinedAt: new Date().toISOString(),
      });
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      return NextResponse.json({ plan });
    }

    if (action === 'updateStatus') {
      if (!friendName || !status) {
        return NextResponse.json({ error: 'Missing friendName or status' }, { status: 400 });
      }
      const plan = await updateFriendStatus(planId, friendName, status);
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      return NextResponse.json({ plan });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
