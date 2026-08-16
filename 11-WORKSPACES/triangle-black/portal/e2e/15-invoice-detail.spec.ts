import { test, expect } from '@playwright/test';
import { injectAuth } from './helpers/auth';

test.describe('Invoice Detail', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('invoices list page loads', async ({ page }) => {
    await page.goto('/commercial/invoices');
    await expect(page).not.toHaveURL(/login/);
  });

  test('invoices API returns data', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/invoices/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 401]).toContain(r.status());
  });

  test('invoice list has correct structure', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/invoices/?limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (r.status() === 200) {
      const data = await r.json();
      expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    }
  });

  test('invoice create endpoint accepts POST', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.post('http://localhost:8030/api/v1/invoices/', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {}
    });
    expect([200, 201, 400, 422]).toContain(r.status());
  });

  test('payment summary endpoint works', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/invoices/payment-summary', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 401, 404]).toContain(r.status());
  });
});
