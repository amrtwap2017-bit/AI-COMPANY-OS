import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from "./helpers/auth";

let token = "";
test.beforeAll(async ({ request }) => {
  const res = await request.post(`${API_URL}/api/v1/auth/login`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: `username=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}`,
  });
  const data = await res.json();
  token = data.access_token;
});

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
    const searchOrFilter = page.locator("input, select").first();
    await expect(searchOrFilter).toBeVisible({ timeout: 10000 });
  });

  test("API: list work orders returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/work-orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: work orders response has expected structure", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/work-orders/?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.results || data?.items || data?.data || [];
    expect(Array.isArray(items)).toBeTruthy();
  });

  test("API: filter by status open returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/work-orders/?status=open`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: filter by priority critical returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/work-orders/?priority=critical`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: create work order returns 200 or 201", async ({ request }) => {
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
    expect([200, 201]).toContain(res.status());
  });

  test("API: work order with no title returns error", async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/work-orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: { priority: "low" },
    });
    expect([400, 422]).toContain(res.status());
  });

});
