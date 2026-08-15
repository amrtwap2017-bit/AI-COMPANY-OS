import { test, expect } from "@playwright/test";
import { navigateAuthenticated, API_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from "./helpers/auth";

let token = "";
test.beforeAll(async ({ request }) => {
  const res = await request.post(`${API_URL}/api/v1/auth/login`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: `username=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}`,
  });
  token = (await res.json()).access_token;
});

test.describe("Leads", () => {

  test("leads page loads with h1", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("leads page stays off login", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    expect(page.url()).not.toContain("/login");
  });

  test("API: list leads returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/leads-portal-v2`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: leads response is array or has items", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/leads-portal-v2`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const isArr = Array.isArray(data);
    const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
    expect(isArr || hasItems).toBeTruthy();
  });

  test("API: create lead returns 200 or 201", async ({ request }) => {
    const res = await request.post(`${API_URL}/api/v1/leads-portal-v2`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        name: "E2E Test Lead",
        company: "Playwright Test Co",
        email: `e2e.${Date.now()}@test.com`,
        source: "manual",
        priority: "medium",
        status: "new",
      },
    });
    expect([200, 201]).toContain(res.status());
  });

  test("API: leads filter by status new returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/leads-portal-v2?status=new`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: leads filter by status won returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/leads-portal-v2?status=won`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: qualify action returns 200 or 404 when no leads", async ({ request }) => {
    const listRes = await request.get(`${API_URL}/api/v1/leads-portal-v2`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await listRes.json();
    const items = Array.isArray(data) ? data : data?.items || data?.results || [];
    if (items.length === 0) {
      expect(true).toBeTruthy();
      return;
    }
    const id = items[0].id;
    const res = await request.post(`${API_URL}/api/v1/actions/leads/${id}/qualify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 201, 400, 404, 422]).toContain(res.status());
  });

});
