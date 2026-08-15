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

  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  await page.context().addCookies([
    { name: "tb_access_token", value: token, url: BASE_URL, sameSite: "Lax" },
    { name: "tb_token", value: token, url: BASE_URL, sameSite: "Lax" },
  ]);

  await page.evaluate((t) => {
    try {
      localStorage.setItem("tb_access_token", t);
      localStorage.setItem("tb_token", t);
      sessionStorage.setItem("tb_access_token", t);
      sessionStorage.setItem("tb_token", t);
      document.cookie = `tb_access_token=${t}; path=/; SameSite=Lax`;
      document.cookie = `tb_token=${t}; path=/; SameSite=Lax`;
    } catch {}
  }, token);

  return token;
}

export async function loginViaUI(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="mail"]').first().fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first().click();
  await page.waitForTimeout(2000);
}

export async function navigateAuthenticated(page: Page, path: string): Promise<void> {
  await injectAuth(page);
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "commit", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
}
