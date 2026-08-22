import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers/auth';

test.describe('Product & Marketing Experience Separation (Sprint P-011)', () => {
  test('public landing page renders B2B positioning and assessment CTA', async ({ page }) => {
    // 1. Visit root landing page (unauthenticated)
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Hero Header
    await expect(page.locator('h1', { hasText: 'Operational Intelligence for Hotel Engineering' })).toBeVisible({ timeout: 10000 });

    // 3. Verify Assessment Button & Modal
    const assessmentBtn = page.locator('button', { hasText: 'Request an Operational Assessment' }).first();
    await expect(assessmentBtn).toBeVisible();
    await assessmentBtn.click();

    // 4. Verify Modal Appears
    await expect(page.locator('text=Request Operational Assessment')).toBeVisible({ timeout: 5000 });

    // 5. Verify Navigation to Login
    const signInBtn = page.locator('a', { hasText: 'Sign In to Platform' }).first();
    await signInBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*login/, { timeout: 7000 });
  });
});
