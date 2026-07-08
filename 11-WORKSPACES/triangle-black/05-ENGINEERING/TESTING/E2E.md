# End-to-End Testing

| Field | Value |
|---|---|
| Document ID | 19-Testing-04 |
| Document Purpose | Define E2E testing standards with Playwright |
| Version | 1.0 |
| Status | Approved |

## Framework

[Playwright](https://playwright.dev/) for browser-based E2E tests.

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Run:

```bash
npx playwright test        # headless
npx playwright test --ui   # UI mode
npx playwright show-report # view report
```

## Critical User Journeys

### 1. User Registration and Login

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;

  await page.goto('/register');
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', 'Str0ng!Pass');
  await page.fill('[data-testid="confirm-password"]', 'Str0ng!Pass');
  await page.click('[data-testid="register-button"]');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', 'Str0ng!Pass');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('[data-testid="welcome-message"]')).toContainText(email);
});
```

### 2. Hotel Search and Booking

```typescript
// e2e/booking.spec.ts
test('user can search and book a hotel', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'existing@example.com');
  await page.fill('[data-testid="password"]', 'Str0ng!Pass');
  await page.click('[data-testid="login-button"]');

  // Search
  await page.goto('/search');
  await page.fill('[data-testid="destination"]', 'Riyadh');
  await page.fill('[data-testid="check-in"]', '2026-08-01');
  await page.fill('[data-testid="check-out"]', '2026-08-05');
  await page.click('[data-testid="search-button"]');

  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

  // Select hotel
  await page.click('[data-testid="hotel-card"] >> nth=0');
  await page.click('[data-testid="book-now"]');

  // Confirm booking
  await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
  await expect(page.locator('[data-testid="booking-id"]')).not.toBeEmpty();
});
```

## What to Test (E2E)

| Journey | Priority | Frequency |
|---|---|---|
| User registration | Critical | Every deploy |
| User login | Critical | Every deploy |
| Logout / session expiry | High | Every deploy |
| Hotel search | Critical | Every deploy |
| Hotel booking flow | Critical | Every release |
| Payment (sandbox) | Critical | Every release |
| Profile update | Medium | Weekly |
| Password reset | High | Every release |
| 404 / error pages | Low | Smoke test |

## CI Integration

E2E tests run in CI on deploy to staging and production:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  deployment_status:

jobs:
  e2e:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          E2E_BASE_URL: ${{ github.event.deployment_status.environment_url }}
```

## Test Data

- E2E tests use dedicated test accounts in a staging environment
- Test accounts are seeded before test run and cleaned after
- Payments use sandbox/test credit card numbers
- No real customer data is used in E2E tests

## Best Practices

1. Use `data-testid` attributes for selectors (never CSS classes or text)
2. Keep tests independent — no shared state between tests
3. Mock external services (payment gateway, email) at the network level with Playwright route interception
4. Set explicit timeouts for navigation and waiting
5. Take screenshots on failure for debugging
6. Run E2E in CI but don't block PR merge on E2E (block on staging deploy only)

## Cross-References

- [Strategy.md](Strategy.md) — Testing strategy overview
- [17-Engineering/CI-CD.md](../17-Engineering/CI-CD.md) — CI pipeline
- [18-Deployment/Staging.md](../18-Deployment/Staging.md) — Staging E2E execution
