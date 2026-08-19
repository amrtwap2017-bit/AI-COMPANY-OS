# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-purchase-requests.spec.ts >> Purchase Requests >> purchase requests page shows New PR button
- Location: e2e/12-purchase-requests.spec.ts:15:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: '+ New PR' }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: '+ New PR' }).first()

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
  4   | test.describe("Purchase Requests", () => {
  5   |   test("purchase requests page loads with h1", async ({ page }) => {
  6   |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  7   |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  8   |   });
  9   | 
  10  |   test("purchase requests page stays off login", async ({ page }) => {
  11  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  12  |     expect(page.url()).not.toContain("/login");
  13  |   });
  14  | 
  15  |   test("purchase requests page shows New PR button", async ({ page }) => {
  16  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  17  |     const btn = page.locator("button", { hasText: "+ New PR" }).first();
> 18  |     await expect(btn).toBeVisible({ timeout: 10000 });
      |                       ^ Error: expect(locator).toBeVisible() failed
  19  |   });
  20  | 
  21  |   test("journey: clicking New PR opens modal", async ({ page }) => {
  22  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  23  |     const btn = page.locator("button", { hasText: "+ New PR" }).first();
  24  |     await expect(btn).toBeVisible({ timeout: 10000 });
  25  |     await btn.click();
  26  |     await page.waitForTimeout(500);
  27  |     const modal = page.locator("text=Purchase Request").first();
  28  |     await expect(modal).toBeVisible({ timeout: 5000 });
  29  |   });
  30  | 
  31  |   test("journey: PR modal has title input", async ({ page }) => {
  32  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  33  |     const btn = page.locator("button", { hasText: "+ New PR" }).first();
  34  |     await btn.click();
  35  |     await page.waitForTimeout(500);
  36  |     const titleInput = page.locator('input[placeholder*="HVAC"], input[placeholder*="Restock"], input[placeholder*="title"]').first();
  37  |     const count = await titleInput.count();
  38  |     if (count > 0) {
  39  |       await titleInput.fill("E2E PR Test");
  40  |       const value = await titleInput.inputValue();
  41  |       expect(value).toContain("E2E PR Test");
  42  |     } else {
  43  |       const anyInput = page.locator('input[type="text"]').first();
  44  |       await expect(anyInput).toBeVisible({ timeout: 5000 });
  45  |     }
  46  |   });
  47  | 
  48  |   test("journey: PR modal can be closed", async ({ page }) => {
  49  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  50  |     const btn = page.locator("button", { hasText: "+ New PR" }).first();
  51  |     await btn.click();
  52  |     await page.waitForTimeout(500);
  53  |     const closeBtn = page.locator("button", { hasText: "×" }).first();
  54  |     const count = await closeBtn.count();
  55  |     if (count > 0) {
  56  |       await closeBtn.click();
  57  |       await page.waitForTimeout(500);
  58  |     } else {
  59  |       await page.keyboard.press("Escape");
  60  |       await page.waitForTimeout(500);
  61  |     }
  62  |     expect(page.url()).not.toContain("/login");
  63  |   });
  64  | 
  65  |   test("purchase requests page shows status filter", async ({ page }) => {
  66  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  67  |     const tabs = page.locator(".tb-tab, .tb-tabs button").first();
  68  |     const count = await tabs.count();
  69  |     if (count > 0) {
  70  |       await expect(tabs).toBeVisible({ timeout: 8000 });
  71  |     } else {
  72  |       expect(true).toBeTruthy();
  73  |     }
  74  |   });
  75  | 
  76  |   test("purchase requests page shows table or empty", async ({ page }) => {
  77  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  78  |     await page.waitForTimeout(2000);
  79  |     const table = page.locator("table").first();
  80  |     const tableCount = await table.count();
  81  |     const empty = page.locator(".tb-empty").first();
  82  |     const emptyCount = await empty.count();
  83  |     expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
  84  |   });
  85  | 
  86  |   test("purchase requests page does not show 404", async ({ page }) => {
  87  |     await navigateAuthenticated(page, "/supply-chain/purchase-requests");
  88  |     const body = await page.locator("body").innerText();
  89  |     expect(body).not.toContain("404");
  90  |   });
  91  | 
  92  |   test("API: list purchase requests returns acceptable", async ({ request }) => {
  93  |     const token = getSharedToken();
  94  |     const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal`, {
  95  |       headers: { Authorization: `Bearer ${token}` },
  96  |     });
  97  |     expect([200, 401, 403, 404, 429]).toContain(res.status());
  98  |   });
  99  | 
  100 |   test("API: purchase requests response is list when 200", async ({ request }) => {
  101 |     const token = getSharedToken();
  102 |     const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal`, {
  103 |       headers: { Authorization: `Bearer ${token}` },
  104 |     });
  105 |     expect([200, 401, 403, 404, 429]).toContain(res.status());
  106 |     if (res.status() === 200) {
  107 |       const data = await res.json();
  108 |       const isArr = Array.isArray(data);
  109 |       const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
  110 |       expect(isArr || hasItems).toBeTruthy();
  111 |     }
  112 |   });
  113 | 
  114 |   test("API: create purchase request validation path acceptable", async ({ request }) => {
  115 |     const token = getSharedToken();
  116 |     const res = await request.post(`${API_URL}/api/v1/purchase-requests-portal`, {
  117 |       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  118 |       data: {},
```