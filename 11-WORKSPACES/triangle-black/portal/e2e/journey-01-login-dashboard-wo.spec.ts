/**
 * Journey 1: Login → Dashboard → Work Orders
 * REAL BROWSER TEST — chromium launches and navigates
 * Fix: replaced networkidle (never fires with useQuery polling)
 *      with domcontentloaded + element presence check
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
  
  // Login redirects to /workspace per source code
  await page.waitForURL('**/workspace**', { timeout: 25000 });
  console.log('✅ Logged in, at:', page.url());
}

async function waitForPageContent(page: Page, label: string): Promise<void> {
  // Use domcontentloaded (not networkidle — breaks with useQuery polling)
  await page.waitForLoadState('domcontentloaded');
  // Give React time to render
  await page.waitForTimeout(2000);
  console.log(`✅ ${label} DOM loaded`);
}

test.describe('Journey 1: Customer Login → Dashboard → Work Orders', () => {
  test('Customer can login and is redirected to workspace', async ({ page }) => {
    await doLogin(page);
    expect(page.url()).toContain('/workspace');
  });

  test('Executive dashboard loads with content', async ({ page }) => {
    await doLogin(page);
    await page.goto('/executive/dashboard');
    await waitForPageContent(page, 'Dashboard');
    
    // Verify no error state
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Has meaningful content (not blank)
    const bodyText = await page.locator('body').innerText({ timeout: 5000 });
    expect(bodyText.trim().length).toBeGreaterThan(50);
    console.log('✅ Dashboard has content');
  });

  test('Work orders page loads without error', async ({ page }) => {
    await doLogin(page);
    await page.goto('/operations/work-orders');
    await waitForPageContent(page, 'Work Orders');
    
    // No fatal error
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Has content — either WO list or loading state (not blank page)
    const bodyText = await page.locator('body').innerText({ timeout: 5000 });
    expect(bodyText.trim().length).toBeGreaterThan(30);
    console.log('✅ Work orders page loaded without fatal error');
  });
});
