import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Customer Onboarding & Provisioning Wizard (Sprint N-010)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('onboarding wizard multi-step form renders and transitions', async ({ page }) => {
    // 1. Visit Onboarding Wizard
    await page.goto(`${BASE_URL}/administration/onboarding`);
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Header
    await expect(page.locator('h1', { hasText: 'Hospitality Organization Provisioning Wizard' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Self-Service Property Activation')).toBeVisible();

    // 3. Verify Step 1 Form Inputs
    await expect(page.locator('label', { hasText: 'Corporate Company / Holding Name' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Hotel / Property Name' })).toBeVisible();

    // 4. Fill Step 1 and continue
    await page.fill('input[id*="corporate-company"], input[id*="holding-name"], input[placeholder*="Red Sea"]', 'Red Sea Holding');
    await page.fill('input[placeholder*="Sharm Grand"]', 'Sinai Bay Resort');
    await page.click('button:has-text("Continue to Site Setup")');

    // 5. Verify Step 2 Appears
    await expect(page.locator('h2', { hasText: 'Primary Site & Compound Setup' })).toBeVisible({ timeout: 5000 });
  });
});
