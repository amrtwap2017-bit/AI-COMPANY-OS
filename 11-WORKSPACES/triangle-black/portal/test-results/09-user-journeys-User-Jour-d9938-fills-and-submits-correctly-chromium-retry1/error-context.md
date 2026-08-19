# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-user-journeys.spec.ts >> User Journeys — UI >> journey: login form fills and submits correctly
- Location: e2e/09-user-journeys.spec.ts:16:7

# Error details

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]').first()

```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - navigation [ref=e6]:
          - button [disabled] [ref=e7]:
            - img "previous" [ref=e8]
          - generic [ref=e10]:
            - generic [ref=e11]: 1/
            - text: "1"
          - button [disabled] [ref=e12]:
            - img "next" [ref=e13]
        - link "Next.js 16.2.10 (stale) Turbopack" [ref=e16] [cursor=pointer]:
          - /url: https://nextjs.org/docs/messages/version-staleness
          - generic "There is a newer version (16.3.1) available, upgrade recommended!" [ref=e19]: Next.js 16.2.10 (stale)
          - generic [ref=e20]: Turbopack
      - dialog "Build Error" [ref=e22]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: Build Error
              - generic [ref=e30]:
                - button "Copy Error Info" [ref=e31] [cursor=pointer]
                - button "No related documentation found" [disabled] [ref=e34]
                - button "Attach Node.js inspector" [ref=e37] [cursor=pointer]
            - generic [ref=e46]: Expected ',', got ':'
          - generic [ref=e49]:
            - generic [ref=e51]:
              - generic [ref=e56]: ./components/ui/Textarea.tsx (13:158)
              - button "Open in editor" [ref=e57] [cursor=pointer]
            - generic [ref=e62]:
              - generic [ref=e63]: Expected ',', got ':'
              - generic [ref=e64]: 11 |
              - generic [ref=e65]: ...
              - generic [ref=e66]: 12 |
              - generic [ref=e67]: ...
              - text: ">"
              - generic [ref=e68]: 13 |
              - generic [ref=e69]: "..., error: any, maxCount: any, className ="
              - text: "\"\""
              - generic [ref=e70]: ": any, id: any, value: any, ...props }: any,..."
              - generic [ref=e71]: "|"
              - text: ^
              - generic [ref=e72]: 14 |
              - generic [ref=e73]: ...
              - generic [ref=e74]: 15 |
              - generic [ref=e75]: ...
              - generic [ref=e76]: 16 |
              - generic [ref=e77]: "... Parsing ecmascript source code failed Import traces: Server Component: ./components/ui/Textarea.tsx ./components/ui/index.ts ./app/(app)/(enterprise)/maintenance/loading.tsx Client Component Browser: ./components/ui/Textarea.tsx [Client Component Browser] ./components/ui/index.ts [Client Component Browser] ./components/ui/EntityShell.tsx [Client Component Browser] ./components/ui/EntityShell.tsx [Server Component] ./components/ui/index.ts [Server Component] ./app/(app)/(enterprise)/maintenance/loading.tsx [Server Component] Client Component SSR: ./components/ui/Textarea.tsx [Client Component SSR] ./components/ui/index.ts [Client Component SSR] ./components/ui/EntityShell.tsx [Client Component SSR] ./components/ui/EntityShell.tsx [Server Component] ./components/ui/index.ts [Server Component] ./app/(app)/(enterprise)/maintenance/loading.tsx [Server Component]"
        - generic [ref=e78]: "1"
        - generic [ref=e79]: "2"
    - generic [ref=e84] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e85]
      - button "Open issues overlay" [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e92]: "0"
          - generic [ref=e93]: "1"
        - generic [ref=e94]: Issue
  - alert [ref=e95]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { navigateAuthenticated, BASE_URL, injectAuth } from "./helpers/auth";
  3   | 
  4   | test.describe("User Journeys — UI", () => {
  5   | 
  6   |   test("journey: login page renders all form elements", async ({ page }) => {
  7   |     await page.goto(`${BASE_URL}/login`);
  8   |     await page.waitForLoadState("networkidle");
  9   |     await expect(page.locator('input[type="email"]').first()).toBeVisible();
  10  |     await expect(page.locator('input[type="password"]').first()).toBeVisible();
  11  |     await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  12  |     const title = await page.title();
  13  |     expect(title).toBeTruthy();
  14  |   });
  15  | 
  16  |   test("journey: login form fills and submits correctly", async ({ page }) => {
  17  |     await page.goto(`${BASE_URL}/login`);
  18  |     await page.waitForLoadState("networkidle");
> 19  |     await page.locator('input[type="email"]').first().fill("amr@triangleblack.com");
      |                                                       ^ TimeoutError: locator.fill: Timeout 15000ms exceeded.
  20  |     await page.locator('input[type="password"]').first().fill("admin123");
  21  |     await page.locator('button[type="submit"]').first().click();
  22  |     await page.waitForTimeout(3000);
  23  |     expect(page.url()).not.toContain("/login");
  24  |   });
  25  | 
  26  |   test("journey: work orders page shows New Work Order button", async ({ page }) => {
  27  |     await navigateAuthenticated(page, "/operations/work-orders");
  28  |     const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
  29  |     await expect(btn).toBeVisible({ timeout: 10000 });
  30  |   });
  31  | 
  32  |   test("journey: clicking New Work Order opens modal", async ({ page }) => {
  33  |     await navigateAuthenticated(page, "/operations/work-orders");
  34  |     const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
  35  |     await expect(btn).toBeVisible({ timeout: 10000 });
  36  |     await btn.click();
  37  |     await page.waitForTimeout(500);
  38  |     const modal = page.locator("text=Work Order").first();
  39  |     await expect(modal).toBeVisible({ timeout: 5000 });
  40  |   });
  41  | 
  42  |   test("journey: work order modal has title input", async ({ page }) => {
  43  |     await navigateAuthenticated(page, "/operations/work-orders");
  44  |     const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
  45  |     await btn.click();
  46  |     await page.waitForTimeout(500);
  47  |     const titleInput = page.locator('input[placeholder*="HVAC"], input[placeholder*="title"], input[placeholder*="work"]').first();
  48  |     const count = await titleInput.count();
  49  |     if (count > 0) {
  50  |       await expect(titleInput).toBeVisible({ timeout: 5000 });
  51  |       await titleInput.fill("E2E UI Test Work Order");
  52  |       const value = await titleInput.inputValue();
  53  |       expect(value).toContain("E2E UI Test Work Order");
  54  |     } else {
  55  |       const anyInput = page.locator('input[type="text"]').first();
  56  |       await expect(anyInput).toBeVisible({ timeout: 5000 });
  57  |     }
  58  |   });
  59  | 
  60  |   test("journey: work order modal can be closed", async ({ page }) => {
  61  |     await navigateAuthenticated(page, "/operations/work-orders");
  62  |     const btn = page.locator("button", { hasText: "+ New Work Order" }).first();
  63  |     await btn.click();
  64  |     await page.waitForTimeout(500);
  65  |     const closeBtn = page.locator("button", { hasText: "×" }).first();
  66  |     const count = await closeBtn.count();
  67  |     if (count > 0) {
  68  |       await closeBtn.click();
  69  |       await page.waitForTimeout(500);
  70  |       const modal = page.locator("text=Work Order Created").first();
  71  |       expect(await modal.count()).toBe(0);
  72  |     } else {
  73  |       await page.keyboard.press("Escape");
  74  |       await page.waitForTimeout(500);
  75  |     }
  76  |     expect(page.url()).not.toContain("/login");
  77  |   });
  78  | 
  79  |   test("journey: leads page shows New Lead button", async ({ page }) => {
  80  |     await navigateAuthenticated(page, "/commercial/leads");
  81  |     const btn = page.locator("button", { hasText: "+ New Lead" }).first();
  82  |     await expect(btn).toBeVisible({ timeout: 10000 });
  83  |   });
  84  | 
  85  |   test("journey: clicking New Lead opens modal", async ({ page }) => {
  86  |     await navigateAuthenticated(page, "/commercial/leads");
  87  |     const btn = page.locator("button", { hasText: "+ New Lead" }).first();
  88  |     await expect(btn).toBeVisible({ timeout: 10000 });
  89  |     await btn.click();
  90  |     await page.waitForTimeout(500);
  91  |     const modal = page.locator("text=Lead").first();
  92  |     await expect(modal).toBeVisible({ timeout: 5000 });
  93  |   });
  94  | 
  95  |   test("journey: lead modal has name input and can be filled", async ({ page }) => {
  96  |     await navigateAuthenticated(page, "/commercial/leads");
  97  |     const btn = page.locator("button", { hasText: "+ New Lead" }).first();
  98  |     await btn.click();
  99  |     await page.waitForTimeout(500);
  100 |     const nameInput = page.locator('input[placeholder*="Ahmed"], input[placeholder*="name"], input[placeholder*="Name"]').first();
  101 |     const count = await nameInput.count();
  102 |     if (count > 0) {
  103 |       await nameInput.fill("E2E UI Test Lead");
  104 |       const value = await nameInput.inputValue();
  105 |       expect(value).toContain("E2E UI Test Lead");
  106 |     } else {
  107 |       const anyInput = page.locator('input[type="text"]').first();
  108 |       await expect(anyInput).toBeVisible({ timeout: 5000 });
  109 |     }
  110 |   });
  111 | 
  112 |   test("journey: work orders table shows data columns", async ({ page }) => {
  113 |     await navigateAuthenticated(page, "/operations/work-orders");
  114 |     await page.waitForTimeout(2000);
  115 |     const table = page.locator("table").first();
  116 |     const count = await table.count();
  117 |     if (count > 0) {
  118 |       await expect(table).toBeVisible();
  119 |       const headers = await page.locator("thead th").allInnerTexts();
```