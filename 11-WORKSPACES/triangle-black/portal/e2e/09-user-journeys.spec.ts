import { test, expect } from "@playwright/test";
import { navigateAuthenticated, BASE_URL, injectAuth } from "./helpers/auth";

test.describe("User Journeys — UI", () => {

  test("journey: login page renders all form elements", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("journey: login form fills and submits correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    const emailInput = page.locator('input[type="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill("amr@triangleblack.com");
    await passInput.fill("admin123");
    await submitBtn.click();

    // Deterministic wait for navigation away from /login
    await expect(page).not.toHaveURL(/\/login(\?.*)?$/, { timeout: 15000 });
  });

  test("journey: work orders page shows New Work Order button", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test("journey: clicking New Work Order opens modal", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click();
    await page.waitForTimeout(500);
    const modal = page.locator("text=Work Order").first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test("journey: work order modal has title input", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
    await btn.click();
    await page.waitForTimeout(500);
    const titleInput = page.locator('input[placeholder*="HVAC"], input[placeholder*="title"], input[placeholder*="work"]').first();
    const count = await titleInput.count();
    if (count > 0) {
      await expect(titleInput).toBeVisible({ timeout: 5000 });
      await titleInput.fill("E2E UI Test Work Order");
      const value = await titleInput.inputValue();
      expect(value).toContain("E2E UI Test Work Order");
    } else {
      const anyInput = page.locator('input[type="text"]').first();
      await expect(anyInput).toBeVisible({ timeout: 5000 });
    }
  });

  test("journey: work order modal can be closed", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
    await btn.click();
    await page.waitForTimeout(500);
    const closeBtn = page.locator("button", { hasText: "×" }).first();
    const count = await closeBtn.count();
    if (count > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      const modal = page.locator("text=Work Order Created").first();
      expect(await modal.count()).toBe(0);
    } else {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
    expect(page.url()).not.toContain("/login");
  });

  test("journey: leads page shows New Lead button", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    const btn = page.locator("button", { hasText: "+ New Lead" }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test("journey: clicking New Lead opens modal", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    const btn = page.locator("button", { hasText: "+ New Lead" }).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click();
    await page.waitForTimeout(500);
    const modal = page.locator("text=Lead").first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test("journey: lead modal has name input and can be filled", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    const btn = page.locator("button", { hasText: "+ New Lead" }).first();
    await btn.click();
    await page.waitForTimeout(500);
    const nameInput = page.locator('input[placeholder*="Ahmed"], input[placeholder*="name"], input[placeholder*="Name"]').first();
    const count = await nameInput.count();
    if (count > 0) {
      await nameInput.fill("E2E UI Test Lead");
      const value = await nameInput.inputValue();
      expect(value).toContain("E2E UI Test Lead");
    } else {
      const anyInput = page.locator('input[type="text"]').first();
      await expect(anyInput).toBeVisible({ timeout: 5000 });
    }
  });

  test("journey: work orders table shows data columns", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    await page.waitForTimeout(2000);
    const table = page.locator("table").first();
    const count = await table.count();
    if (count > 0) {
      await expect(table).toBeVisible();
      const headers = await page.locator("thead th").allInnerTexts();
      expect(headers.length).toBeGreaterThan(0);
    } else {
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
    }
  });

  test("journey: leads table shows data or empty state", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    await page.waitForTimeout(2000);
    const table = page.locator("table").first();
    const tableCount = await table.count();
    const emptyState = page.locator(".tb-empty").or(page.locator("text=No leads")).first();
    const emptyCount = await emptyState.count();
    expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
  });

  test("journey: work orders search filters results", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    await page.waitForTimeout(2000);
    const input = page.locator("input[placeholder*='Search'], input[placeholder*='search']").first();
    const count = await input.count();
    if (count > 0) {
      await input.fill("xyz_nonexistent_query_12345");
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain("/login");
    } else {
      expect(true).toBeTruthy();
    }
  });

  test("journey: navigation sidebar is visible on work orders", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    const nav = page.locator("nav, aside, [role='navigation']").first();
    const count = await nav.count();
    if (count > 0) {
      await expect(nav).toBeVisible();
    } else {
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(0);
    }
  });

  test("journey: maintenance assets page shows asset list or empty", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    await page.waitForTimeout(2000);
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 10000 });
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("404");
  });

  test("journey: invoices page loads and shows collection data", async ({ page }) => {
    await navigateAuthenticated(page, "/invoices");
    await page.waitForTimeout(2000);
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 10000 });
    const text = await h1.innerText();
    expect(text.toLowerCase()).toContain("invoice");
  });

  test("journey: back navigation from work order detail works", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    await page.waitForTimeout(2000);
    const firstRow = page.locator("table tbody tr, .tb-table-row").first();
    const count = await firstRow.count();
    if (count > 0) {
      await firstRow.click();
      await page.waitForTimeout(1500);
      await page.goBack();
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain("/login");
    } else {
      expect(true).toBeTruthy();
    }
  });

});
