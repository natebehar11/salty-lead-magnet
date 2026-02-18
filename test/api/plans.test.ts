import { POST, GET, PATCH } from '@/app/api/plans/route';
import { createMockRequest } from '@test/helpers/api-helpers';

describe('POST /api/plans', () => {
  it('returns 400 when creatorName is missing', async () => {
    const req = createMockRequest('/api/plans', {
      method: 'POST',
      body: { retreatSlug: 'costa-rica-fitness-retreat-v4' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when retreatSlug is missing', async () => {
    const req = createMockRequest('/api/plans', {
      method: 'POST',
      body: { creatorName: 'Nate' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 200 with a plan containing an id for a valid request', async () => {
    const req = createMockRequest('/api/plans', {
      method: 'POST',
      body: {
        creatorName: 'Nate',
        retreatSlug: 'costa-rica-fitness-retreat-v4',
        retreatName: 'SALTY v4',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.plan).toBeDefined();
    expect(data.plan.id).toBeDefined();
  });
});

describe('GET /api/plans', () => {
  it('returns 400 when id is missing', async () => {
    const req = createMockRequest('/api/plans', { method: 'GET' });

    const res = await GET(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 404 for a nonexistent plan id', async () => {
    const req = createMockRequest('/api/plans?id=nonexistent', { method: 'GET' });

    const res = await GET(req);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('retrieves a plan that was previously created', async () => {
    // First, create the plan
    const createReq = createMockRequest('/api/plans', {
      method: 'POST',
      body: {
        creatorName: 'Nate',
        retreatSlug: 'costa-rica-fitness-retreat-v4',
        retreatName: 'SALTY v4',
      },
    });
    const createRes = await POST(createReq);
    const createData = await createRes.json();
    const planId = createData.plan.id;

    // Then, retrieve it by id
    const getReq = createMockRequest(`/api/plans?id=${planId}`, { method: 'GET' });
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);

    const getData = await getRes.json();
    expect(getData.plan).toBeDefined();
    expect(getData.plan.id).toBe(planId);
    expect(getData.plan.creatorName).toBe('Nate');
  });
});

describe('PATCH /api/plans', () => {
  it('returns 200 when joining a plan', async () => {
    // Create a plan first
    const createReq = createMockRequest('/api/plans', {
      method: 'POST',
      body: {
        creatorName: 'Nate',
        retreatSlug: 'costa-rica-fitness-retreat-v4',
        retreatName: 'SALTY v4',
      },
    });
    const createRes = await POST(createReq);
    const createData = await createRes.json();
    const planId = createData.plan.id;

    // Join the plan
    const patchReq = createMockRequest('/api/plans', {
      method: 'PATCH',
      body: { planId, action: 'join', friendName: 'Lisa' },
    });
    const patchRes = await PATCH(patchReq);
    expect(patchRes.status).toBe(200);

    const patchData = await patchRes.json();
    expect(patchData.plan).toBeDefined();
  });

  it('returns 400 for an unknown action', async () => {
    const req = createMockRequest('/api/plans', {
      method: 'PATCH',
      body: { planId: 'x', action: 'unknown' },
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
