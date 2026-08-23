import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('SRE Pilot Control Room UI Verification (Sprint C-008)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('control room dashboard loads and displays all 3 active pilot cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/administration/pilot-control`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'SRE Pilot Control Room' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Super-Admin Session')).toBeVisible();

    // 2. Verify Pilot Property Cards
    await expect(page.locator('text=Red Sea Grand Resort')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Sinai Pearl Hotel')).toBeVisible();
    await expect(page.locator('text=Gulf View Suites')).toBeVisible();
  });
});
