import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Digital Twin Portal UI Verification (Sprint U-010)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('digital twin graph page renders with topology metrics and impact explorer', async ({ page }) => {
    await page.goto(`${BASE_URL}/graph`);
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Header
    await expect(page.locator('h1', { hasText: 'Digital Twin & Graph Impact Engine' })).toBeVisible({ timeout: 10000 });

    // 2. Verify Semantic Topology Badge
    await expect(page.locator('text=Live Semantic Topology')).toBeVisible();

    // 3. Verify Metric Cards
    await expect(page.locator('text=System Health Index')).toBeVisible();
    await expect(page.locator('text=Topology Graph Nodes')).toBeVisible();
    await expect(page.locator('text=Relationship Edges')).toBeVisible();

    // 4. Verify Explorer Panel
    await expect(page.locator('text=Select Entity for Impact Analysis')).toBeVisible();
  });
});
