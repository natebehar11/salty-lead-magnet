import { vi } from 'vitest';
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

    const { plan: updated, alreadyJoined } = await addFriend('add-friend-test', {
      name: 'Erin',
      status: 'interested',
      joinedAt: new Date().toISOString(),
    });

    expect(updated).not.toBeNull();
    expect(alreadyJoined).toBe(false);
    expect(updated!.friends).toHaveLength(1);
    expect(updated!.friends[0].name).toBe('Erin');
    expect(updated!.friends[0].status).toBe('interested');
  });

  it('returns null plan when adding to a nonexistent plan', async () => {
    const { plan, alreadyJoined } = await addFriend('does-not-exist', {
      name: 'Ghost',
      status: 'maybe',
      joinedAt: new Date().toISOString(),
    });
    expect(plan).toBeNull();
    expect(alreadyJoined).toBe(false);
  });

  it('prevents duplicate joins by name (case-insensitive)', async () => {
    const plan = { ...mockPlan, id: 'dup-join-test', friends: [] };
    await savePlan(plan);

    await addFriend('dup-join-test', {
      name: 'Erin',
      status: 'interested',
      joinedAt: new Date().toISOString(),
    });

    const { plan: updated, alreadyJoined } = await addFriend('dup-join-test', {
      name: 'erin',
      status: 'interested',
      joinedAt: new Date().toISOString(),
    });

    expect(alreadyJoined).toBe(true);
    expect(updated!.friends).toHaveLength(1);
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

describe('mutatePlan concurrent writes', () => {
  it('succeeds on first attempt when no conflicts', async () => {
    const plan: SharedPlan = {
      ...mockPlan,
      id: 'no-conflict-test',
      friends: [],
      _version: 0,
    };
    await savePlan(plan);

    const { plan: updated } = await addFriend('no-conflict-test', {
      name: 'Lisa',
      status: 'in',
      joinedAt: new Date().toISOString(),
    });

    expect(updated).not.toBeNull();
    expect(updated!.friends).toHaveLength(1);
    expect(updated!._version).toBe(1);
  });

  it('version increments correctly with successive mutations', async () => {
    const plan: SharedPlan = {
      ...mockPlan,
      id: 'version-inc-test',
      friends: [],
      _version: 0,
    };
    await savePlan(plan);

    await addFriend('version-inc-test', {
      name: 'Erin',
      status: 'interested',
      joinedAt: new Date().toISOString(),
    });

    const after1 = await getPlan('version-inc-test');
    expect(after1!._version).toBe(1);

    await addFriend('version-inc-test', {
      name: 'KP',
      status: 'maybe',
      joinedAt: new Date().toISOString(),
    });

    const after2 = await getPlan('version-inc-test');
    expect(after2!._version).toBe(2);
    expect(after2!.friends).toHaveLength(2);
  });

  it('handles concurrent addFriend calls without data loss', async () => {
    const plan: SharedPlan = {
      ...mockPlan,
      id: 'concurrent-add-test',
      friends: [],
      _version: 0,
    };
    await savePlan(plan);

    // Fire two addFriend calls concurrently
    const [result1, result2] = await Promise.all([
      addFriend('concurrent-add-test', {
        name: 'Erin',
        status: 'in',
        joinedAt: new Date().toISOString(),
      }),
      addFriend('concurrent-add-test', {
        name: 'KP',
        status: 'interested',
        joinedAt: new Date().toISOString(),
      }),
    ]);

    // Both should succeed
    expect(result1.plan).not.toBeNull();
    expect(result2.plan).not.toBeNull();

    // Final state should have both friends
    const final = await getPlan('concurrent-add-test');
    expect(final!.friends).toHaveLength(2);
    const names = final!.friends.map((f) => f.name).sort();
    expect(names).toEqual(['Erin', 'KP']);
  });
});
