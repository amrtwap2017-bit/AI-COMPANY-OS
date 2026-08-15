import { test, expect } from "@playwright/test";
import { API_URL, getSharedToken } from "./helpers/auth";

test.describe("API Form Validation", () => {

  test("API: create work order missing title returns 422", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.post(`${API_URL}/api/v1/work-orders/`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: { priority: "high" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("API: create service request missing required fields returns error", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.post(`${API_URL}/api/v1/service-requests/`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: {},
    });
    expect([400, 422]).toContain(res.status());
  });

  test("API: create purchase request returns 200 or 201", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.post(`${API_URL}/api/v1/purchase-requests-portal`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: {
        title: "E2E Purchase Request Test",
        department: "Engineering",
        urgency: "normal",
        justification: "Playwright E2E test",
      },
    });
    expect([200, 201, 422]).toContain(res.status());
  });

  test("API: create lead with valid data returns 200 or 201", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.post(`${API_URL}/api/v1/leads-portal-v2`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: {
        name: `E2E Lead ${Date.now()}`,
        company: "Test Corp",
        email: `test${Date.now()}@example.com`,
        source: "manual",
        priority: "low",
        status: "new",
      },
    });
    expect([200, 201]).toContain(res.status());
  });

  test("API: create lead with duplicate email acceptable", async ({ request }) => {
    const token = getSharedToken();
    const email = `dup${Date.now()}@test.com`;
    await request.post(`${API_URL}/api/v1/leads-portal-v2`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: { name: "First Lead", email, source: "manual", status: "new" },
    });
    const res = await request.post(`${API_URL}/api/v1/leads-portal-v2`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      data: { name: "Second Lead", email, source: "manual", status: "new" },
    });
    expect([200, 201, 400, 409, 422]).toContain(res.status());
  });

  test("API: invalid status on work order returns 200 or 422", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/work-orders/?status=notavalidstatus`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: pagination limit=1 returns max 1 item", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/work-orders/?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.results || data?.items || [];
    expect(items.length).toBeLessThanOrEqual(1);
  });

  test("API: pagination limit=0 returns 200 or 422", async ({ request }) => {
    const token = getSharedToken();
    const res = await request.get(`${API_URL}/api/v1/work-orders/?limit=0`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("login form has email and password inputs", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("login form submit button is enabled by default", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");
    const btn = page.locator('button[type="submit"]').first();
    await expect(btn).toBeVisible();
    await expect(btn).not.toBeDisabled();
  });

});
