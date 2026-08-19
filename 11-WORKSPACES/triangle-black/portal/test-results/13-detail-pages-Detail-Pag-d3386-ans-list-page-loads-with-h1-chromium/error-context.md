# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 13-detail-pages.spec.ts >> Detail Pages >> PM plans list page loads with h1
- Location: e2e/13-detail-pages.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
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
  1   | import { test, expect } from "@playwright/test";
  2   | import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";
  3   | 
  4   | test.describe("Detail Pages", () => {
  5   | 
  6   |   test("PM plans list page loads with h1", async ({ page }) => {
  7   |     await navigateAuthenticated(page, "/maintenance/pm-plans");
> 8   |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
      |                                              ^ Error: expect(locator).toBeVisible() failed
  9   |   });
  10  | 
  11  |   test("PM plans page stays off login", async ({ page }) => {
  12  |     await navigateAuthenticated(page, "/maintenance/pm-plans");
  13  |     expect(page.url()).not.toContain("/login");
  14  |   });
  15  | 
  16  |   test("PM plans page shows table or empty state", async ({ page }) => {
  17  |     await navigateAuthenticated(page, "/maintenance/pm-plans");
  18  |     await page.waitForTimeout(2000);
  19  |     const table = page.locator("table").first();
  20  |     const empty = page.locator(".tb-empty").first();
  21  |     expect(await table.count() > 0 || await empty.count() > 0).toBeTruthy();
  22  |   });
  23  | 
  24  |   test("API: PM plans list returns acceptable status", async ({ request }) => {
  25  |     const token = getSharedToken();
  26  |     const res = await request.get(`${API_URL}/api/v1/maintenance/pm-plans/`, {
  27  |       headers: { Authorization: `Bearer ${token}` },
  28  |     });
  29  |     expect([200, 401, 403, 429]).toContain(res.status());
  30  |   });
  31  | 
  32  |   test("PM plan detail accessible from list", async ({ page }) => {
  33  |     await navigateAuthenticated(page, "/maintenance/pm-plans");
  34  |     await page.waitForTimeout(2000);
  35  |     const firstRow = page.locator("table tbody tr").first();
  36  |     const count = await firstRow.count();
  37  |     if (count > 0) {
  38  |       await firstRow.click();
  39  |       await page.waitForTimeout(1500);
  40  |       expect(page.url()).not.toContain("/login");
  41  |     } else {
  42  |       expect(true).toBeTruthy();
  43  |     }
  44  |   });
  45  | 
  46  |   test("technicians list page loads with h1", async ({ page }) => {
  47  |     await navigateAuthenticated(page, "/operations/technicians");
  48  |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  49  |   });
  50  | 
  51  |   test("technicians page shows dispatch button", async ({ page }) => {
  52  |     await navigateAuthenticated(page, "/operations/technicians");
  53  |     const btn = page.locator("button", { hasText: "Dispatch" }).first();
  54  |     const count = await btn.count();
  55  |     if (count > 0) {
  56  |       await expect(btn).toBeVisible({ timeout: 8000 });
  57  |     } else {
  58  |       expect(true).toBeTruthy();
  59  |     }
  60  |   });
  61  | 
  62  |   test("technicians page shows cards or empty", async ({ page }) => {
  63  |     await navigateAuthenticated(page, "/operations/technicians");
  64  |     await page.waitForTimeout(2000);
  65  |     const cards = page.locator(".tb-section, .tb-grid-3 button").first();
  66  |     const empty = page.locator(".tb-empty").first();
  67  |     expect(await cards.count() > 0 || await empty.count() > 0).toBeTruthy();
  68  |   });
  69  | 
  70  |   test("API: technicians list returns 200", async ({ request }) => {
  71  |     const token = getSharedToken();
  72  |     const res = await request.get(`${API_URL}/api/v1/technicians/`, {
  73  |       headers: { Authorization: `Bearer ${token}` },
  74  |     });
  75  |     expect(res.status()).toBe(200);
  76  |   });
  77  | 
  78  |   test("technician detail accessible from list", async ({ page }) => {
  79  |     await navigateAuthenticated(page, "/operations/technicians");
  80  |     await page.waitForTimeout(2000);
  81  |     const firstCard = page.locator(".tb-grid-3 button, .tb-section button").first();
  82  |     const count = await firstCard.count();
  83  |     if (count > 0) {
  84  |       await firstCard.click();
  85  |       await page.waitForTimeout(1500);
  86  |       expect(page.url()).not.toContain("/login");
  87  |     } else {
  88  |       expect(true).toBeTruthy();
  89  |     }
  90  |   });
  91  | 
  92  |   test("service requests list page loads with h1", async ({ page }) => {
  93  |     await navigateAuthenticated(page, "/operations/service-requests");
  94  |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  95  |   });
  96  | 
  97  |   test("service requests page shows create button", async ({ page }) => {
  98  |     await navigateAuthenticated(page, "/operations/service-requests");
  99  |     const btn = page.locator("button", { hasText: "New Service Request" }).first();
  100 |     const count = await btn.count();
  101 |     if (count > 0) {
  102 |       await expect(btn).toBeVisible({ timeout: 8000 });
  103 |     } else {
  104 |       expect(true).toBeTruthy();
  105 |     }
  106 |   });
  107 | 
  108 |   test("API: service requests list returns acceptable", async ({ request }) => {
```