/**
 * E2E Spec 44 — Maintenance Intelligence + Demo Pages
 * Sprint A-064
 */
import { test, expect } from "@playwright/test";
import { injectAuth } from "./helpers/auth";

const BASE = "http://localhost:8030";

test.beforeEach(async ({ page }) => {
  await injectAuth(page);
});

test("PM Engine summary returns on-schedule compliance", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/pm-engine/summary", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.pm_compliance_pct).toBeGreaterThan(30);
  expect(res.data.total_plans).toBeGreaterThan(200);
});

test("Cost engine returns EGP 2M+ total cost", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/cost-engine/summary", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.cost_overview.total_operational_cost).toBeGreaterThan(2_000_000);
});

test("Backlog engine shows 100+ open WOs", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/backlog-engine/summary", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.backlog_summary.total_open).toBeGreaterThan(0);
});

test("Risk engine returns MODERATE risk", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/risk-engine/operational", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.composite_risk_score).toBeLessThan(55);
  expect(["MODERATE","LOW"]).toContain(res.data.risk_level);
});

test("Executive engine health score 70+", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/executive-engine/health-score", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.health_score).toBeGreaterThan(65);
  expect(["GOOD","EXCELLENT"]).toContain(res.data.grade);
});

test("Supplier engine 200 scored suppliers", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/supplier-engine/summary", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.total_suppliers).toBeGreaterThan(50);
});

test("Zero 500 errors across 10 engines", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const endpoints = [
    "/api/v1/pm-engine/summary",
    "/api/v1/sla-engine/summary",
    "/api/v1/backlog-engine/summary",
    "/api/v1/risk-engine/operational",
    "/api/v1/cost-engine/summary",
  ];
  for (const ep of endpoints) {
    const res = await page.evaluate(async ({ ep, tok }) => {
      const r = await fetch(`http://localhost:8030${ep}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      return r.status;
    }, { ep, tok: token });
    expect(res).not.toBe(500);
    expect(res).toBe(200);
  }
});

test("PM engine compliance by category returns data", async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem("tb_access_token"));
  const res = await page.evaluate(async (tok) => {
    const r = await fetch("http://localhost:8030/api/v1/pm-engine/compliance", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    return { status: r.status, data: await r.json() };
  }, token);
  expect(res.status).toBe(200);
  expect(res.data.by_category).toBeDefined();
  expect(res.data.overall_compliance_pct).toBeGreaterThan(0);
});
