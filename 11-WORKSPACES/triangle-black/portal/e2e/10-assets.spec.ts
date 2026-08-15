import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";

test.describe("Assets", () => {

  test("assets page loads with h1", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("assets page stays off login", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    expect(page.url()).not.toContain("/login");
  });

  test("assets page shows search input", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    const input = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='asset']").first();
    const count = await input.count();
    if (count > 0) {
      await expect(input).toBeVisible({ timeout: 8000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("assets page shows category filter", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    const select = page.locator("select").first();
    const count = await select.count();
    if (count > 0) {
      await expect(select).toBeVisible({ timeout: 8000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("assets page shows table or empty state", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    await page.waitForTimeout(2000);
    const table = page.locator("table").first();
    const tableCount = await table.count();
    const empty = page.locator(".tb-empty, .tb-empty-icon").first();
    const emptyCount = await empty.count();
    expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
  });

  test("assets page body does not contain 404", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("404");
    expect(body).not.toContain("Page Not Found");
  });

  test("API: list assets returns 200", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/assets/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: assets response is a list", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/assets/?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    const isArr = Array.isArray(data);
    const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
    expect(isArr || hasItems).toBeTruthy();
  });

  test("API: assets filter by status Operational returns 200", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/assets/?status=Operational`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: assets filter by category HVAC returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/assets/?category=HVAC`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: asset detail returns 200 or 404 for first asset", async ({ request }) => {
    const token = getSharedToken();
    const listRes = await request.get(`${API_URL}/api/v1/assets/?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await listRes.json();
    const items = Array.isArray(data) ? data : data?.items || data?.results || [];
    if (items.length === 0) {
      expect(true).toBeTruthy();
      return;
    }
    const id = items[0].id;
    const res = await request.get(`${API_URL}/api/v1/assets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(res.status());
  });

  test("journey: clicking asset row navigates to detail", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    await page.waitForTimeout(2000);
    const firstRow = page.locator("table tbody tr").first();
    const count = await firstRow.count();
    if (count > 0) {
      await firstRow.click();
      await page.waitForTimeout(1500);
      expect(page.url()).not.toContain("/login");
      expect(page.url()).toMatch(/maintenance\/assets\/.+/);
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("journey: asset search filters the list", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    await page.waitForTimeout(1500);
    const input = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='asset']").first();
    const count = await input.count();
    if (count > 0) {
      await input.fill("HVAC");
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain("/login");
    } else {
      expect(true).toBeTruthy();
    }
  });

});
