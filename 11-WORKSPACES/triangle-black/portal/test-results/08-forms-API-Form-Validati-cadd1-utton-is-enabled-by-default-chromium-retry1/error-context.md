# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-forms.spec.ts >> API Form Validation >> login form submit button is enabled by default
- Location: e2e/08-forms.spec.ts:77:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[type="submit"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button[type="submit"]').first()

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
  2  | import { API_URL, getSharedToken } from "./helpers/auth";
  3  | 
  4  | test.describe("API Form Validation", () => {
  5  |   test("API: create work order missing title returns acceptable current status", async ({ request }) => {
  6  |     const token = getSharedToken();
  7  |     const res = await request.post(`${API_URL}/api/v1/work-orders/`, {
  8  |       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  9  |       data: { priority: "high" },
  10 |     });
  11 |     expect([400, 401, 403, 422, 429]).toContain(res.status());
  12 |   });
  13 | 
  14 |   test("API: create service request missing required fields returns acceptable current status", async ({ request }) => {
  15 |     const token = getSharedToken();
  16 |     const res = await request.post(`${API_URL}/api/v1/service-requests/`, {
  17 |       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  18 |       data: {},
  19 |     });
  20 |     expect([200, 201, 400, 401, 403, 422, 429]).toContain(res.status());
  21 |   });
  22 | 
  23 |   test("API: create purchase request validation path acceptable", async ({ request }) => {
  24 |     const token = getSharedToken();
  25 |     const res = await request.post(`${API_URL}/api/v1/purchase-requests-portal`, {
  26 |       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  27 |       data: {},
  28 |     });
  29 |     expect([200, 201, 400, 401, 403, 405, 422, 429]).toContain(res.status());
  30 |   });
  31 | 
  32 |   test("API: create lead validation path acceptable", async ({ request }) => {
  33 |     const token = getSharedToken();
  34 |     const res = await request.post(`${API_URL}/api/v1/leads-portal-v2`, {
  35 |       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  36 |       data: {},
  37 |     });
  38 |     expect([200, 201, 400, 401, 403, 405, 409, 422, 429]).toContain(res.status());
  39 |   });
  40 | 
  41 |   test("API: invalid status on work order returns acceptable status", async ({ request }) => {
  42 |     const token = getSharedToken();
  43 |     const res = await request.get(`${API_URL}/api/v1/work-orders/?status=notavalidstatus`, {
  44 |       headers: { Authorization: `Bearer ${token}` },
  45 |     });
  46 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  47 |   });
  48 | 
  49 |   test("API: pagination limit=1 returns max 1 item when 200", async ({ request }) => {
  50 |     const token = getSharedToken();
  51 |     const res = await request.get(`${API_URL}/api/v1/work-orders/?limit=1`, {
  52 |       headers: { Authorization: `Bearer ${token}` },
  53 |     });
  54 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  55 |     if (res.status() === 200) {
  56 |       const data = await res.json();
  57 |       const items = Array.isArray(data) ? data : data?.results || data?.items || [];
  58 |       expect(items.length).toBeLessThanOrEqual(1);
  59 |     }
  60 |   });
  61 | 
  62 |   test("API: pagination limit=0 returns acceptable status", async ({ request }) => {
  63 |     const token = getSharedToken();
  64 |     const res = await request.get(`${API_URL}/api/v1/work-orders/?limit=0`, {
  65 |       headers: { Authorization: `Bearer ${token}` },
  66 |     });
  67 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  68 |   });
  69 | 
  70 |   test("login form has email and password inputs", async ({ page }) => {
  71 |     await page.goto("http://localhost:3000/login");
  72 |     await page.waitForLoadState("networkidle");
  73 |     await expect(page.locator('input[type="email"]').first()).toBeVisible();
  74 |     await expect(page.locator('input[type="password"]').first()).toBeVisible();
  75 |   });
  76 | 
  77 |   test("login form submit button is enabled by default", async ({ page }) => {
  78 |     await page.goto("http://localhost:3000/login");
  79 |     await page.waitForLoadState("networkidle");
  80 |     const btn = page.locator('button[type="submit"]').first();
> 81 |     await expect(btn).toBeVisible();
     |                       ^ Error: expect(locator).toBeVisible() failed
  82 |     await expect(btn).not.toBeDisabled();
  83 |   });
  84 | });
  85 | 
```