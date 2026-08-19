# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 13-detail-pages.spec.ts >> Detail Pages >> technicians page shows cards or empty
- Location: e2e/13-detail-pages.spec.ts:62:7

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
  4   | test.describe("Detail Pages", () => {
  5   | 
  6   |   test("PM plans list page loads with h1", async ({ page }) => {
  7   |     await navigateAuthenticated(page, "/maintenance/pm-plans");
  8   |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  9   |   });
  10  | 
  11  |   test("PM plans page stays off login", async ({ page }) => {
  12  |     await navigateAuthenticated(page, "/maintenance/pm-plans");
  13  |     expect(page.url()).not.toContain("/login");
  14  |   });
  15  | 
  16  |   test("PM plans page shows table or empty state", async ({ page }) => {
  17  |     await navigateAuthenticated(page, "/maintenance/pm-plans");
  18  |     await page.waitForTimeout(2000);
  19  |     const table = page.locator("table").first();
  20  |     const empty = page.locator(".tb-empty").first();
  21  |     expect(await table.count() > 0 || await empty.count() > 0).toBeTruthy();
  22  |   });
  23  | 
  24  |   test("API: PM plans list returns acceptable status", async ({ request }) => {
  25  |     const token = getSharedToken();
  26  |     const res = await request.get(`${API_URL}/api/v1/maintenance/pm-plans/`, {
  27  |       headers: { Authorization: `Bearer ${token}` },
  28  |     });
  29  |     expect([200, 401, 403, 429]).toContain(res.status());
  30  |   });
  31  | 
  32  |   test("PM plan detail accessible from list", async ({ page }) => {
  33  |     await navigateAuthenticated(page, "/maintenance/pm-plans");
  34  |     await page.waitForTimeout(2000);
  35  |     const firstRow = page.locator("table tbody tr").first();
  36  |     const count = await firstRow.count();
  37  |     if (count > 0) {
  38  |       await firstRow.click();
  39  |       await page.waitForTimeout(1500);
  40  |       expect(page.url()).not.toContain("/login");
  41  |     } else {
  42  |       expect(true).toBeTruthy();
  43  |     }
  44  |   });
  45  | 
  46  |   test("technicians list page loads with h1", async ({ page }) => {
  47  |     await navigateAuthenticated(page, "/operations/technicians");
  48  |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  49  |   });
  50  | 
  51  |   test("technicians page shows dispatch button", async ({ page }) => {
  52  |     await navigateAuthenticated(page, "/operations/technicians");
  53  |     const btn = page.locator("button", { hasText: "Dispatch" }).first();
  54  |     const count = await btn.count();
  55  |     if (count > 0) {
  56  |       await expect(btn).toBeVisible({ timeout: 8000 });
  57  |     } else {
  58  |       expect(true).toBeTruthy();
  59  |     }
  60  |   });
  61  | 
  62  |   test("technicians page shows cards or empty", async ({ page }) => {
  63  |     await navigateAuthenticated(page, "/operations/technicians");
  64  |     await page.waitForTimeout(2000);
  65  |     const cards = page.locator(".tb-section, .tb-grid-3 button").first();
  66  |     const empty = page.locator(".tb-empty").first();
> 67  |     expect(await cards.count() > 0 || await empty.count() > 0).toBeTruthy();
      |                                                                ^ Error: expect(received).toBeTruthy()
  68  |   });
  69  | 
  70  |   test("API: technicians list returns 200", async ({ request }) => {
  71  |     const token = getSharedToken();
  72  |     const res = await request.get(`${API_URL}/api/v1/technicians/`, {
  73  |       headers: { Authorization: `Bearer ${token}` },
  74  |     });
  75  |     expect(res.status()).toBe(200);
  76  |   });
  77  | 
  78  |   test("technician detail accessible from list", async ({ page }) => {
  79  |     await navigateAuthenticated(page, "/operations/technicians");
  80  |     await page.waitForTimeout(2000);
  81  |     const firstCard = page.locator(".tb-grid-3 button, .tb-section button").first();
  82  |     const count = await firstCard.count();
  83  |     if (count > 0) {
  84  |       await firstCard.click();
  85  |       await page.waitForTimeout(1500);
  86  |       expect(page.url()).not.toContain("/login");
  87  |     } else {
  88  |       expect(true).toBeTruthy();
  89  |     }
  90  |   });
  91  | 
  92  |   test("service requests list page loads with h1", async ({ page }) => {
  93  |     await navigateAuthenticated(page, "/operations/service-requests");
  94  |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  95  |   });
  96  | 
  97  |   test("service requests page shows create button", async ({ page }) => {
  98  |     await navigateAuthenticated(page, "/operations/service-requests");
  99  |     const btn = page.locator("button", { hasText: "New Service Request" }).first();
  100 |     const count = await btn.count();
  101 |     if (count > 0) {
  102 |       await expect(btn).toBeVisible({ timeout: 8000 });
  103 |     } else {
  104 |       expect(true).toBeTruthy();
  105 |     }
  106 |   });
  107 | 
  108 |   test("API: service requests list returns acceptable", async ({ request }) => {
  109 |     const token = getSharedToken();
  110 |     const res = await request.get(`${API_URL}/api/v1/service-requests/`, {
  111 |       headers: { Authorization: `Bearer ${token}` },
  112 |     });
  113 |     expect([200, 401, 403, 429]).toContain(res.status());
  114 |   });
  115 | 
  116 |   test("work orders detail page loads for first work order", async ({ page }) => {
  117 |     const token = getSharedToken();
  118 |     const res = await page.request.get(`${API_URL}/api/v1/work-orders/?limit=1`, {
  119 |       headers: { Authorization: `Bearer ${token}` },
  120 |     });
  121 |     const data = await res.json();
  122 |     const items = Array.isArray(data) ? data : data?.results || data?.items || [];
  123 |     if (items.length === 0) {
  124 |       expect(true).toBeTruthy();
  125 |       return;
  126 |     }
  127 |     const id = items[0].id;
  128 |     await navigateAuthenticated(page, `/operations/work-orders/${id}`);
  129 |     await page.waitForTimeout(2000);
  130 |     expect(page.url()).not.toContain("/login");
  131 |   });
  132 | 
  133 |   test("asset detail page loads for first asset", async ({ page }) => {
  134 |     const token = getSharedToken();
  135 |     const res = await page.request.get(`${API_URL}/api/v1/assets/?limit=1`, {
  136 |       headers: { Authorization: `Bearer ${token}` },
  137 |     });
  138 |     const data = await res.json();
  139 |     const items = Array.isArray(data) ? data : data?.results || data?.items || [];
  140 |     if (items.length === 0) {
  141 |       expect(true).toBeTruthy();
  142 |       return;
  143 |     }
  144 |     const id = items[0].id;
  145 |     await navigateAuthenticated(page, `/maintenance/assets/${id}`);
  146 |     await page.waitForTimeout(2000);
  147 |     expect(page.url()).not.toContain("/login");
  148 |     const h1 = page.locator("h1").first();
  149 |     await expect(h1).toBeVisible({ timeout: 10000 });
  150 |   });
  151 | 
  152 | });
  153 | 
```