import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('AI Operational Intelligence & Governed Reasoning (Sprint P-010)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('ai gateway and operational signals render governed intelligence telemetry', async ({ page }) => {
    // 1. Visit AI Signals View
    await page.goto(`${BASE_URL}/ai/signals`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1', { hasText: 'AI Operational Signals' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Continuous Intelligence')).toBeVisible();

    // 2. Visit Governed AI Gateway
    await page.goto(`${BASE_URL}/ai/gateway`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1', { hasText: 'Governed AI Gateway' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Enterprise Policy Active')).toBeVisible();
  });
});
