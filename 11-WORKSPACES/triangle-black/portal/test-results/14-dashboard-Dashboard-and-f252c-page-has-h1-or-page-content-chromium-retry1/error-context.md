# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 14-dashboard.spec.ts >> Dashboard and Workspace >> workspace page has h1 or page content
- Location: e2e/14-dashboard.spec.ts:11:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 50
Received:   0
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
> 15 |     expect(body.length).toBeGreaterThan(50);
     |                         ^ Error: expect(received).toBeGreaterThan(expected)
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
  72 |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
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