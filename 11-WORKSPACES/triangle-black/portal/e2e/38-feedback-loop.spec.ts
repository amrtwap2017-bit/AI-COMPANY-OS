import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Customer Feedback Loop & Triage Workbench (Sprint C-005)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('feedback workbench loads and renders P0-P4 triage queue', async ({ page }) => {
    await page.goto(`${BASE_URL}/administration/feedback`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'Customer Feedback & Pilot Triage Workbench' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=P0–P4 Classification Active')).toBeVisible();

    // 2. Verify KPI Cards
    await expect(page.locator('text=Critical Blockers (P0)')).toBeVisible();
    await expect(page.locator('text=Pending Triage')).toBeVisible();

    // 3. Verify Live Queue Container
    await expect(page.locator('h2', { hasText: 'Live Customer Feedback Queue' })).toBeVisible();
  });
});
