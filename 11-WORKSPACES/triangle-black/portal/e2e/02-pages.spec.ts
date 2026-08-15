import { test, expect } from "@playwright/test";
import { navigateAuthenticated, BASE_URL } from "./helpers/auth";

const PAGES = [
  { path: "/operations/work-orders",          label: "Work Orders" },
  { path: "/commercial/leads",                label: "Leads" },
  { path: "/maintenance/assets",              label: "Assets" },
  { path: "/invoices",                        label: "Invoices" },
  { path: "/supply-chain/stock-balances",     label: "Stock Balances" },
  { path: "/maintenance/pm-plans",            label: "PM Plans" },
  { path: "/commercial/contracts",            label: "Contracts" },
  { path: "/operations/service-requests",     label: "Service Requests" },
  { path: "/operations/technicians",          label: "Technicians" },
  { path: "/notifications",                   label: "Notifications" },
];

for (const pg of PAGES) {
  test(`page loads: ${pg.label}`, async ({ page }) => {
    await navigateAuthenticated(page, pg.path);
    const url = page.url();
    expect(url).not.toContain("/login");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 8000 });
  });
}
