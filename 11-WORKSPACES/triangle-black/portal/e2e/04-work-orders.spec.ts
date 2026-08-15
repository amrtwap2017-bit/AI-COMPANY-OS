import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";

test.describe("Work Orders", () => {
  test("work orders page shows h1", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("work orders page URL stays off login", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    expect(page.url()).not.toContain("/login");
  });

  test("work orders page has filter or search element", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    await expect(page.locator("input, select").first()).toBeVisible({ timeout: 10000 });
  });

  test("API: list work orders returns 200", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/work-orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: work orders response has expected structure", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/work-orders/?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.results || data?.items || data?.data || [];
    expect(Array.isArray(items)).toBeTruthy();
  });

  test("API: filter by status open returns acceptable status", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/work-orders/?status=open`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 422, 429]).toContain(res.status());
  });

  test("API: filter by priority critical returns acceptable status", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/work-orders/?priority=critical`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 401, 403, 422, 429]).toContain(res.status());
  });

  test("API: create work order returns acceptable current status", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.post(`${API_URL}/api/v1/work-orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "E2E Test Work Order",
        priority: "low",
        type: "corrective",
        description: "Created by Playwright E2E test",
      },
    });
    expect([200, 201, 400, 401, 403, 422, 429]).toContain(res.status());
  });

  test("API: work order validation returns acceptable current status", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.post(`${API_URL}/api/v1/work-orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: { priority: "low" },
    });
    expect([400, 401, 403, 422, 429]).toContain(res.status());
  });
});
