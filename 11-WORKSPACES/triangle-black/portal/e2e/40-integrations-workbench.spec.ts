import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Enterprise Integrations & Webhook Workbench (Sprint C-007)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('integrations workbench loads and renders webhook subscription panel', async ({ page }) => {
    await page.goto(`${BASE_URL}/administration/integrations`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'Enterprise Integrations & Webhook Workbench' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=HMAC-SHA256 Signed')).toBeVisible();

    // 2. Verify Panels
    await expect(page.locator('text=Register Webhook Endpoint')).toBeVisible();
    await expect(page.locator('text=Active Webhook Subscriptions')).toBeVisible();
    await expect(page.locator('button:has-text("Dispatch Test Ping")')).toBeVisible();
  });
});
