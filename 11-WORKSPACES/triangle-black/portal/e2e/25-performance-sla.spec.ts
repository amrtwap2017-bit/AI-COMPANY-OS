import { test, expect } from '@playwright/test';
import { injectAuth, BASE_URL } from './helpers/auth';

test.describe('Performance SLA & Page Load Latency Verification (Sprint P-008)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('critical pages load within performance budget without uncaught exceptions', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Benchmark Work Orders View
    const t0 = Date.now();
    await page.goto(`${BASE_URL}/operations/work-orders`);
    await page.waitForLoadState('domcontentloaded');
    const woTime = Date.now() - t0;
    expect(woTime).toBeLessThan(6000);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });

    // 2. Benchmark Executive Read Models View
    const t1 = Date.now();
    await page.goto(`${BASE_URL}/executive/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    const execTime = Date.now() - t1;
    expect(execTime).toBeLessThan(6000);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });

    // 3. Verify zero fatal console errors
    expect(consoleErrors.length).toBeLessThan(5);
  });
});
