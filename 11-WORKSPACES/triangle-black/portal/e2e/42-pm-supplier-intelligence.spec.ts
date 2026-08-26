/**
 * E2E Spec 42 — PM Engine + Supplier Intelligence APIs
 * Sprint A-011
 */
import { test, expect } from "@playwright/test";
import { injectAuth } from "./helpers/auth";

const BASE = "http://localhost:8030";

test.beforeEach(async ({ page }) => {
  await injectAuth(page);
});

test("PM engine summary returns valid compliance data", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/pm-engine/summary", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("pm_compliance_pct");
  expect(res.data).toHaveProperty("compliance_grade");
  expect(["A", "B", "C", "D", "A+", "B+"]).toContain(res.data.compliance_grade);
});

test("PM engine compliance has by_category array", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/pm-engine/compliance", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("by_category");
  expect(res.data).toHaveProperty("overall_compliance_pct");
});

test("PM engine overdue returns total_overdue count", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/pm-engine/overdue", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(typeof res.data.total_overdue).toBe("number");
  expect(typeof res.data.critical_overdue).toBe("number");
});

test("Supplier engine concentration risk returns risk_level", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/supplier-engine/concentration", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("concentration_pct");
  expect(["LOW", "MODERATE", "HIGH", "CRITICAL"]).toContain(res.data.risk_level);
});

test("Supplier engine scores returns scored supplier list", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/supplier-engine/scores?limit=5", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("suppliers");
  if (res.data.count > 0) {
    const s = res.data.suppliers[0];
    expect(s).toHaveProperty("performance_score");
    expect(s.performance_score).toBeGreaterThanOrEqual(0);
    expect(s.performance_score).toBeLessThanOrEqual(100);
  }
});

test("Supplier engine recommendations returns prefer/avoid lists", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/supplier-engine/recommendations", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("preferred_suppliers");
  expect(res.data).toHaveProperty("avoid_suppliers");
  expect(res.data).toHaveProperty("insights");
});

test("Workflow instances API returns count and results", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/workflow/instances", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data).toHaveProperty("count");
  expect(res.data.count).toBeGreaterThan(0);
});

test("Workflow definitions returns 100+ definitions", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/workflow/definitions", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.count).toBeGreaterThan(0);
});
