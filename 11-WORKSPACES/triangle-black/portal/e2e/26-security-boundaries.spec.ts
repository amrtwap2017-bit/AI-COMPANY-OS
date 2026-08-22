import { test, expect } from '@playwright/test';
import { BASE_URL } from './helpers/auth';

test.describe('Security Boundaries & Unauthenticated Route Protection (Sprint P-009)', () => {
  test('unauthenticated visits to protected enterprise pages redirect to login', async ({ page }) => {
    const protectedPages = [
      '/operations/work-orders',
      '/maintenance/assets',
      '/financial/gl',
      '/executive/dashboard',
      '/ai/gateway'
    ];

    for (const path of protectedPages) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded');

      // Verify browser redirects to /login or shows login form
      await expect(page).toHaveURL(/.*login/, { timeout: 7000 });
      await expect(page.locator('input[type="password"], button[type="submit"]').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
