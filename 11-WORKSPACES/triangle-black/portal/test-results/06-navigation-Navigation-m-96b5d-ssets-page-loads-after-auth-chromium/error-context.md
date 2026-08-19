# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-navigation.spec.ts >> Navigation >> maintenance assets page loads after auth
- Location: e2e/06-navigation.spec.ts:17:7

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
  2  | import { navigateAuthenticated } from "./helpers/auth";
  3  | 
  4  | test.describe("Navigation", () => {
  5  | 
  6  |   test("workspace page loads after auth", async ({ page }) => {
  7  |     await navigateAuthenticated(page, "/workspace");
  8  |     expect(page.url()).not.toContain("/login");
  9  |   });
  10 | 
  11 |   test("financial page loads after auth", async ({ page }) => {
  12 |     await navigateAuthenticated(page, "/financial");
  13 |     expect(page.url()).not.toContain("/login");
  14 |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  15 |   });
  16 | 
  17 |   test("maintenance assets page loads after auth", async ({ page }) => {
  18 |     await navigateAuthenticated(page, "/maintenance/assets");
  19 |     expect(page.url()).not.toContain("/login");
> 20 |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
     |                                              ^ Error: expect(locator).toBeVisible() failed
  21 |   });
  22 | 
  23 |   test("supply chain page loads after auth", async ({ page }) => {
  24 |     await navigateAuthenticated(page, "/supply-chain");
  25 |     expect(page.url()).not.toContain("/login");
  26 |   });
  27 | 
  28 |   test("executive page loads after auth", async ({ page }) => {
  29 |     await navigateAuthenticated(page, "/executive");
  30 |     expect(page.url()).not.toContain("/login");
  31 |   });
  32 | 
  33 |   test("analytics page loads after auth", async ({ page }) => {
  34 |     await navigateAuthenticated(page, "/analytics");
  35 |     expect(page.url()).not.toContain("/login");
  36 |   });
  37 | 
  38 |   test("page title is present on work orders", async ({ page }) => {
  39 |     await navigateAuthenticated(page, "/operations/work-orders");
  40 |     const title = await page.title();
  41 |     expect(title).toBeTruthy();
  42 |     expect(title.length).toBeGreaterThan(0);
  43 |   });
  44 | 
  45 |   test("page title is present on leads", async ({ page }) => {
  46 |     await navigateAuthenticated(page, "/commercial/leads");
  47 |     const title = await page.title();
  48 |     expect(title).toBeTruthy();
  49 |   });
  50 | 
  51 |   test("no console errors on work orders page", async ({ page }) => {
  52 |     const errors: string[] = [];
  53 |     page.on("pageerror", (err) => errors.push(err.message));
  54 |     await navigateAuthenticated(page, "/operations/work-orders");
  55 |     await page.waitForTimeout(2000);
  56 |     const criticalErrors = errors.filter(e =>
  57 |       !e.includes("hydration") &&
  58 |       !e.includes("Warning") &&
  59 |       !e.includes("ResizeObserver")
  60 |     );
  61 |     expect(criticalErrors.length).toBe(0);
  62 |   });
  63 | 
  64 |   test("page does not show 404 text on assets", async ({ page }) => {
  65 |     await navigateAuthenticated(page, "/maintenance/assets");
  66 |     const body = await page.locator("body").innerText();
  67 |     expect(body).not.toContain("404");
  68 |     expect(body).not.toContain("Page Not Found");
  69 |   });
  70 | 
  71 | });
  72 | 
```