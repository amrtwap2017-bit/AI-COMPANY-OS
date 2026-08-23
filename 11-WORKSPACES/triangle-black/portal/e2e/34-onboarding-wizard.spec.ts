import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Customer Onboarding Wizard (Sprint N-010)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('onboarding wizard renders multi-step form', async ({ page }) => {
    await page.goto(`${BASE_URL}/administration/onboarding`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1', { hasText: 'Provisioning Wizard' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Self-Service Property Activation')).toBeVisible();
    await expect(page.locator('label', { hasText: 'Company' })).toBeVisible();
  });
});
