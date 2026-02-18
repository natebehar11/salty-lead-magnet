import {
  generatePlanId,
  savePlan,
  getPlan,
  addFriend,
  updateFriendStatus,
  SharedPlan,
} from '@/lib/shared-plans';

const mockPlan: SharedPlan = {
  id: 'testplan1',
  creatorName: 'Nate',
  retreatSlug: 'costa-rica-fitness-retreat',
  retreatName: 'Surf Sweat Flow v3',
  retreatDates: 'January 3-10, 2026',
  originCity: 'Toronto',
  flights: [
    {
      id: 'flight-1',
      airline: 'Air Canada',
      route: 'YYZ - SJO',
      price: 450,
      date: '2026-01-03',
    },
  ],
  friends: [],
  message: 'Who wants to come?',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('generatePlanId', () => {
  it('returns an 8-character string', () => {
    const id = generatePlanId();
    expect(id).toHaveLength(8);
  });

  it('produces different IDs on consecutive calls', () => {
    const id1 = generatePlanId();
    const id2 = generatePlanId();
    expect(id1).not.toBe(id2);
  });

  it('contains only allowed characters', () => {
    const allowed = 'abcdefghjkmnpqrstuvwxyz23456789';
    const id = generatePlanId();
    for (const char of id) {
      expect(allowed).toContain(char);
    }
  });
});

describe('savePlan + getPlan', () => {
  it('saves a plan and retrieves it by ID', async () => {
    await savePlan(mockPlan);
    const retrieved = await getPlan(mockPlan.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(mockPlan.id);
    expect(retrieved!.creatorName).toBe('Nate');
    expect(retrieved!.retreatSlug).toBe('costa-rica-fitness-retreat');
  });
});

describe('getPlan', () => {
  it('returns null for a nonexistent plan', async () => {
    const result = await getPlan('nonexistent-id');
    expect(result).toBeNull();
  });
});

describe('addFriend', () => {
  it('adds a friend to the plan friends array', async () => {
    const plan = { ...mockPlan, id: 'add-friend-test', friends: [] };
    await savePlan(plan);

    const updated = await addFriend('add-friend-test', {
      name: 'Erin',
      status: 'interested',
      joinedAt: new Date().toISOString(),
    });

    expect(updated).not.toBeNull();
    expect(updated!.friends).toHaveLength(1);
    expect(updated!.friends[0].name).toBe('Erin');
    expect(updated!.friends[0].status).toBe('interested');
  });

  it('returns null when adding to a nonexistent plan', async () => {
    const result = await addFriend('does-not-exist', {
      name: 'Ghost',
      status: 'maybe',
      joinedAt: new Date().toISOString(),
    });
    expect(result).toBeNull();
  });
});

describe('updateFriendStatus', () => {
  it('updates an existing friend status', async () => {
    const plan: SharedPlan = {
      ...mockPlan,
      id: 'update-status-test',
      friends: [
        { name: 'KP', status: 'interested', joinedAt: new Date().toISOString() },
      ],
    };
    await savePlan(plan);

    const updated = await updateFriendStatus('update-status-test', 'KP', 'in');
    expect(updated).not.toBeNull();
    expect(updated!.friends[0].status).toBe('in');
  });
});
