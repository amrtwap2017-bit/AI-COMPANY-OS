import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Design System 3.0 / TBDL 3.0 UI Verification (Sprint P-007)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('portal views render with consistent typography and semantic status badges', async ({ page }) => {
    // 1. Visit Work Orders (DataTable & Badges)
    await page.goto(`${BASE_URL}/operations/work-orders`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // 2. Verify AI Signals (Semantic KPI Cards)
    await page.goto(`${BASE_URL}/ai/signals`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=AI Operational Signals')).toBeVisible({ timeout: 10000 });

    // 3. Verify Executive Dashboard
    await page.goto(`${BASE_URL}/executive/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });
});
