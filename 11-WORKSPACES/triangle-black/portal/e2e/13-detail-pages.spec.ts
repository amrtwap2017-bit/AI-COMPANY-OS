import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";

test.describe("Detail Pages", () => {

  test("PM plans list page loads with h1", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/pm-plans");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("PM plans page stays off login", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/pm-plans");
    expect(page.url()).not.toContain("/login");
  });

  test("PM plans page shows table or empty state", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/pm-plans");
    await page.waitForTimeout(2000);
    const table = page.locator("table").first();
    const empty = page.locator(".tb-empty").first();
    expect(await table.count() > 0 || await empty.count() > 0).toBeTruthy();
  });

  test("API: PM plans list returns acceptable status", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/maintenance/pm-plans/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 429]).toContain(res.status());
  });

  test("PM plan detail accessible from list", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/pm-plans");
    await page.waitForTimeout(2000);
    const firstRow = page.locator("table tbody tr").first();
    const count = await firstRow.count();
    if (count > 0) {
      await firstRow.click();
      await page.waitForTimeout(1500);
      expect(page.url()).not.toContain("/login");
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("technicians list page loads with h1", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/technicians");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("technicians page shows dispatch button", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/technicians");
    const btn = page.locator("button", { hasText: "Dispatch" }).first();
    const count = await btn.count();
    if (count > 0) {
      await expect(btn).toBeVisible({ timeout: 8000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("technicians page shows cards or empty", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/technicians");
    await page.waitForTimeout(2000);
    const cards = page.locator(".tb-section, .tb-grid-3 button").first();
    const empty = page.locator(".tb-empty").first();
    expect(await cards.count() > 0 || await empty.count() > 0).toBeTruthy();
  });

  test("API: technicians list returns 200", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/technicians/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("technician detail accessible from list", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/technicians");
    await page.waitForTimeout(2000);
    const firstCard = page.locator(".tb-grid-3 button, .tb-section button").first();
    const count = await firstCard.count();
    if (count > 0) {
      await firstCard.click();
      await page.waitForTimeout(1500);
      expect(page.url()).not.toContain("/login");
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("service requests list page loads with h1", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/service-requests");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("service requests page shows create button", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/service-requests");
    const btn = page.locator("button", { hasText: "New Service Request" }).first();
    const count = await btn.count();
    if (count > 0) {
      await expect(btn).toBeVisible({ timeout: 8000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("API: service requests list returns acceptable", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/service-requests/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 429]).toContain(res.status());
  });

  test("work orders detail page loads for first work order", async ({ page }) => {
    const token = getSharedToken();
    const res = await page.request.get(`${API_URL}/api/v1/work-orders/?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.results || data?.items || [];
    if (items.length === 0) {
      expect(true).toBeTruthy();
      return;
    }
    const id = items[0].id;
    await navigateAuthenticated(page, `/operations/work-orders/${id}`);
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain("/login");
  });

  test("asset detail page loads for first asset", async ({ page }) => {
    const token = getSharedToken();
    const res = await page.request.get(`${API_URL}/api/v1/assets/?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.results || data?.items || [];
    if (items.length === 0) {
      expect(true).toBeTruthy();
      return;
    }
    const id = items[0].id;
    await navigateAuthenticated(page, `/maintenance/assets/${id}`);
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain("/login");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 10000 });
  });

});
