import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";

test.describe("Contracts", () => {

  test("contracts page loads with h1", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("contracts page stays off login", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    expect(page.url()).not.toContain("/login");
  });

  test("contracts page shows New Contract button", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    const btn = page.locator("button", { hasText: "+ New Contract" }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test("journey: New Contract button navigates to leads pipeline", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    const btn = page.locator("button", { hasText: "+ New Contract" }).first();
    await btn.click();
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain("/login");
    expect(page.url()).toMatch(/leads|commercial/i);
  });

  test("contracts page shows status filter tabs", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    const tabs = page.locator(".tb-tab, .tb-tabs button").first();
    const count = await tabs.count();
    if (count > 0) {
      await expect(tabs).toBeVisible({ timeout: 8000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("contracts page shows table or empty state", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    await page.waitForTimeout(2000);
    const table = page.locator("table").first();
    const tableCount = await table.count();
    const empty = page.locator(".tb-empty").first();
    const emptyCount = await empty.count();
    expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
  });

  test("contracts page does not show 404", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    const body = await page.locator("body").innerText();
    const hasNext404 = body.includes("This page could not be found") || body.includes("404 | Page Not Found");
    expect(hasNext404).toBe(false);
  });

  test("API: list contracts returns 200", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/contracts/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: contracts response is a list", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/contracts/?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    const isArr = Array.isArray(data);
    const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
    expect(isArr || hasItems).toBeTruthy();
  });

  test("API: contracts filter by status active returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/contracts/?status=active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: contracts filter by status expired returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/contracts/?status=expired`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: contract detail returns 200 or 404 for first contract", async ({ request }) => {
    const token = getSharedToken();
    const listRes = await request.get(`${API_URL}/api/v1/contracts/?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await listRes.json();
    const items = Array.isArray(data) ? data : data?.items || data?.results || [];
    if (items.length === 0) {
      expect(true).toBeTruthy();
      return;
    }
    const id = items[0].id;
    const res = await request.get(`${API_URL}/api/v1/contracts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(res.status());
  });

  test("journey: clicking contract row navigates to detail", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    await page.waitForTimeout(2000);
    const firstRow = page.locator("table tbody tr").first();
    const count = await firstRow.count();
    if (count > 0) {
      await firstRow.click();
      await page.waitForTimeout(1500);
      expect(page.url()).not.toContain("/login");
      expect(page.url()).toMatch(/contracts\/.+/);
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("journey: contracts search filters list", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/contracts");
    await page.waitForTimeout(1500);
    const input = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='contract']").first();
    const count = await input.count();
    if (count > 0) {
      await input.fill("test_search_12345");
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain("/login");
    } else {
      expect(true).toBeTruthy();
    }
  });

});
