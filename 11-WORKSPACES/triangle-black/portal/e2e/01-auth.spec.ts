import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, BASE_URL, API_URL, BACKEND_URL, injectAuth } from "./helpers/auth";

test.describe("Authentication", () => {

  test("login page loads correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveTitle(/Triangle Black|Login|Sign in/i);
    await expect(page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="mail"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("login page has submit button", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const btn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    await expect(btn).toBeVisible();
  });

  test("invalid credentials shows error", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="mail"]').first();
    const passInput  = page.locator('input[type="password"]').first();
    await emailInput.fill("wrong@example.com");
    await passInput.fill("wrongpassword");
    await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first().click();
    await page.waitForTimeout(2000);
    const url = page.url();
    const hasError = await page.locator("text=/invalid|incorrect|wrong|error|failed/i").count() > 0;
    const staysOnLogin = url.includes("/login");
    expect(staysOnLogin || hasError).toBeTruthy();
  });

  test("unauthenticated access redirects to login", async ({ page }) => {
    await page.goto(`${BASE_URL}/operations/work-orders`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/login");
  });

  test("backend login API returns token", async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
      form: {
        username: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.access_token).toBeTruthy();
    expect(typeof data.access_token).toBe("string");
    expect(data.access_token.length).toBeGreaterThan(20);
  });

  test("inject auth and reach protected page", async ({ page }) => {
    await injectAuth(page);
    await page.goto(`${BASE_URL}/operations/work-orders`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    expect(page.url()).not.toContain("/login");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("inject auth seeds cookies and storage", async ({ page }) => {
    await injectAuth(page);
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(1000);

    const token = await page.evaluate(() =>
      localStorage.getItem("tb_access_token") ||
      localStorage.getItem("tb_token") ||
      sessionStorage.getItem("tb_access_token") ||
      sessionStorage.getItem("tb_token")
    );

    const cookies = await page.context().cookies();
    const hasAccessCookie = cookies.some(c => c.name === "tb_access_token");
    const hasTokenCookie  = cookies.some(c => c.name === "tb_token");

    expect(token).toBeTruthy();
    expect(hasAccessCookie || hasTokenCookie).toBeTruthy();
  });

  test("health check endpoint is reachable", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/v1/health/live`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("live");
  });

  test("health ready endpoint confirms DB connected", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/v1/health/ready`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ready");
  });

});
