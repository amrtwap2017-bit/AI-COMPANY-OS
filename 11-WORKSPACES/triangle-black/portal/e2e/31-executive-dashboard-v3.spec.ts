import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Executive Control Center v3 UI Verification (Sprint N-007)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('executive control dashboard loads with high-density KPIs and risk telemetry', async ({ page }) => {
    await page.goto(`${BASE_URL}/executive/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1', { hasText: 'Executive Intelligence Dashboard' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Enterprise Control Active')).toBeVisible();

    await expect(page.locator('text=Platform Operations Health')).toBeVisible();
    await expect(page.locator('text=Budget Variance')).toBeVisible();
    await expect(page.locator('text=Preventable Energy Loss')).toBeVisible();

    await expect(page.locator('h2', { hasText: 'Mechanical Risk Telemetry' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Supplier Performance Analysis' })).toBeVisible();
  });
});
