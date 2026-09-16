/**
 * Journey 2: Intelligence Layer — Attention + Recommendations + Pilot
 * Fix: replaced networkidle with domcontentloaded + timeout
 */
import { test, expect, Page } from '@playwright/test';

const EMAIL = 'amr@triangleblack.com';
const PASSWORD = 'admin123';

async function doLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('input[type="email"]', { timeout: 20000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/workspace**', { timeout: 25000 });
}

async function waitForPage(page: Page, label: string): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // React render time
  console.log(`  ${label}: DOM ready`);
}

async function hasNoFatalError(page: Page): Promise<boolean> {
  const errorVisible = await page.locator('text=Error Loading Data').isVisible({ timeout: 2000 }).catch(() => false);
  return !errorVisible;
}

test.describe('Journey 2: Intelligence Layer', () => {
  test('Attention command center loads without fatal error', async ({ page }) => {
    await doLogin(page);
    await page.goto('/operations/command-center');
    await waitForPage(page, 'Attention');
    
    expect(await hasNoFatalError(page)).toBeTruthy();
    const body = await page.locator('body').innerText({ timeout: 5000 });
    expect(body.trim().length).toBeGreaterThan(20);
    console.log('✅ Attention command center loaded');
  });

  test('Recommendations page shows AI intelligence content', async ({ page }) => {
    await doLogin(page);
    await page.goto('/recommendations');
    await waitForPage(page, 'Recommendations');
    
    // No fatal error
    const hasError = await page.locator('text=Error Loading Recommendations').isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Has some content (page title, loading state, or recs)
    const body = await page.locator('body').innerText({ timeout: 5000 });
    expect(body.trim().length).toBeGreaterThan(20);
    
    // Verify key page element — the Intelligence heading we added
    const hasIntelligenceContent = await page.locator(
      'h1:has-text("AI Recommendations"), h1:has-text("Recommendations"), text=Intelligence'
    ).isVisible({ timeout: 8000 }).catch(() => false);
    expect(hasIntelligenceContent).toBeTruthy();
    console.log('✅ Recommendations page has AI content');
  });

  test('Pilot dashboard loads with pilot content', async ({ page }) => {
    await doLogin(page);
    await page.goto('/pilot-dashboard');
    await waitForPage(page, 'Pilot');
    
    expect(await hasNoFatalError(page)).toBeTruthy();
    const body = await page.locator('body').innerText({ timeout: 5000 });
    expect(body.trim().length).toBeGreaterThan(20);
    console.log('✅ Pilot dashboard loaded');
  });
});
