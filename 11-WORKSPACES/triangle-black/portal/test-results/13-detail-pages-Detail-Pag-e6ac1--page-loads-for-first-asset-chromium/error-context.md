# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 13-detail-pages.spec.ts >> Detail Pages >> asset detail page loads for first asset
- Location: e2e/13-detail-pages.spec.ts:133:7

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
  67  |     expect(await cards.count() > 0 || await empty.count() > 0).toBeTruthy();
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
> 149 |     await expect(h1).toBeVisible({ timeout: 10000 });
      |                      ^ Error: expect(locator).toBeVisible() failed
  150 |   });
  151 | 
  152 | });
  153 | 
```