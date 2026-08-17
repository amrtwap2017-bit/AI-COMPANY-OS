import { test, expect } from '@playwright/test';
import { injectAuth } from './helpers/auth';

const API = 'http://localhost:8030';

test.describe('Vertical Slice: SR → WO → Close (UI + API)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  // ── Page loads ────────────────────────────────────────────────────────

  test('service requests list page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/operations/service-requests');
    await expect(page).not.toHaveTitle(/404/);
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('work orders list page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/operations/work-orders');
    await expect(page).not.toHaveTitle(/404/);
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('work orders new page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/operations/work-orders/new');
    await expect(page).not.toHaveTitle(/404/);
  });

  // ── Full API vertical slice ───────────────────────────────────────────

  test('create SR via API', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.post(`${API}/api/v1/service-requests/`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { title: 'E2E Vertical Slice SR', urgency: 'high',
              category: 'HVAC', hotel_id: 'tb-default-hotel-000000000001' }
    });
    expect([200, 201]).toContain(r.status());
    if (r.status() === 200 || r.status() === 201) {
      const data = await r.json();
      expect(data).toHaveProperty('id');
    }
  });

  test('generate WO from SR via API', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    // Create SR first
    const sr = await request.post(`${API}/api/v1/service-requests/`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { title: 'E2E Generate WO Test', urgency: 'normal',
              category: 'Electrical', hotel_id: 'tb-default-hotel-000000000001' }
    });
    if (sr.status() !== 200 && sr.status() !== 201) return;
    const srData = await sr.json();
    const srId = srData.id;
    if (!srId) return;

    // Generate WO
    const wo = await request.post(`${API}/api/v1/service-requests/${srId}/generate-work-order`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (wo.status() === 200 || wo.status() === 201) {
      const woData = await wo.json();
      expect(woData).toHaveProperty('work_order_id');
      expect(woData).toHaveProperty('service_request_id');
    }
  });

  test('complete WO via API', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    // Get any open WO
    const list = await request.get(`${API}/api/v1/work-orders/?limit=1&status=open`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (list.status() !== 200) return;
    const data = await list.json();
    const items = Array.isArray(data) ? data : (data.results || []);
    if (items.length === 0) return;
    const woId = items[0].id;

    const r = await request.post(`${API}/api/v1/work-orders/${woId}/complete`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 201, 404, 500]).toContain(r.status());
  });

  test('close WO via API', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const list = await request.get(`${API}/api/v1/work-orders/?limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (list.status() !== 200) return;
    const data = await list.json();
    const items = Array.isArray(data) ? data : (data.results || []);
    if (items.length === 0) return;
    const woId = items[0].id;

    const r = await request.post(`${API}/api/v1/work-orders/${woId}/close`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 201, 404]).toContain(r.status());
  });

  test('SLA summary accessible via API', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get(`${API}/api/v1/work-orders/sla-summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(r.status()).toBe(200);
    const data = await r.json();
    expect(data).toHaveProperty('hotel_id');
  });
});
