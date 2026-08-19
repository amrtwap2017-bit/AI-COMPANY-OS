# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-navigation.spec.ts >> Navigation >> page title is present on work orders
- Location: e2e/06-navigation.spec.ts:38:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: ""
```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=f1e3]:
      - generic [ref=f1e4]:
        - navigation [ref=f1e6]:
          - button [disabled] [ref=f1e7]:
            - img "previous" [ref=f1e8]
          - generic [ref=f1e10]:
            - generic [ref=f1e11]: 1/
            - text: "1"
          - button [disabled] [ref=f1e12]:
            - img "next" [ref=f1e13]
        - link "Next.js 16.2.10 (stale) Turbopack" [ref=f1e16] [cursor=pointer]:
          - /url: https://nextjs.org/docs/messages/version-staleness
          - generic "There is a newer version (16.3.1) available, upgrade recommended!" [ref=f1e19]: Next.js 16.2.10 (stale)
          - generic [ref=f1e20]: Turbopack
      - dialog "Build Error" [ref=f1e22]:
        - generic [ref=f1e25]:
          - generic [ref=f1e26]:
            - generic [ref=f1e27]:
              - generic [ref=f1e28]: Build Error
              - generic [ref=f1e30]:
                - button "Copy Error Info" [ref=f1e31] [cursor=pointer]
                - button "No related documentation found" [disabled] [ref=f1e34]
                - button "Attach Node.js inspector" [ref=f1e37] [cursor=pointer]
            - generic [ref=f1e46]: Expected ',', got ':'
          - generic [ref=f1e49]:
            - generic [ref=f1e51]:
              - generic [ref=f1e56]: ./components/ui/Textarea.tsx (13:158)
              - button "Open in editor" [ref=f1e57] [cursor=pointer]
            - generic [ref=f1e62]:
              - generic [ref=f1e63]: Expected ',', got ':'
              - generic [ref=f1e64]: 11 |
              - generic [ref=f1e65]: ...
              - generic [ref=f1e66]: 12 |
              - generic [ref=f1e67]: ...
              - text: ">"
              - generic [ref=f1e68]: 13 |
              - generic [ref=f1e69]: "..., error: any, maxCount: any, className ="
              - text: "\"\""
              - generic [ref=f1e70]: ": any, id: any, value: any, ...props }: any,..."
              - generic [ref=f1e71]: "|"
              - text: ^
              - generic [ref=f1e72]: 14 |
              - generic [ref=f1e73]: ...
              - generic [ref=f1e74]: 15 |
              - generic [ref=f1e75]: ...
              - generic [ref=f1e76]: 16 |
              - generic [ref=f1e77]: "... Parsing ecmascript source code failed Import traces: Server Component: ./components/ui/Textarea.tsx ./components/ui/index.ts ./app/(app)/(enterprise)/maintenance/loading.tsx Client Component Browser: ./components/ui/Textarea.tsx [Client Component Browser] ./components/ui/index.ts [Client Component Browser] ./components/ui/EntityShell.tsx [Client Component Browser] ./components/ui/EntityShell.tsx [Server Component] ./components/ui/index.ts [Server Component] ./app/(app)/(enterprise)/maintenance/loading.tsx [Server Component] Client Component SSR: ./components/ui/Textarea.tsx [Client Component SSR] ./components/ui/index.ts [Client Component SSR] ./components/ui/EntityShell.tsx [Client Component SSR] ./components/ui/EntityShell.tsx [Server Component] ./components/ui/index.ts [Server Component] ./app/(app)/(enterprise)/maintenance/loading.tsx [Server Component]"
        - generic [ref=f1e78]: "1"
        - generic [ref=f1e79]: "2"
    - generic [ref=f1e84] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=f1e85]
      - button "Open issues overlay" [ref=f1e90]:
        - generic [ref=f1e91]:
          - generic [ref=f1e92]: "0"
          - generic [ref=f1e93]: "1"
        - generic [ref=f1e94]: Issue
  - alert [ref=f1e95]
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
  20 |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
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
> 41 |     expect(title).toBeTruthy();
     |                   ^ Error: expect(received).toBeTruthy()
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