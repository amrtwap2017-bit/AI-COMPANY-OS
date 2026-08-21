import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('AI Gateway Portal UI Verification (Sprint U-009)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('ai gateway portal page renders with model registry and dispatch workspace', async ({ page }) => {
    await page.goto(`${BASE_URL}/ai/gateway`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'Governed AI Gateway' })).toBeVisible({ timeout: 10000 });

    // 2. Verify Policy Badge
    await expect(page.locator('text=Enterprise Policy Active')).toBeVisible();

    // 3. Verify Form Fields
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 4. Verify Telemetry Panel
    await expect(page.locator('text=Intelligence Telemetry & Output')).toBeVisible();
  });
});
