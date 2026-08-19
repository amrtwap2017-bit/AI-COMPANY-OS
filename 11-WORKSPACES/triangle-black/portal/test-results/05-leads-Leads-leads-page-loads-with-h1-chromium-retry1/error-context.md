# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-leads.spec.ts >> Leads >> leads page loads with h1
- Location: e2e/05-leads.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
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
  4  | test.describe("Leads", () => {
  5  |   test("leads page loads with h1", async ({ page }) => {
  6  |     await navigateAuthenticated(page, "/commercial/leads");
> 7  |     await expect(page.locator("h1").first()).toBeVisible();
     |                                              ^ Error: expect(locator).toBeVisible() failed
  8  |   });
  9  | 
  10 |   test("leads page stays off login", async ({ page }) => {
  11 |     await navigateAuthenticated(page, "/commercial/leads");
  12 |     expect(page.url()).not.toContain("/login");
  13 |   });
  14 | 
  15 |   test("API: list leads returns acceptable status", async ({ request }) => {
  16 |     const token = getSharedToken();
  17 |     const res = await request.get(`${API_URL}/api/v1/leads-portal-v2`, {
  18 |       headers: { Authorization: `Bearer ${token}` },
  19 |     });
  20 |     expect([200, 401, 403, 429]).toContain(res.status());
  21 |   });
  22 | 
  23 |   test("API: leads response is array or has items when 200", async ({ request }) => {
  24 |     const token = getSharedToken();
  25 |     const res = await request.get(`${API_URL}/api/v1/leads-portal-v2`, {
  26 |       headers: { Authorization: `Bearer ${token}` },
  27 |     });
  28 |     expect([200, 401, 403, 429]).toContain(res.status());
  29 |     if (res.status() == 200) {
  30 |       const data = await res.json();
  31 |       const isArr = Array.isArray(data);
  32 |       const hasItems = Array.isArray(data?.items) || Array.isArray(data?.results) || Array.isArray(data?.data);
  33 |       expect(isArr || hasItems).toBeTruthy();
  34 |     }
  35 |   });
  36 | 
  37 |   test("API: create lead endpoint current behavior is acceptable", async ({ request }) => {
  38 |     const token = getSharedToken();
  39 |     const res = await request.post(`${API_URL}/api/v1/leads-portal-v2`, {
  40 |       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  41 |       data: {
  42 |         company: "Playwright Test Co"
  43 |       },
  44 |     });
  45 |     expect([200, 201, 400, 401, 403, 405, 409, 422, 429]).toContain(res.status());
  46 |   });
  47 | 
  48 |   test("API: leads filter by status new returns acceptable status", async ({ request }) => {
  49 |     const token = getSharedToken();
  50 |     const res = await request.get(`${API_URL}/api/v1/leads-portal-v2?status=new`, {
  51 |       headers: { Authorization: `Bearer ${token}` },
  52 |     });
  53 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  54 |   });
  55 | 
  56 |   test("API: leads filter by status won returns acceptable status", async ({ request }) => {
  57 |     const token = getSharedToken();
  58 |     const res = await request.get(`${API_URL}/api/v1/leads-portal-v2?status=won`, {
  59 |       headers: { Authorization: `Bearer ${token}` },
  60 |     });
  61 |     expect([200, 401, 403, 422, 429]).toContain(res.status());
  62 |   });
  63 | 
  64 |   test("API: qualify action returns acceptable status", async ({ request }) => {
  65 |     const token = getSharedToken();
  66 |     const listRes = await request.get(`${API_URL}/api/v1/leads-portal-v2`, {
  67 |       headers: { Authorization: `Bearer ${token}` },
  68 |     });
  69 |     if (listRes.status() !== 200) {
  70 |       expect([401, 403, 429]).toContain(listRes.status());
  71 |       return;
  72 |     }
  73 |     const data = await listRes.json();
  74 |     const items = Array.isArray(data) ? data : data?.items || data?.results || [];
  75 |     if (items.length === 0) {
  76 |       expect(true).toBeTruthy();
  77 |       return;
  78 |     }
  79 |     const id = items[0].id;
  80 |     const res = await request.post(`${API_URL}/api/v1/actions/leads/${id}/qualify`, {
  81 |       headers: { Authorization: `Bearer ${token}` },
  82 |     });
  83 |     expect([200, 201, 400, 401, 403, 404, 422, 429]).toContain(res.status());
  84 |   });
  85 | });
  86 | 
```