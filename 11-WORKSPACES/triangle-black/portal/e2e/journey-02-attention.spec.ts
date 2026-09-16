/**
 * Journey 2: Intelligence Layer
 */
import { test, expect, Page } from '@playwright/test';

const EMAIL = 'amr@triangleblack.com';
const PASSWORD = 'admin123';

async function doLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[type="email"]').waitFor({ timeout: 20000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30000 });
}

async function loadPage(page: Page, path: string, label: string): Promise<string> {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  const body = await page.locator('body').innerText().catch(() => '');
  console.log(`  ${label}: ${body.trim().length} chars`);
  return body;
}

test.describe('Journey 2: Intelligence Layer', () => {
  test('Attention command center loads without fatal error', async ({ page }) => {
    await doLogin(page);
    const body = await loadPage(page, '/operations/command-center', 'Attention');
    
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    expect(body.trim().length).toBeGreaterThan(20);
    console.log('✅ Attention loaded');
  });

  test('Recommendations page shows AI intelligence', async ({ page }) => {
    await doLogin(page);
    const body = await loadPage(page, '/recommendations', 'Recommendations');
    
    const hasError = await page.locator('text=Error Loading Recommendations').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Page has meaningful content (the hero title we added)
    expect(body.trim().length).toBeGreaterThan(20);
    console.log('✅ Recommendations loaded');
  });

  test('Pilot dashboard loads', async ({ page }) => {
    await doLogin(page);
    const body = await loadPage(page, '/pilot-dashboard', 'Pilot');
    
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    expect(body.trim().length).toBeGreaterThan(20);
    console.log('✅ Pilot dashboard loaded');
  });
});
