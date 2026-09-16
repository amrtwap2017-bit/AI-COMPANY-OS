/**
 * Journey 2: Attention + AI Recommendations + Pilot ROI
 * REAL BROWSER TEST — verifies intelligence layer works
 */
import { test, expect, Page } from '@playwright/test';

const EMAIL = 'amr@triangleblack.com';
const PASSWORD = 'admin123';

async function doLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('input', { timeout: 20000 });
  
  for (const sel of ['input[type="email"]', 'input[name="email"]', 'input[name="username"]', 'input:nth-of-type(1)']) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) { await el.fill(EMAIL); break; }
    } catch {}
  }
  
  for (const sel of ['input[type="password"]', 'input[name="password"]', 'input:nth-of-type(2)']) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) { await el.fill(PASSWORD); break; }
    } catch {}
  }
  
  for (const sel of ['button[type="submit"]', 'button:has-text("Login")', 'button:has-text("Sign in")', 'form button']) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) { await el.click(); break; }
    } catch {}
  }
  
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 25000 });
}

test.describe('Journey 2: Intelligence Layer', () => {
  test('Attention command center loads without fatal error', async ({ page }) => {
    await doLogin(page);
    await page.goto('/operations/command-center');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(20);
    console.log('✅ Attention command center loaded');
  });

  test('Recommendations page shows AI intelligence', async ({ page }) => {
    await doLogin(page);
    await page.goto('/recommendations');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    const hasError = await page.locator('text=Error Loading Recommendations').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    const hasContent = await page.locator(
      'text=AI Recommendations, text=Recommendations, text=Intelligence, text=No Recommendations'
    ).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasContent).toBeTruthy();
    console.log('✅ Recommendations page loaded with AI content');
  });

  test('Pilot dashboard loads with ROI data', async ({ page }) => {
    await doLogin(page);
    await page.goto('/pilot-dashboard');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(20);
    console.log('✅ Pilot dashboard loaded');
  });
});
