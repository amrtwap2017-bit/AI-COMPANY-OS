import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Commercial Demo Scenarios Sandbox (Sprint N-012)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('demo sandbox page renders 5 live commercial scenario cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/administration/demo`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'Commercial Demonstration Sandbox' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Red Sea Grand Resort Cluster')).toBeVisible();

    // 2. Verify Scenarios
    await expect(page.locator('h3', { hasText: 'Critical Chiller Breakdown' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Supplier Delay & Re-routing' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Emergency Procurement Leakage' })).toBeVisible();
  });
});
