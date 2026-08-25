import { test, expect } from "@playwright/test";
import { BACKEND_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from "./helpers/auth";

test.describe("Customer Onboarding Flow (A-008)", () => {

  test("onboarding provision-property endpoint exists", async ({ request }) => {
    const login = await request.post(`${BACKEND_URL}/api/v1/auth/login/json`, {
      data: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      headers: { "Content-Type": "application/json" },
    });
    expect(login.status()).toBe(200);
    const { access_token } = await login.json();

    const r = await request.post(`${BACKEND_URL}/api/v1/onboarding/provision-property`, {
      data: JSON.stringify({
        org_name: "Test Engineering Co",
        property_name: "Test Hotel Sharm",
        admin_email: `onboard-test-${Date.now()}@test.com`,
        admin_password: "TestPass123!",
        city: "Sharm El-Sheikh",
        country: "Egypt",
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
      },
    });
    // Accept 200 (success) or 400 (validation) — endpoint must exist
    expect([200, 400, 422]).toContain(r.status());
  });

  test("health endpoints are reachable", async ({ request }) => {
    const r1 = await request.get(`${BACKEND_URL}/api/v1/health/ready`);
    expect(r1.status()).toBe(200);
    const r2 = await request.get(`${BACKEND_URL}/api/v1/health/live`);
    expect(r2.status()).toBe(200);
  });

  test("intelligence snapshot is available", async ({ request }) => {
    const login = await request.post(`${BACKEND_URL}/api/v1/auth/login/json`, {
      data: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      headers: { "Content-Type": "application/json" },
    });
    const { access_token } = await login.json();
    const r = await request.get(`${BACKEND_URL}/api/v1/intelligence/snapshot`, {
      headers: { "Authorization": `Bearer ${access_token}` },
    });
    expect(r.status()).toBe(200);
    const data = await r.json();
    expect(data.snapshot_type).toBe("MASTER_INTELLIGENCE_SNAPSHOT");
  });

});
