import { test, expect } from "@playwright/test";
import { navigateAuthenticated } from "./helpers/auth";

const PAGES = [
  { path: "/operations/work-orders",      label: "Work Orders", timeout: 25000 },
  { path: "/commercial/leads",            label: "Leads", timeout: 45000 },
  { path: "/maintenance/assets",          label: "Assets", timeout: 25000 },
  { path: "/invoices",                    label: "Invoices", timeout: 25000 },
  { path: "/supply-chain/stock-balances", label: "Stock Balances", timeout: 25000 },
  { path: "/maintenance/pm-plans",        label: "PM Plans", timeout: 25000 },
  { path: "/commercial/contracts",        label: "Contracts", timeout: 25000 },
  { path: "/operations/service-requests", label: "Service Requests", timeout: 25000 },
  { path: "/operations/technicians",      label: "Technicians", timeout: 25000 },
  { path: "/notifications",               label: "Notifications", timeout: 25000 },
];

for (const pg of PAGES) {
  test(`page loads: ${pg.label}`, async ({ page }) => {
    test.setTimeout(pg.timeout);
    await navigateAuthenticated(page, pg.path);
    expect(page.url()).not.toContain("/login");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });
}
