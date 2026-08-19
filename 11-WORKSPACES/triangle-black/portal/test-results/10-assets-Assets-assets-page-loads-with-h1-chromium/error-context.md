# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 10-assets.spec.ts >> Assets >> assets page loads with h1
- Location: e2e/10-assets.spec.ts:6:7

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
  4   | test.describe("Assets", () => {
  5   | 
  6   |   test("assets page loads with h1", async ({ page }) => {
  7   |     await navigateAuthenticated(page, "/maintenance/assets");
> 8   |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
      |                                              ^ Error: expect(locator).toBeVisible() failed
  9   |   });
  10  | 
  11  |   test("assets page stays off login", async ({ page }) => {
  12  |     await navigateAuthenticated(page, "/maintenance/assets");
  13  |     expect(page.url()).not.toContain("/login");
  14  |   });
  15  | 
  16  |   test("assets page shows search input", async ({ page }) => {
  17  |     await navigateAuthenticated(page, "/maintenance/assets");
  18  |     const input = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='asset']").first();
  19  |     const count = await input.count();
  20  |     if (count > 0) {
  21  |       await expect(input).toBeVisible({ timeout: 8000 });
  22  |     } else {
  23  |       expect(true).toBeTruthy();
  24  |     }
  25  |   });
  26  | 
  27  |   test("assets page shows category filter", async ({ page }) => {
  28  |     await navigateAuthenticated(page, "/maintenance/assets");
  29  |     const select = page.locator("select").first();
  30  |     const count = await select.count();
  31  |     if (count > 0) {
  32  |       await expect(select).toBeVisible({ timeout: 8000 });
  33  |     } else {
  34  |       expect(true).toBeTruthy();
  35  |     }
  36  |   });
  37  | 
  38  |   test("assets page shows table or empty state", async ({ page }) => {
  39  |     await navigateAuthenticated(page, "/maintenance/assets");
  40  |     await page.waitForTimeout(2000);
  41  |     const table = page.locator("table").first();
  42  |     const tableCount = await table.count();
  43  |     const empty = page.locator(".tb-empty, .tb-empty-icon").first();
  44  |     const emptyCount = await empty.count();
  45  |     expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
  46  |   });
  47  | 
  48  |   test("assets page body does not contain 404", async ({ page }) => {
  49  |     await navigateAuthenticated(page, "/maintenance/assets");
  50  |     const body = await page.locator("body").innerText();
  51  |     expect(body).not.toContain("404");
  52  |     expect(body).not.toContain("Page Not Found");
  53  |   });
  54  | 
  55  |   test("API: list assets returns 200", async ({ request }) => {
  56  |     const token = getSharedToken();
  57  |     const res = await request.get(`${API_URL}/api/v1/assets/`, {
  58  |       headers: { Authorization: `Bearer ${token}` },
  59  |     });
  60  |     expect(res.status()).toBe(200);
  61  |   });
  62  | 
  63  |   test("API: assets response is a list", async ({ request }) => {
  64  |     const token = getSharedToken();
  65  |     const res = await request.get(`${API_URL}/api/v1/assets/?limit=5`, {
  66  |       headers: { Authorization: `Bearer ${token}` },
  67  |     });
  68  |     expect(res.status()).toBe(200);
  69  |     const data = await res.json();
  70  |     const isArr = Array.isArray(data);
  71  |     const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
  72  |     expect(isArr || hasItems).toBeTruthy();
  73  |   });
  74  | 
  75  |   test("API: assets filter by status Operational returns 200", async ({ request }) => {
  76  |     const token = getSharedToken();
  77  |     const res = await request.get(`${API_URL}/api/v1/assets/?status=Operational`, {
  78  |       headers: { Authorization: `Bearer ${token}` },
  79  |     });
  80  |     expect([200, 422]).toContain(res.status());
  81  |   });
  82  | 
  83  |   test("API: assets filter by category HVAC returns acceptable", async ({ request }) => {
  84  |     const token = getSharedToken();
  85  |     const res = await request.get(`${API_URL}/api/v1/assets/?category=HVAC`, {
  86  |       headers: { Authorization: `Bearer ${token}` },
  87  |     });
  88  |     expect([200, 422]).toContain(res.status());
  89  |   });
  90  | 
  91  |   test("API: asset detail returns 200 or 404 for first asset", async ({ request }) => {
  92  |     const token = getSharedToken();
  93  |     const listRes = await request.get(`${API_URL}/api/v1/assets/?limit=1`, {
  94  |       headers: { Authorization: `Bearer ${token}` },
  95  |     });
  96  |     const data = await listRes.json();
  97  |     const items = Array.isArray(data) ? data : data?.items || data?.results || [];
  98  |     if (items.length === 0) {
  99  |       expect(true).toBeTruthy();
  100 |       return;
  101 |     }
  102 |     const id = items[0].id;
  103 |     const res = await request.get(`${API_URL}/api/v1/assets/${id}`, {
  104 |       headers: { Authorization: `Bearer ${token}` },
  105 |     });
  106 |     expect([200, 404]).toContain(res.status());
  107 |   });
  108 | 
```