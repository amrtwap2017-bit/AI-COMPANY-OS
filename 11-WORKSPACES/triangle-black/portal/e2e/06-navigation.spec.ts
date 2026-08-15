import { test, expect } from "@playwright/test";
import { navigateAuthenticated, BASE_URL } from "./helpers/auth";

test.describe("Navigation", () => {

  test("workspace page loads after auth", async ({ page }) => {
    await navigateAuthenticated(page, "/workspace");
    expect(page.url()).not.toContain("/login");
  });

  test("financial page loads after auth", async ({ page }) => {
    await navigateAuthenticated(page, "/financial");
    expect(page.url()).not.toContain("/login");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("maintenance assets page loads after auth", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    expect(page.url()).not.toContain("/login");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("supply chain page loads after auth", async ({ page }) => {
    await navigateAuthenticated(page, "/supply-chain");
    expect(page.url()).not.toContain("/login");
  });

  test("executive page loads after auth", async ({ page }) => {
    await navigateAuthenticated(page, "/executive");
    expect(page.url()).not.toContain("/login");
  });

  test("analytics page loads after auth", async ({ page }) => {
    await navigateAuthenticated(page, "/analytics");
    expect(page.url()).not.toContain("/login");
  });

  test("page title is present on work orders", async ({ page }) => {
    await navigateAuthenticated(page, "/operations/work-orders");
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test("page title is present on leads", async ({ page }) => {
    await navigateAuthenticated(page, "/commercial/leads");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("no console errors on work orders page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await navigateAuthenticated(page, "/operations/work-orders");
    await page.waitForTimeout(2000);
    const criticalErrors = errors.filter(e =>
      !e.includes("hydration") &&
      !e.includes("Warning") &&
      !e.includes("ResizeObserver")
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("page does not show 404 text on assets", async ({ page }) => {
    await navigateAuthenticated(page, "/maintenance/assets");
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("404");
    expect(body).not.toContain("Page Not Found");
  });

});
