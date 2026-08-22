import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers/auth';

test.describe('Executive Control Center v3 UI Verification (Sprint N-007)', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"]', 'amr@triangleblack.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*workspace/);
  });

  test('executive control dashboard loads with high-density KPIs and risk telemetry', async ({ page }) => {
    // 1. Visit Dashboard
    await page.goto(`${BASE_URL}/executive/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Header & Badge
    await expect(page.locator('h1', { hasText: 'Executive Intelligence Dashboard' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Enterprise Control Active')).toBeVisible();

    // 3. Verify KPI Cards
    await expect(page.locator('text=Platform Operations Health')).toBeVisible();
    await expect(page.locator('text=Budget Variance')).toBeVisible();
    await expect(page.locator('text=Preventable Energy Loss')).toBeVisible();

    // 4. Verify Telemetry Subsections
    await expect(page.locator('h2', { hasText: 'Mechanical Risk Telemetry' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Supplier Performance Analysis' })).toBeVisible();
  });
});
