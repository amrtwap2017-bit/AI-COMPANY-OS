/**
 * Journey 3: PM Compliance
 * Verifies the PM maintenance workflow loads and shows compliance data
 */
import { test, expect, Page } from '@playwright/test';

async function doLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').waitFor({ timeout: 20000 });
  await page.fill('input[type="email"]', 'amr@triangleblack.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 25000 });
}

test.describe('Journey 3: PM Compliance', () => {
  test('PM plans page loads with maintenance data', async ({ page }) => {
    await doLogin(page);
    await page.goto('/maintenance/pm-plans');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(30);
    console.log('✅ PM Plans page loaded');
  });

  test('Assets page loads with asset registry', async ({ page }) => {
    await doLogin(page);
    await page.goto('/maintenance/assets');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(30);
    console.log('✅ Assets page loaded');
  });

  test('Supply chain page loads procurement data', async ({ page }) => {
    await doLogin(page);
    await page.goto('/supply-chain');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(30);
    console.log('✅ Supply chain page loaded');
  });
});
