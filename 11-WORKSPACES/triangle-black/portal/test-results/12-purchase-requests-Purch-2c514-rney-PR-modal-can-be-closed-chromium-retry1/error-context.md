# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 12-purchase-requests.spec.ts >> Purchase Requests >> journey: PR modal can be closed
- Location: e2e/12-purchase-requests.spec.ts:48:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: '+ New PR' }).first()

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
  18  |     await expect(btn).toBeVisible({ timeout: 10000 });
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
> 51  |     await btn.click();
      |               ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
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
  119 |     });
  120 |     expect([200, 201, 400, 401, 403, 405, 422, 429]).toContain(res.status());
  121 |   });
  122 | 
  123 |   test("API: PR filter by urgency urgent returns acceptable", async ({ request }) => {
  124 |     const token = getSharedToken();
  125 |     const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal?urgency=urgent`, {
  126 |       headers: { Authorization: `Bearer ${token}` },
  127 |     });
  128 |     expect([200, 401, 403, 404, 422, 429]).toContain(res.status());
  129 |   });
  130 | 
  131 |   test("API: PR filter by status pending returns acceptable", async ({ request }) => {
  132 |     const token = getSharedToken();
  133 |     const res = await request.get(`${API_URL}/api/v1/purchase-requests-portal?status=pending`, {
  134 |       headers: { Authorization: `Bearer ${token}` },
  135 |     });
  136 |     expect([200, 401, 403, 404, 422, 429]).toContain(res.status());
  137 |   });
  138 | });
  139 | 
```