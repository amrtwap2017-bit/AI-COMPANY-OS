# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-pages.spec.ts >> page loads: Stock Balances
- Location: e2e/02-pages.spec.ts:18:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('h1').first()

```

```yaml
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- link "Next.js 16.2.10 (stale) Turbopack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 16.2.10 (stale) Turbopack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Error Info":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - button "Attach Node.js inspector":
    - img
  - text: Expected ',', got ':'
  - img
  - text: ./components/ui/Textarea.tsx (13:158)
  - button "Open in editor":
    - img
  - text: "Expected ',', got ':' 11 | ... 12 | ... > 13 | ..., error: any, maxCount: any, className = \"\": any, id: any, value: any, ...props }: any,... | ^ 14 | ... 15 | ... 16 | ... Parsing ecmascript source code failed Import traces: Server Component: ./components/ui/Textarea.tsx ./components/ui/index.ts ./app/(app)/(enterprise)/maintenance/loading.tsx Client Component Browser: ./components/ui/Textarea.tsx [Client Component Browser] ./components/ui/index.ts [Client Component Browser] ./components/ui/EntityShell.tsx [Client Component Browser] ./components/ui/EntityShell.tsx [Server Component] ./components/ui/index.ts [Server Component] ./app/(app)/(enterprise)/maintenance/loading.tsx [Server Component] Client Component SSR: ./components/ui/Textarea.tsx [Client Component SSR] ./components/ui/index.ts [Client Component SSR] ./components/ui/EntityShell.tsx [Client Component SSR] ./components/ui/EntityShell.tsx [Server Component] ./components/ui/index.ts [Server Component] ./app/(app)/(enterprise)/maintenance/loading.tsx [Server Component]"
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { navigateAuthenticated } from "./helpers/auth";
  3  | 
  4  | const PAGES = [
  5  |   { path: "/operations/work-orders",      label: "Work Orders", timeout: 25000 },
  6  |   { path: "/commercial/leads",            label: "Leads", timeout: 45000 },
  7  |   { path: "/maintenance/assets",          label: "Assets", timeout: 25000 },
  8  |   { path: "/invoices",                    label: "Invoices", timeout: 25000 },
  9  |   { path: "/supply-chain/stock-balances", label: "Stock Balances", timeout: 25000 },
  10 |   { path: "/maintenance/pm-plans",        label: "PM Plans", timeout: 25000 },
  11 |   { path: "/commercial/contracts",        label: "Contracts", timeout: 25000 },
  12 |   { path: "/operations/service-requests", label: "Service Requests", timeout: 25000 },
  13 |   { path: "/operations/technicians",      label: "Technicians", timeout: 25000 },
  14 |   { path: "/notifications",               label: "Notifications", timeout: 25000 },
  15 | ];
  16 | 
  17 | for (const pg of PAGES) {
  18 |   test(`page loads: ${pg.label}`, async ({ page }) => {
  19 |     test.setTimeout(pg.timeout);
  20 |     await navigateAuthenticated(page, pg.path);
  21 |     expect(page.url()).not.toContain("/login");
> 22 |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
     |                                              ^ Error: expect(locator).toBeVisible() failed
  23 |   });
  24 | }
  25 | 
```