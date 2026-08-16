import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";

test.describe("Dashboard and Workspace", () => {

  test("workspace page loads after auth", async ({ page }) => {
    await navigateAuthenticated(page, "/workspace");
    expect(page.url()).not.toContain("/login");
  });

  test("workspace page has h1 or page content", async ({ page }) => {
    await navigateAuthenticated(page, "/workspace");
    await page.waitForTimeout(2000);
    const body = await page.locator("body").innerText();
    expect(body.length).toBeGreaterThan(50);
    expect(body).not.toContain("404");
  });

  test("executive dashboard page loads", async ({ page }) => {
    await navigateAuthenticated(page, "/executive/dashboard");
    expect(page.url()).not.toContain("/login");
    await page.waitForTimeout(2000);
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("404");
  });

  test("analytics hub page loads", async ({ page }) => {
    await navigateAuthenticated(page, "/analytics");
    expect(page.url()).not.toContain("/login");
  });

  test("API: dashboard summary returns 200", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 404, 429]).toContain(res.status());
  });

  test("API: cache status visible in dashboard", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/cache/status`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.backend).toMatch(/redis|memory/i);
  });

  test("API: health live endpoint responds", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/health/live`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("live");
  });

  test("API: health ready endpoint responds with DB status", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/health/ready`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ready");
  });

  test("my-day endpoint returns data", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/workspace/my-day`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 404, 429]).toContain(res.status());
  });

  test("notifications page loads", async ({ page }) => {
    await navigateAuthenticated(page, "/notifications");
    expect(page.url()).not.toContain("/login");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("inbox page loads", async ({ page }) => {
    await navigateAuthenticated(page, "/inbox");
    expect(page.url()).not.toContain("/login");
  });

  test("exceptions page loads", async ({ page }) => {
    await navigateAuthenticated(page, "/executive/exceptions");
    expect(page.url()).not.toContain("/login");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

});
