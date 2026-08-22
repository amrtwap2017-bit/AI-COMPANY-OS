import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers/auth';

test.describe('Dedicated Marketing Website & Brand Experience (Sprint N-013)', () => {
  test('public solutions page renders value pillars for engineering and owners', async ({ page }) => {
    await page.goto(`${BASE_URL}/solutions`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1', { hasText: 'Purpose-Built Solutions for Hospitality Operations' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=For Directors of Engineering')).toBeVisible();
  });

  test('public how it works page renders closed-loop architecture steps', async ({ page }) => {
    await page.goto(`${BASE_URL}/how-it-works`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1', { hasText: 'The Closed-Loop Operational Intelligence Architecture' })).toBeVisible({ timeout: 10000 });
  });

  test('public case studies page renders Red Sea Grand Resort metrics', async ({ page }) => {
    await page.goto(`${BASE_URL}/case-studies`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1', { hasText: 'Proven Commercial Case Studies' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Red Sea Grand Resort & Spa')).toBeVisible();
    await expect(page.locator('text=Prevented Emergency Spend')).toBeVisible();
  });
});
