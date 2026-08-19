# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 11-contracts.spec.ts >> Contracts >> contracts page shows table or empty state
- Location: e2e/11-contracts.spec.ts:42:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
  4   | test.describe("Contracts", () => {
  5   | 
  6   |   test("contracts page loads with h1", async ({ page }) => {
  7   |     await navigateAuthenticated(page, "/commercial/contracts");
  8   |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  9   |   });
  10  | 
  11  |   test("contracts page stays off login", async ({ page }) => {
  12  |     await navigateAuthenticated(page, "/commercial/contracts");
  13  |     expect(page.url()).not.toContain("/login");
  14  |   });
  15  | 
  16  |   test("contracts page shows New Contract button", async ({ page }) => {
  17  |     await navigateAuthenticated(page, "/commercial/contracts");
  18  |     const btn = page.locator("button", { hasText: "+ New Contract" }).first();
  19  |     await expect(btn).toBeVisible({ timeout: 10000 });
  20  |   });
  21  | 
  22  |   test("journey: New Contract button navigates to leads pipeline", async ({ page }) => {
  23  |     await navigateAuthenticated(page, "/commercial/contracts");
  24  |     const btn = page.locator("button", { hasText: "+ New Contract" }).first();
  25  |     await btn.click();
  26  |     await page.waitForTimeout(2000);
  27  |     expect(page.url()).not.toContain("/login");
  28  |     expect(page.url()).toMatch(/leads|commercial/i);
  29  |   });
  30  | 
  31  |   test("contracts page shows status filter tabs", async ({ page }) => {
  32  |     await navigateAuthenticated(page, "/commercial/contracts");
  33  |     const tabs = page.locator(".tb-tab, .tb-tabs button").first();
  34  |     const count = await tabs.count();
  35  |     if (count > 0) {
  36  |       await expect(tabs).toBeVisible({ timeout: 8000 });
  37  |     } else {
  38  |       expect(true).toBeTruthy();
  39  |     }
  40  |   });
  41  | 
  42  |   test("contracts page shows table or empty state", async ({ page }) => {
  43  |     await navigateAuthenticated(page, "/commercial/contracts");
  44  |     await page.waitForTimeout(2000);
  45  |     const table = page.locator("table").first();
  46  |     const tableCount = await table.count();
  47  |     const empty = page.locator(".tb-empty").first();
  48  |     const emptyCount = await empty.count();
> 49  |     expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
      |                                              ^ Error: expect(received).toBeTruthy()
  50  |   });
  51  | 
  52  |   test("contracts page does not show 404", async ({ page }) => {
  53  |     await navigateAuthenticated(page, "/commercial/contracts");
  54  |     const body = await page.locator("body").innerText();
  55  |     const hasNext404 = body.includes("This page could not be found") || body.includes("404 | Page Not Found");
  56  |     expect(hasNext404).toBe(false);
  57  |   });
  58  | 
  59  |   test("API: list contracts returns 200", async ({ request }) => {
  60  |     const token = getSharedToken();
  61  |     const res = await request.get(`${API_URL}/api/v1/contracts/`, {
  62  |       headers: { Authorization: `Bearer ${token}` },
  63  |     });
  64  |     expect(res.status()).toBe(200);
  65  |   });
  66  | 
  67  |   test("API: contracts response is a list", async ({ request }) => {
  68  |     const token = getSharedToken();
  69  |     const res = await request.get(`${API_URL}/api/v1/contracts/?limit=5`, {
  70  |       headers: { Authorization: `Bearer ${token}` },
  71  |     });
  72  |     expect(res.status()).toBe(200);
  73  |     const data = await res.json();
  74  |     const isArr = Array.isArray(data);
  75  |     const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
  76  |     expect(isArr || hasItems).toBeTruthy();
  77  |   });
  78  | 
  79  |   test("API: contracts filter by status active returns acceptable", async ({ request }) => {
  80  |     const token = getSharedToken();
  81  |     const res = await request.get(`${API_URL}/api/v1/contracts/?status=active`, {
  82  |       headers: { Authorization: `Bearer ${token}` },
  83  |     });
  84  |     expect([200, 422]).toContain(res.status());
  85  |   });
  86  | 
  87  |   test("API: contracts filter by status expired returns acceptable", async ({ request }) => {
  88  |     const token = getSharedToken();
  89  |     const res = await request.get(`${API_URL}/api/v1/contracts/?status=expired`, {
  90  |       headers: { Authorization: `Bearer ${token}` },
  91  |     });
  92  |     expect([200, 422]).toContain(res.status());
  93  |   });
  94  | 
  95  |   test("API: contract detail returns 200 or 404 for first contract", async ({ request }) => {
  96  |     const token = getSharedToken();
  97  |     const listRes = await request.get(`${API_URL}/api/v1/contracts/?limit=1`, {
  98  |       headers: { Authorization: `Bearer ${token}` },
  99  |     });
  100 |     const data = await listRes.json();
  101 |     const items = Array.isArray(data) ? data : data?.items || data?.results || [];
  102 |     if (items.length === 0) {
  103 |       expect(true).toBeTruthy();
  104 |       return;
  105 |     }
  106 |     const id = items[0].id;
  107 |     const res = await request.get(`${API_URL}/api/v1/contracts/${id}`, {
  108 |       headers: { Authorization: `Bearer ${token}` },
  109 |     });
  110 |     expect([200, 404]).toContain(res.status());
  111 |   });
  112 | 
  113 |   test("journey: clicking contract row navigates to detail", async ({ page }) => {
  114 |     await navigateAuthenticated(page, "/commercial/contracts");
  115 |     await page.waitForTimeout(2000);
  116 |     const firstRow = page.locator("table tbody tr").first();
  117 |     const count = await firstRow.count();
  118 |     if (count > 0) {
  119 |       await firstRow.click();
  120 |       await page.waitForTimeout(1500);
  121 |       expect(page.url()).not.toContain("/login");
  122 |       expect(page.url()).toMatch(/contracts\/.+/);
  123 |     } else {
  124 |       expect(true).toBeTruthy();
  125 |     }
  126 |   });
  127 | 
  128 |   test("journey: contracts search filters list", async ({ page }) => {
  129 |     await navigateAuthenticated(page, "/commercial/contracts");
  130 |     await page.waitForTimeout(1500);
  131 |     const input = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='contract']").first();
  132 |     const count = await input.count();
  133 |     if (count > 0) {
  134 |       await input.fill("test_search_12345");
  135 |       await page.waitForTimeout(1000);
  136 |       expect(page.url()).not.toContain("/login");
  137 |     } else {
  138 |       expect(true).toBeTruthy();
  139 |     }
  140 |   });
  141 | 
  142 | });
  143 | 
```