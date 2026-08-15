import { Page } from "@playwright/test";

export const ADMIN_EMAIL    = "amr@triangleblack.com";
export const ADMIN_PASSWORD = "admin123";
export const BASE_URL       = "http://localhost:3000";
export const API_URL        = "http://localhost:8030";

export async function getAdminToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Login failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

export async function injectAuth(page: Page): Promise<string> {
  const token = await getAdminToken();
  await page.goto(`${BASE_URL}/login`);
  await page.evaluate((t) => {
    localStorage.setItem("tb_access_token", t);
    localStorage.setItem("tb_token", t);
  }, token);
  return token;
}

export async function loginViaUI(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  const emailInput = page.locator('input[type="email"], input[placeholder*="mail"], input[name="email"], input[placeholder*="Email"]').first();
  const passInput  = page.locator('input[type="password"]').first();
  await emailInput.fill(ADMIN_EMAIL);
  await passInput.fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first().click();
  await page.waitForURL(/workspace|dashboard|\/$/i, { timeout: 10000 }).catch(() => {});
}

export async function navigateAuthenticated(page: Page, path: string): Promise<void> {
  await injectAuth(page);
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState("networkidle");
}
