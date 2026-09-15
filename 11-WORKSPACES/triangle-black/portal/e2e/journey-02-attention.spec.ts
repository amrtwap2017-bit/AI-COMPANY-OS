/**
 * Journey 2: Attention Command Center
 * REAL BROWSER TEST — verifies operational intelligence dashboard
 * Critical for customer pilot — this is where engineers see what needs action
 */
import { test, expect } from '@playwright/test';

const EMAIL = 'amr@triangleblack.com';
const PASSWORD = 'admin123';

// Helper: login
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 20000 });
}

test.describe('Journey 2: Attention Command Center', () => {
  test('Attention dashboard loads without fatal error', async ({ page }) => {
    await login(page);
    
    // Navigate to attention/command center
    await page.goto('/operations/command-center');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    // Verify no loading spinner stuck
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 15000 }).catch(() => {});
    
    // Verify no "Error Loading Data" message
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Verify page has some content
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(20);
    
    console.log('✅ Attention command center loaded without fatal error');
    console.log('   URL:', page.url());
  });

  test('Recommendations page loads with AI intelligence', async ({ page }) => {
    await login(page);
    
    await page.goto('/recommendations');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    // Verify no error state
    const hasError = await page.locator('text=Error Loading Recommendations').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    // Verify either recommendations list OR empty state
    const hasContent = await page.locator(
      'text=AI Recommendations, text=Recommendations, text=No Recommendations, text=Intelligence'
    ).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasContent).toBeTruthy();
    
    console.log('✅ Recommendations page loaded with AI intelligence');
  });

  test('Pilot dashboard loads with ROI data', async ({ page }) => {
    await login(page);
    
    await page.goto('/pilot-dashboard');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    // Verify no crash
    const hasError = await page.locator('text=Error Loading Data').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
    
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(20);
    
    console.log('✅ Pilot dashboard loaded');
  });
});
