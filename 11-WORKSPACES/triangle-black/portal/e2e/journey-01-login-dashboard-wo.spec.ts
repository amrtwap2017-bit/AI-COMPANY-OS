/**
 * Journey 1: Login → Dashboard → Work Orders
 * REAL BROWSER TEST — chromium launches and navigates
 * Updated with correct selectors from actual login page inspection
 */
import { test, expect, Page } from '@playwright/test';

const EMAIL = 'amr@triangleblack.com';
const PASSWORD = 'admin123';

// Robust login helper — tries multiple selector strategies
async function doLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for any input to appear
  await page.waitForSelector('input', { timeout: 20000 });
  
  // Try multiple email selectors
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[name="username"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email" i]',
    'input:nth-of-type(1)',
  ];
  
  let emailFilled = false;
  for (const sel of emailSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.fill(EMAIL);
        emailFilled = true;
        console.log(`Email filled with selector: ${sel}`);
        break;
      }
    } catch {}
  }
  
  if (!emailFilled) {
    // Last resort: fill first visible input
    const inputs = await page.$$('input:visible');
    if (inputs.length > 0) {
      await inputs[0].fill(EMAIL);
    }
  }
  
  // Password
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input:nth-of-type(2)',
  ];
  
  for (const sel of passwordSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.fill(PASSWORD);
        console.log(`Password filled with selector: ${sel}`);
        break;
      }
    } catch {}
  }
  
  // Submit
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'button:has-text("Log in")',
    'button:has-text("Submit")',
    'form button',
  ];
  
  for (const sel of submitSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.click();
        console.log(`Clicked submit: ${sel}`);
        break;
      }
    } catch {}
  }
  
  // Wait for redirect
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 25000 });
}

test.describe('Journey 1: Customer Login → Dashboard → Work Orders', () => {
  test('Customer can login successfully', async ({ page }) => {
    await doLogin(page);
    expect(page.url()).not.toContain('/login');
    console.log('✅ Login successful:', page.url());
  });

  test('Dashboard loads with content after login', async ({ page }) => {
    await doLogin(page);
    
    await page.goto('/executive/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    // No fatal error
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Has some content
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(20);
    console.log('✅ Dashboard loaded');
  });

  test('Work orders page loads without error', async ({ page }) => {
    await doLogin(page);
    
    await page.goto('/operations/work-orders');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    // No fatal error
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Has content
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(20);
    console.log('✅ Work orders page loaded');
  });
});
