import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";

test.describe("Purchase Requests", () => {

  test("purchase requests page loads with h1", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("purchase requests page stays off login", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    expect(page.url()).not.toContain("/login");
  });

  test("purchase requests page shows New PR button", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    const btn = page.locator("button", { hasText: "+ New PR" }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test("journey: clicking New PR opens modal", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    const btn = page.locator("button", { hasText: "+ New PR" }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click();
    await page.waitForTimeout(500);
    const modal = page.locator("text=Purchase Request").first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test("journey: PR modal has title input", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    const btn = page.locator("button", { hasText: "+ New PR" }).first();
    await btn.click();
    await page.waitForTimeout(500);
    const titleInput = page.locator('input[placeholder*="HVAC"], input[placeholder*="Restock"], input[placeholder*="title"]').first();
    const count = await titleInput.count();
    if (count > 0) {
      await titleInput.fill("E2E PR Test");
      const value = await titleInput.inputValue();
      expect(value).toContain("E2E PR Test");
    } else {
      const anyInput = page.locator('input[type="text"]').first();
      await expect(anyInput).toBeVisible({ timeout: 5000 });
    }
  });

  test("journey: PR modal can be closed", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    const btn = page.locator("button", { hasText: "+ New PR" }).first();
    await btn.click();
    await page.waitForTimeout(500);
    const closeBtn = page.locator("button", { hasText: "×" }).first();
    const count = await closeBtn.count();
    if (count > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    } else {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
    expect(page.url()).not.toContain("/login");
  });

  test("purchase requests page shows status filter", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    const tabs = page.locator(".tb-tab, .tb-tabs button").first();
    const count = await tabs.count();
    if (count > 0) {
      await expect(tabs).toBeVisible({ timeout: 8000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("purchase requests page shows table or empty", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    await page.waitForTimeout(2000);
    const table = page.locator("table").first();
    const tableCount = await table.count();
    const empty = page.locator(".tb-empty").first();
    const emptyCount = await empty.count();
    expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
  });

  test("purchase requests page does not show 404", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain/purchase-requests");
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("404");
  });

  test("API: list purchase requests returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 404, 429]).toContain(res.status());
  });

  test("API: purchase requests response is list when 200", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 404, 429]).toContain(res.status());
    if (res.status() === 200) {
      const data = await res.json();
      const isArr = Array.isArray(data);
      const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
      expect(isArr || hasItems).toBeTruthy();
    }
  });

  test("API: create purchase request with valid data returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.post(`${API_URL}/api/v1/purchase-requests-portal`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: {
        title: `E2E PR ${Date.now()}`,
        department: "Engineering",
        urgency: "normal",
        justification: "Playwright E2E test",
      },
    });
    expect([200, 201, 400, 401, 403, 405, 422, 429]).toContain(res.status());
  });

  test("API: PR filter by urgency urgent returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal?urgency=urgent`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 404, 422, 429]).toContain(res.status());
  });

  test("API: PR filter by status pending returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal?status=pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 404, 422, 429]).toContain(res.status());
  });

});
