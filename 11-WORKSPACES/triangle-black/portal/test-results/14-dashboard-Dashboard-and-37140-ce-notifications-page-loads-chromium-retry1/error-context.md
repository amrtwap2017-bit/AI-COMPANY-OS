# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 14-dashboard.spec.ts >> Dashboard and Workspace >> notifications page loads
- Location: e2e/14-dashboard.spec.ts:69:7

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
  1  | import { test, expect } from "@playwright/test";
  2  | import { navigateAuthenticated, API_URL, getSharedToken } from "./helpers/auth";
  3  | 
  4  | test.describe("Dashboard and Workspace", () => {
  5  | 
  6  |   test("workspace page loads after auth", async ({ page }) => {
  7  |     await navigateAuthenticated(page, "/workspace");
  8  |     expect(page.url()).not.toContain("/login");
  9  |   });
  10 | 
  11 |   test("workspace page has h1 or page content", async ({ page }) => {
  12 |     await navigateAuthenticated(page, "/workspace");
  13 |     await page.waitForTimeout(2000);
  14 |     const body = await page.locator("body").innerText();
  15 |     expect(body.length).toBeGreaterThan(50);
  16 |     expect(body).not.toContain("404");
  17 |   });
  18 | 
  19 |   test("executive dashboard page loads", async ({ page }) => {
  20 |     await navigateAuthenticated(page, "/executive/dashboard");
  21 |     expect(page.url()).not.toContain("/login");
  22 |     await page.waitForTimeout(2000);
  23 |     const body = await page.locator("body").innerText();
  24 |     expect(body).not.toContain("404");
  25 |   });
  26 | 
  27 |   test("analytics hub page loads", async ({ page }) => {
  28 |     await navigateAuthenticated(page, "/analytics");
  29 |     expect(page.url()).not.toContain("/login");
  30 |   });
  31 | 
  32 |   test("API: dashboard summary returns 200", async ({ request }) => {
  33 |     const token = getSharedToken();
  34 |     const res = await request.get(`${API_URL}/api/v1/dashboard/summary`, {
  35 |       headers: { Authorization: `Bearer ${token}` },
  36 |     });
  37 |     expect([200, 401, 403, 404, 429]).toContain(res.status());
  38 |   });
  39 | 
  40 |   test("API: cache status visible in dashboard", async ({ request }) => {
  41 |     const res = await request.get(`${API_URL}/api/v1/cache/status`);
  42 |     expect(res.status()).toBe(200);
  43 |     const data = await res.json();
  44 |     expect(data.backend).toMatch(/redis|memory/i);
  45 |   });
  46 | 
  47 |   test("API: health live endpoint responds", async ({ request }) => {
  48 |     const res = await request.get(`${API_URL}/api/v1/health/live`);
  49 |     expect(res.status()).toBe(200);
  50 |     const data = await res.json();
  51 |     expect(data.status).toBe("live");
  52 |   });
  53 | 
  54 |   test("API: health ready endpoint responds with DB status", async ({ request }) => {
  55 |     const res = await request.get(`${API_URL}/api/v1/health/ready`);
  56 |     expect(res.status()).toBe(200);
  57 |     const data = await res.json();
  58 |     expect(data.status).toBe("ready");
  59 |   });
  60 | 
  61 |   test("my-day endpoint returns data", async ({ request }) => {
  62 |     const token = getSharedToken();
  63 |     const res = await request.get(`${API_URL}/api/v1/workspace/my-day`, {
  64 |       headers: { Authorization: `Bearer ${token}` },
  65 |     });
  66 |     expect([200, 401, 403, 404, 429]).toContain(res.status());
  67 |   });
  68 | 
  69 |   test("notifications page loads", async ({ page }) => {
  70 |     await navigateAuthenticated(page, "/notifications");
  71 |     expect(page.url()).not.toContain("/login");
> 72 |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
     |                                              ^ Error: expect(locator).toBeVisible() failed
  73 |   });
  74 | 
  75 |   test("inbox page loads", async ({ page }) => {
  76 |     await navigateAuthenticated(page, "/inbox");
  77 |     expect(page.url()).not.toContain("/login");
  78 |   });
  79 | 
  80 |   test("exceptions page loads", async ({ page }) => {
  81 |     await navigateAuthenticated(page, "/executive/exceptions");
  82 |     expect(page.url()).not.toContain("/login");
  83 |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  84 |   });
  85 | 
  86 | });
  87 | 
```