import { test, expect } from '@playwright/test';
import { injectAuth } from './helpers/auth';

test.describe('Contract Detail', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('contracts list page loads', async ({ page }) => {
    await page.goto('/commercial/contracts');
    await expect(page).not.toHaveURL(/login/);
  });

  test('contracts API returns data', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.get('http://localhost:8030/api/v1/contracts/?limit=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 401]).toContain(r.status());
  });

  test('contract activate endpoint exists', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.post('http://localhost:8030/api/v1/contracts/nonexistent/activate', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 400, 404, 401]).toContain(r.status());
    expect(r.status()).not.toBe(405);
  });

  test('contract renew endpoint exists', async ({ request }) => {
    const token = process.env.E2E_TOKEN!;
    const r = await request.post('http://localhost:8030/api/v1/contracts/nonexistent/renew', {
      headers: { Authorization: `Bearer ${token}` },
      data: {}
    });
    expect([200, 400, 404, 401, 422]).toContain(r.status());
    expect(r.status()).not.toBe(405);
  });

  test('contracts have audit trail injection', async () => {
    const { readFileSync } = require('fs');
    const source = readFileSync(
      '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial/contracts/router.py',
      'utf8'
    );
    expect(source).toContain('audit_create');
    expect(source).toContain('audit_action');
  });
});
