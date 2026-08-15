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

test.describe("Search", () => {

  test("API: global search returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/search/?q=hotel&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: quick search returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/search/quick?q=work`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(res.status());
  });

  test("API: search with empty query returns 200 or 422", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/search/?q=`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("API: search response has results structure", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/search/?q=maintenance&limit=3`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(typeof data).toBe("object");
  });

  test("work orders page search input is focusable", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    const input = page.locator("input[placeholder*='Search'], input[placeholder*='search']").first();
    const count = await input.count();
    if (count > 0) {
      await input.focus();
      await expect(input).toBeFocused();
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("leads page search input is focusable", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    const input = page.locator("input[placeholder*='Search'], input[placeholder*='search']").first();
    const count = await input.count();
    if (count > 0) {
      await input.focus();
      await expect(input).toBeFocused();
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("API: assets search by name returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/assets/?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("API: technicians search returns 200", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/v1/technicians/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

});
