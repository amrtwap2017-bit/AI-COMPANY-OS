import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers/auth';

test.describe('SaaS Pricing, Packaging & Tier Matrix (Sprint C-006)', () => {
  test('pricing page loads public matrix with 3 commercial tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'Predictable Operational Pricing' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Transparent SaaS Packaging')).toBeVisible();

    // 2. Verify 3 Tiers Rendered
    await expect(page.locator('h3', { hasText: 'Foundation Operations' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Operational Intelligence' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Enterprise Cluster' })).toBeVisible();
  });
});
