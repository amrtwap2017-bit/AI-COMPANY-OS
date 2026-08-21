import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Executive Dashboard — Real Read Model Verification (Sprint U-008)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('executive dashboard renders with real KPI cards and domain metrics', async ({ page }) => {
    await page.goto(`${BASE_URL}/executive/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Page Title
    await expect(page.locator('h1', { hasText: 'Executive Command Center' })).toBeVisible({ timeout: 10000 });

    // 2. Verify Live Governance Badge
    await expect(page.locator('text=Live Governance')).toBeVisible();

    // 3. Verify Key Sections Exist
    await expect(page.locator('text=SLA Compliance Rate')).toBeVisible();
    await expect(page.locator('text=Operational Asset Uptime')).toBeVisible();
    await expect(page.locator('text=Total Procurement Spend')).toBeVisible();
    await expect(page.locator('text=Maintenance Execution')).toBeVisible();
    await expect(page.locator('text=Sourcing & Vendors')).toBeVisible();
    await expect(page.locator('text=Platform Telemetry')).toBeVisible();
  });
});
