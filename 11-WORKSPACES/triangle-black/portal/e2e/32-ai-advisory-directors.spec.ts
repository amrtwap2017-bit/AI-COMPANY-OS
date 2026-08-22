import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('AI Advisory Directors Command Center (Sprint N-008)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('ai directors command center loads and renders governed evidence chains', async ({ page }) => {
    await page.goto(`${BASE_URL}/ai/directors`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'AI Advisory Directors Command Center' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Governed Operational Intelligence')).toBeVisible();

    // 2. Verify 4 Director Buttons
    await expect(page.locator('text=AI Maintenance Director')).toBeVisible();
    await expect(page.locator('text=AI Procurement Director')).toBeVisible();
    await expect(page.locator('text=AI Operations Director')).toBeVisible();
    await expect(page.locator('text=AI Executive Analyst')).toBeVisible();

    // 3. Verify Recommendation Panel
    await expect(page.locator('text=Root Cause Hypothesis')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Evidence Chain & Telemetry Signals')).toBeVisible();
  });
});
