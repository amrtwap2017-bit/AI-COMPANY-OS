# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 11-contracts.spec.ts >> Contracts >> contracts page shows New Contract button
- Location: e2e/11-contracts.spec.ts:16:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: '+ New Contract' }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: '+ New Contract' }).first()

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
  4   | test.describe("Contracts", () => {
  5   | 
  6   |   test("contracts page loads with h1", async ({ page }) => {
  7   |     await navigateAuthenticated(page, "/commercial/contracts");
  8   |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  9   |   });
  10  | 
  11  |   test("contracts page stays off login", async ({ page }) => {
  12  |     await navigateAuthenticated(page, "/commercial/contracts");
  13  |     expect(page.url()).not.toContain("/login");
  14  |   });
  15  | 
  16  |   test("contracts page shows New Contract button", async ({ page }) => {
  17  |     await navigateAuthenticated(page, "/commercial/contracts");
  18  |     const btn = page.locator("button", { hasText: "+ New Contract" }).first();
> 19  |     await expect(btn).toBeVisible({ timeout: 10000 });
      |                       ^ Error: expect(locator).toBeVisible() failed
  20  |   });
  21  | 
  22  |   test("journey: New Contract button navigates to leads pipeline", async ({ page }) => {
  23  |     await navigateAuthenticated(page, "/commercial/contracts");
  24  |     const btn = page.locator("button", { hasText: "+ New Contract" }).first();
  25  |     await btn.click();
  26  |     await page.waitForTimeout(2000);
  27  |     expect(page.url()).not.toContain("/login");
  28  |     expect(page.url()).toMatch(/leads|commercial/i);
  29  |   });
  30  | 
  31  |   test("contracts page shows status filter tabs", async ({ page }) => {
  32  |     await navigateAuthenticated(page, "/commercial/contracts");
  33  |     const tabs = page.locator(".tb-tab, .tb-tabs button").first();
  34  |     const count = await tabs.count();
  35  |     if (count > 0) {
  36  |       await expect(tabs).toBeVisible({ timeout: 8000 });
  37  |     } else {
  38  |       expect(true).toBeTruthy();
  39  |     }
  40  |   });
  41  | 
  42  |   test("contracts page shows table or empty state", async ({ page }) => {
  43  |     await navigateAuthenticated(page, "/commercial/contracts");
  44  |     await page.waitForTimeout(2000);
  45  |     const table = page.locator("table").first();
  46  |     const tableCount = await table.count();
  47  |     const empty = page.locator(".tb-empty").first();
  48  |     const emptyCount = await empty.count();
  49  |     expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
  50  |   });
  51  | 
  52  |   test("contracts page does not show 404", async ({ page }) => {
  53  |     await navigateAuthenticated(page, "/commercial/contracts");
  54  |     const body = await page.locator("body").innerText();
  55  |     const hasNext404 = body.includes("This page could not be found") || body.includes("404 | Page Not Found");
  56  |     expect(hasNext404).toBe(false);
  57  |   });
  58  | 
  59  |   test("API: list contracts returns 200", async ({ request }) => {
  60  |     const token = getSharedToken();
  61  |     const res = await request.get(`${API_URL}/api/v1/contracts/`, {
  62  |       headers: { Authorization: `Bearer ${token}` },
  63  |     });
  64  |     expect(res.status()).toBe(200);
  65  |   });
  66  | 
  67  |   test("API: contracts response is a list", async ({ request }) => {
  68  |     const token = getSharedToken();
  69  |     const res = await request.get(`${API_URL}/api/v1/contracts/?limit=5`, {
  70  |       headers: { Authorization: `Bearer ${token}` },
  71  |     });
  72  |     expect(res.status()).toBe(200);
  73  |     const data = await res.json();
  74  |     const isArr = Array.isArray(data);
  75  |     const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
  76  |     expect(isArr || hasItems).toBeTruthy();
  77  |   });
  78  | 
  79  |   test("API: contracts filter by status active returns acceptable", async ({ request }) => {
  80  |     const token = getSharedToken();
  81  |     const res = await request.get(`${API_URL}/api/v1/contracts/?status=active`, {
  82  |       headers: { Authorization: `Bearer ${token}` },
  83  |     });
  84  |     expect([200, 422]).toContain(res.status());
  85  |   });
  86  | 
  87  |   test("API: contracts filter by status expired returns acceptable", async ({ request }) => {
  88  |     const token = getSharedToken();
  89  |     const res = await request.get(`${API_URL}/api/v1/contracts/?status=expired`, {
  90  |       headers: { Authorization: `Bearer ${token}` },
  91  |     });
  92  |     expect([200, 422]).toContain(res.status());
  93  |   });
  94  | 
  95  |   test("API: contract detail returns 200 or 404 for first contract", async ({ request }) => {
  96  |     const token = getSharedToken();
  97  |     const listRes = await request.get(`${API_URL}/api/v1/contracts/?limit=1`, {
  98  |       headers: { Authorization: `Bearer ${token}` },
  99  |     });
  100 |     const data = await listRes.json();
  101 |     const items = Array.isArray(data) ? data : data?.items || data?.results || [];
  102 |     if (items.length === 0) {
  103 |       expect(true).toBeTruthy();
  104 |       return;
  105 |     }
  106 |     const id = items[0].id;
  107 |     const res = await request.get(`${API_URL}/api/v1/contracts/${id}`, {
  108 |       headers: { Authorization: `Bearer ${token}` },
  109 |     });
  110 |     expect([200, 404]).toContain(res.status());
  111 |   });
  112 | 
  113 |   test("journey: clicking contract row navigates to detail", async ({ page }) => {
  114 |     await navigateAuthenticated(page, "/commercial/contracts");
  115 |     await page.waitForTimeout(2000);
  116 |     const firstRow = page.locator("table tbody tr").first();
  117 |     const count = await firstRow.count();
  118 |     if (count > 0) {
  119 |       await firstRow.click();
```