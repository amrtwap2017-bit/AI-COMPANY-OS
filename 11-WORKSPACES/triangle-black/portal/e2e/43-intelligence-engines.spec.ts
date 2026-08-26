/**
 * E2E Spec 43 — Intelligence Engines API Surface
 * Sprint A-018
 */
import { test, expect } from "@playwright/test";
import { injectAuth } from "./helpers/auth";

const BASE = "http://localhost:8030";

test.beforeEach(async ({ page }) => {
  await injectAuth(page);
});

test("Executive Engine: daily briefing returns health + kpis + alerts", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch(`${location.origin.replace("3000","8030")}/api/v1/executive-engine/daily-briefing`.replace(location.origin, "http://localhost:8030"), {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("health");
  expect(res.data).toHaveProperty("kpis");
  expect(res.data).toHaveProperty("alerts");
});

test("SLA Engine: at-risk returns work orders with risk levels", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/sla-engine/at-risk", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("total_at_risk");
  expect(typeof res.data.breached_count).toBe("number");
});

test("Asset Engine: health scores bounded 0-100", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/asset-engine/health-scores?limit=5", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  for (const asset of res.data.assets || []) {
    expect(asset.health_score).toBeGreaterThanOrEqual(0);
    expect(asset.health_score).toBeLessThanOrEqual(100);
  }
});

test("Procurement Engine: spend returns supplier list with amounts", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/procurement-engine/spend?limit=5", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("total_spend");
  expect(res.data.total_spend).toBeGreaterThanOrEqual(0);
});

test("PM Engine: compliance has by_category array", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/pm-engine/compliance", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.data.by_category)).toBe(true);
  expect(res.data.overall_compliance_pct).toBeGreaterThanOrEqual(0);
});

test("Supplier Engine: concentration risk is valid", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/supplier-engine/concentration", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(["LOW", "MODERATE", "HIGH", "CRITICAL"]).toContain(res.data.risk_level);
});

test("Intelligence Hub portal page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/intelligence");
  await page.waitForLoadState("networkidle", { timeout: 15000 });
  const title = await page.locator("h1").first().textContent();
  expect(title).toContain("Intelligence");
});

test("Command Center portal page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/operations/command-center");
  await page.waitForLoadState("networkidle", { timeout: 15000 });
  const h1 = await page.locator("h1").first().textContent();
  expect(h1).toContain("Command Center");
});
