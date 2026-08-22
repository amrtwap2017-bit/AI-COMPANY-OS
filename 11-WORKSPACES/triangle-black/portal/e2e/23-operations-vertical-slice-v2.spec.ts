import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Operations Vertical Slice 2.0 (Sprint P-003)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('complete operations loop: navigate work orders, assets and executive dashboard', async ({ page }) => {
    // 1. Visit Work Orders List
    await page.goto(`${BASE_URL}/operations/work-orders`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // 2. Visit Maintenance Assets
    await page.goto(`${BASE_URL}/maintenance/assets`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // 3. Visit Executive Dashboard
    await page.goto(`${BASE_URL}/executive/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Executive Intelligence Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Platform Operations Health')).toBeVisible();

    // 4. Visit Digital Twin
    await page.goto(`${BASE_URL}/graph`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=System Health Index')).toBeVisible({ timeout: 10000 });
  });
});
