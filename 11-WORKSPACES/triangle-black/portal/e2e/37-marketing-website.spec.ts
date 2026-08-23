import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers/auth';

test.describe('Dedicated Marketing Website (Sprint N-013)', () => {
  test('solutions page renders value pillars', async ({ page }) => {
    await page.goto(`${BASE_URL}/solutions`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1', { hasText: 'Purpose-Built Solutions' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=For Directors of Engineering')).toBeVisible();
  });

  test('how it works page renders architecture steps', async ({ page }) => {
    await page.goto(`${BASE_URL}/how-it-works`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1', { hasText: 'Closed-Loop' })).toBeVisible({ timeout: 15000 });
  });

  test('case studies page renders Red Sea metrics', async ({ page }) => {
    await page.goto(`${BASE_URL}/case-studies`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1', { hasText: 'Case Studies' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Red Sea Grand Resort')).toBeVisible();
  });
});
