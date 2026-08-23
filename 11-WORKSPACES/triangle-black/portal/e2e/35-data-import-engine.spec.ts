import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Data Import Engine (Sprint N-011)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('data import page renders CSV workbench', async ({ page }) => {
    await page.goto(`${BASE_URL}/administration/data-import`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1', { hasText: 'Data Import' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=CSV Data Workbench')).toBeVisible();
  });
});
