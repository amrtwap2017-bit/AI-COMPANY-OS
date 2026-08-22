import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Golden Vertical Slice 2.0 Showcase (Sprint N-006)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('golden showcase page renders complete 8-stage operational stepper', async ({ page }) => {
    // 1. Visit Showcase view
    await page.goto(`${BASE_URL}/operations/showcase`);
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Header
    await expect(page.locator('h1', { hasText: 'Golden Vertical Slice 2.0 Showcase' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=End-to-End Trace Engine')).toBeVisible();

    // 3. Verify Key Metric Cards
    await expect(page.locator('text=Lifecycle Status')).toBeVisible();
    await expect(page.locator('text=Total Resolution Time')).toBeVisible();
    await expect(page.locator('text=Financial Settlement')).toBeVisible();

    // 4. Verify Stepper Headings
    await expect(page.locator('h2', { hasText: 'The 8-Stage Traceable Operational Journey' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Problem Intake' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Financial Settlement' })).toBeVisible();
  });
});
