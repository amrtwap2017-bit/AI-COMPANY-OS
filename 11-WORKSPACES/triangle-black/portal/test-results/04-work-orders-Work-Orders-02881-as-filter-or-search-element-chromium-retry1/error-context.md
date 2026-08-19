# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-work-orders.spec.ts >> Work Orders >> work orders page has filter or search element
- Location: e2e/04-work-orders.spec.ts:15:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input, select').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('input, select').first()

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
  2  | import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";
  3  | 
  4  | test.describe("Work Orders", () => {
  5  |   test("work orders page shows h1", async ({ page }) => {
  6  |     await navigateAuthenticated(page, "/operations/work-orders");
  7  |     await expect(page.locator("h1").first()).toBeVisible();
  8  |   });
  9  | 
  10 |   test("work orders page URL stays off login", async ({ page }) => {
  11 |     await navigateAuthenticated(page, "/operations/work-orders");
  12 |     expect(page.url()).not.toContain("/login");
  13 |   });
  14 | 
  15 |   test("work orders page has filter or search element", async ({ page }) => {
  16 |     await navigateAuthenticated(page, "/operations/work-orders");
> 17 |     await expect(page.locator("input, select").first()).toBeVisible({ timeout: 10000 });
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  18 |   });
  19 | 
  20 |   test("API: list work orders returns 200", async ({ request }) => {
  21 |     const token = getSharedToken();
  22 |     const res = await request.get(`${API_URL}/api/v1/work-orders/`, {
  23 |       headers: { Authorization: `Bearer ${token}` },
  24 |     });
  25 |     expect(res.status()).toBe(200);
  26 |   });
  27 | 
  28 |   test("API: work orders response has expected structure", async ({ request }) => {
  29 |     const token = getSharedToken();
  30 |     const res = await request.get(`${API_URL}/api/v1/work-orders/?limit=5`, {
  31 |       headers: { Authorization: `Bearer ${token}` },
  32 |     });
  33 |     const data = await res.json();
  34 |     const items = Array.isArray(data) ? data : data?.results || data?.items || data?.data || [];
  35 |     expect(Array.isArray(items)).toBeTruthy();
  36 |   });
  37 | 
  38 |   test("API: filter by status open returns acceptable status", async ({ request }) => {
  39 |     const token = getSharedToken();
  40 |     const res = await request.get(`${API_URL}/api/v1/work-orders/?status=open`, {
  41 |       headers: { Authorization: `Bearer ${token}` },
  42 |     });
  43 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  44 |   });
  45 | 
  46 |   test("API: filter by priority critical returns acceptable status", async ({ request }) => {
  47 |     const token = getSharedToken();
  48 |     const res = await request.get(`${API_URL}/api/v1/work-orders/?priority=critical`, {
  49 |       headers: { Authorization: `Bearer ${token}` },
  50 |     });
  51 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  52 |   });
  53 | 
  54 |   test("API: invalid work order payload is rejected or blocked", async ({ request }) => {
  55 |     const token = getSharedToken();
  56 |     const res = await request.post(`${API_URL}/api/v1/work-orders/`, {
  57 |       headers: {
  58 |         Authorization: `Bearer ${token}`,
  59 |         "Content-Type": "application/json",
  60 |       },
  61 |       data: { priority: "low" },
  62 |     });
  63 |     expect([400, 401, 403, 422, 429]).toContain(res.status());
  64 |   });
  65 | 
  66 |   test("API: invalid work order status filter returns acceptable status", async ({ request }) => {
  67 |     const token = getSharedToken();
  68 |     const res = await request.get(`${API_URL}/api/v1/work-orders/?status=notavalidstatus`, {
  69 |       headers: { Authorization: `Bearer ${token}` },
  70 |     });
  71 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  72 |   });
  73 | });
  74 | 
```