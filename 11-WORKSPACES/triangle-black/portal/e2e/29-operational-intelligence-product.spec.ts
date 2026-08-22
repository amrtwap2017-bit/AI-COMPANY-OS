import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Operational Intelligence Commercial Product (Sprint N-005)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('operational intelligence center renders 5 pillars and executive action plan', async ({ page }) => {
    // 1. Visit Operational Intelligence view
    await page.goto(`${BASE_URL}/operations/intelligence`);
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Header
    await expect(page.locator('h1', { hasText: 'Operational Intelligence Center' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Commercial Package Active')).toBeVisible();

    // 3. Verify 4 Core Pillar KPI Cards
    await expect(page.locator('text=Asset Health Index')).toBeVisible();
    await expect(page.locator('text=PM Compliance')).toBeVisible();
    await expect(page.locator('text=30-Day Procurement Spend')).toBeVisible();
    await expect(page.locator('text=Preventable Cost Leakage')).toBeVisible();

    // 4. Verify Financial Leakage & Executive Action Plan Panels
    await expect(page.locator('text=Financial Leakage Identification')).toBeVisible();
    await expect(page.locator('text=Governed Executive Action Plan')).toBeVisible();
  });
});
