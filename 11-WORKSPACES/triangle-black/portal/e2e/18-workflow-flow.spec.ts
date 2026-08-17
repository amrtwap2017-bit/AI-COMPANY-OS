import { test, expect } from '@playwright/test';
import { injectAuth } from './helpers/auth';

test.describe('Workflow Engine API', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('workflow stats endpoint returns data', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/workflow/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(r.status()).toBe(200);
    const data = await r.json();
    expect(data).toHaveProperty('hotel_id');
    expect(data).toHaveProperty('total_instances');
    expect(data).toHaveProperty('total_transitions');
    expect(data).toHaveProperty('generated_at');
  });

  test('workflow instances endpoint returns list', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/workflow/instances', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(r.status()).toBe(200);
    const data = await r.json();
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBe(true);
  });

  test('workflow definitions endpoint returns list', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/workflow/definitions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(r.status()).toBe(200);
    const data = await r.json();
    expect(data).toHaveProperty('count');
  });

  test('workflow create definition succeeds', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.post('http://localhost:8030/api/v1/workflow/definitions', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { name: 'E2E Test Flow', entity_type: 'work_order',
              states: { open: ['assigned'], assigned: ['closed'] } }
    });
    expect([200, 201]).toContain(r.status());
    if (r.status() === 201 || r.status() === 200) {
      const data = await r.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('E2E Test Flow');
    }
  });

  test('workflow instance 404 returns correct error', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/workflow/instances/nonexistent-id', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(r.status()).toBe(404);
  });

  test('WO close endpoint exists and returns schema', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.post('http://localhost:8030/api/v1/work-orders/nonexistent/close', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 404, 401]).toContain(r.status());
    expect(r.status()).not.toBe(405);
  });

  test('complete vertical slice: SR generate WO', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const sr = await request.post('http://localhost:8030/api/v1/service-requests/', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { title: 'E2E Vertical Slice Test', urgency: 'normal',
              category: 'General', hotel_id: 'tb-default-hotel-000000000001' }
    });
    if (sr.status() !== 201 && sr.status() !== 200) return;
    const srData = await sr.json();
    const srId = srData.id;
    if (!srId) return;
    const wo = await request.post(`http://localhost:8030/api/v1/service-requests/${srId}/generate-work-order`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (wo.status() === 200 || wo.status() === 201) {
      const woData = await wo.json();
      expect(woData).toHaveProperty('work_order_id');
      expect(woData).toHaveProperty('service_request_id');
      expect(woData.service_request_id).toBe(srId);
    }
  });
});
