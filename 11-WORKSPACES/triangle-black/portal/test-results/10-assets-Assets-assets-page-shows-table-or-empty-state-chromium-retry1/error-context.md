# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 10-assets.spec.ts >> Assets >> assets page shows table or empty state
- Location: e2e/10-assets.spec.ts:38:7

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
  4   | test.describe("Assets", () => {
  5   | 
  6   |   test("assets page loads with h1", async ({ page }) => {
  7   |     await navigateAuthenticated(page, "/maintenance/assets");
  8   |     await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  9   |   });
  10  | 
  11  |   test("assets page stays off login", async ({ page }) => {
  12  |     await navigateAuthenticated(page, "/maintenance/assets");
  13  |     expect(page.url()).not.toContain("/login");
  14  |   });
  15  | 
  16  |   test("assets page shows search input", async ({ page }) => {
  17  |     await navigateAuthenticated(page, "/maintenance/assets");
  18  |     const input = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='asset']").first();
  19  |     const count = await input.count();
  20  |     if (count > 0) {
  21  |       await expect(input).toBeVisible({ timeout: 8000 });
  22  |     } else {
  23  |       expect(true).toBeTruthy();
  24  |     }
  25  |   });
  26  | 
  27  |   test("assets page shows category filter", async ({ page }) => {
  28  |     await navigateAuthenticated(page, "/maintenance/assets");
  29  |     const select = page.locator("select").first();
  30  |     const count = await select.count();
  31  |     if (count > 0) {
  32  |       await expect(select).toBeVisible({ timeout: 8000 });
  33  |     } else {
  34  |       expect(true).toBeTruthy();
  35  |     }
  36  |   });
  37  | 
  38  |   test("assets page shows table or empty state", async ({ page }) => {
  39  |     await navigateAuthenticated(page, "/maintenance/assets");
  40  |     await page.waitForTimeout(2000);
  41  |     const table = page.locator("table").first();
  42  |     const tableCount = await table.count();
  43  |     const empty = page.locator(".tb-empty, .tb-empty-icon").first();
  44  |     const emptyCount = await empty.count();
> 45  |     expect(tableCount > 0 || emptyCount > 0).toBeTruthy();
      |                                              ^ Error: expect(received).toBeTruthy()
  46  |   });
  47  | 
  48  |   test("assets page body does not contain 404", async ({ page }) => {
  49  |     await navigateAuthenticated(page, "/maintenance/assets");
  50  |     const body = await page.locator("body").innerText();
  51  |     expect(body).not.toContain("404");
  52  |     expect(body).not.toContain("Page Not Found");
  53  |   });
  54  | 
  55  |   test("API: list assets returns 200", async ({ request }) => {
  56  |     const token = getSharedToken();
  57  |     const res = await request.get(`${API_URL}/api/v1/assets/`, {
  58  |       headers: { Authorization: `Bearer ${token}` },
  59  |     });
  60  |     expect(res.status()).toBe(200);
  61  |   });
  62  | 
  63  |   test("API: assets response is a list", async ({ request }) => {
  64  |     const token = getSharedToken();
  65  |     const res = await request.get(`${API_URL}/api/v1/assets/?limit=5`, {
  66  |       headers: { Authorization: `Bearer ${token}` },
  67  |     });
  68  |     expect(res.status()).toBe(200);
  69  |     const data = await res.json();
  70  |     const isArr = Array.isArray(data);
  71  |     const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
  72  |     expect(isArr || hasItems).toBeTruthy();
  73  |   });
  74  | 
  75  |   test("API: assets filter by status Operational returns 200", async ({ request }) => {
  76  |     const token = getSharedToken();
  77  |     const res = await request.get(`${API_URL}/api/v1/assets/?status=Operational`, {
  78  |       headers: { Authorization: `Bearer ${token}` },
  79  |     });
  80  |     expect([200, 422]).toContain(res.status());
  81  |   });
  82  | 
  83  |   test("API: assets filter by category HVAC returns acceptable", async ({ request }) => {
  84  |     const token = getSharedToken();
  85  |     const res = await request.get(`${API_URL}/api/v1/assets/?category=HVAC`, {
  86  |       headers: { Authorization: `Bearer ${token}` },
  87  |     });
  88  |     expect([200, 422]).toContain(res.status());
  89  |   });
  90  | 
  91  |   test("API: asset detail returns 200 or 404 for first asset", async ({ request }) => {
  92  |     const token = getSharedToken();
  93  |     const listRes = await request.get(`${API_URL}/api/v1/assets/?limit=1`, {
  94  |       headers: { Authorization: `Bearer ${token}` },
  95  |     });
  96  |     const data = await listRes.json();
  97  |     const items = Array.isArray(data) ? data : data?.items || data?.results || [];
  98  |     if (items.length === 0) {
  99  |       expect(true).toBeTruthy();
  100 |       return;
  101 |     }
  102 |     const id = items[0].id;
  103 |     const res = await request.get(`${API_URL}/api/v1/assets/${id}`, {
  104 |       headers: { Authorization: `Bearer ${token}` },
  105 |     });
  106 |     expect([200, 404]).toContain(res.status());
  107 |   });
  108 | 
  109 |   test("journey: clicking asset row navigates to detail", async ({ page }) => {
  110 |     await navigateAuthenticated(page, "/maintenance/assets");
  111 |     await page.waitForTimeout(2000);
  112 |     const firstRow = page.locator("table tbody tr").first();
  113 |     const count = await firstRow.count();
  114 |     if (count > 0) {
  115 |       await firstRow.click();
  116 |       await page.waitForTimeout(1500);
  117 |       expect(page.url()).not.toContain("/login");
  118 |       
  119 |     } else {
  120 |       expect(true).toBeTruthy();
  121 |     }
  122 |   });
  123 | 
  124 |   test("journey: asset search filters the list", async ({ page }) => {
  125 |     await navigateAuthenticated(page, "/maintenance/assets");
  126 |     await page.waitForTimeout(1500);
  127 |     const input = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='asset']").first();
  128 |     const count = await input.count();
  129 |     if (count > 0) {
  130 |       await input.fill("HVAC");
  131 |       await page.waitForTimeout(1000);
  132 |       expect(page.url()).not.toContain("/login");
  133 |     } else {
  134 |       expect(true).toBeTruthy();
  135 |     }
  136 |   });
  137 | 
  138 | });
  139 | 
```