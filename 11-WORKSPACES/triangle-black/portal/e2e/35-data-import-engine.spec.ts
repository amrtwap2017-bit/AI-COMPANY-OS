import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Data Import Engine & Workbook Mapping (Sprint N-011)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('data import portfolio page loads and shows csv workbench', async ({ page }) => {
    await page.goto(`${BASE_URL}/administration/data-import`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'SaaS Data Import Engine' })).toBeVisible({ timeout: 10000 });

    // 2. Verify Workbook Container Panels
    await expect(page.locator('text=CSV Data Workbench')).toBeVisible();
    await expect(page.locator('text=Migration Validation Status')).toBeVisible();
  });
});
