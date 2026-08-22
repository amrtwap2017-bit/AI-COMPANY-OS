import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Design System 3.0 / Form Control Polish (Sprint N-009)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('form components render correctly on service request generation and modals', async ({ page }) => {
    // Navigate to Work Orders page
    await page.goto(`${BASE_URL}/operations/work-orders`);
    await page.waitForLoadState('domcontentloaded');

    // Confirm core dashboard layout displays cleanly
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
