# Frontend / E2E Testing Strategy

> Testing strategy for the Next.js 15 frontend application.

## Overview

Three layers of frontend testing: component tests (Vitest + Testing Library), visual regression tests (Percy/Chromatic), and E2E tests (Playwright). Each layer targets a different risk profile.

## Test Pyramid (Frontend)

```
        ╱╲
       ╱ E2E ╲               10% — Critical business journeys
      ╱────────╲
     ╱  Visual  ╲            20% — UI regression, responsive, theme
    ╱──────────────╲
   ╱   Component    ╲        70% — Units, hooks, utils, integration
  ╱────────────────────╲
```

## Layer 1: Component Tests (Vitest + Testing Library)

### Scope
- Individual React components
- Custom hooks
- Utility functions
- State management logic

### Tools

| Tool | Purpose |
|------|---------|
| Vitest | Test runner (matches Vite build tool) |
| @testing-library/react | Component rendering + interaction |
| @testing-library/jest-dom | DOM-specific matchers |
| @testing-library/user-event | Realistic user interactions |
| msw (Mock Service Worker) | API mocking at network level |
| vi.mock | Module-level mocking (Vitest) |

### Location

`apps/web/src/**/*.test.tsx` (co-located with components)

### Coverage Target

| Metric | Target |
|--------|--------|
| Branch coverage | 80%+ |
| Function coverage | 85%+ |
| Line coverage | 80%+ |
| Critical paths | 100% (no uncovered critical paths) |

### Test Patterns

```typescript
// Component test example
describe('LeadScoreGauge')
  it('renders score value correctly')
  it('applies correct color for score range')
  it('shows empty state when score is 0')

// Hook test example
describe('usePipelineForecast')
  it('returns weighted forecast by stage')
  it('recalculates when opportunities change')

// Utility test example
describe('formatCurrency')
  it('formats EGP with correct symbol and decimals')
```

## Layer 2: Visual Regression Tests (Percy / Chromatic)

### Scope
- All unique page layouts
- All reusable component states (loading, empty, error, edge cases)
- Responsive breakpoints (mobile, tablet, desktop)
- Light/dark theme variants

### Tools

| Tool | Purpose | V1 Choice |
|------|---------|-----------|
| Percy | Visual diff, CI integration | ✅ (free tier: 5,000 snapshots/mo) |
| Chromatic | Storybook-native visual testing | Fallback if Storybook adopted |

### Implementation

| Strategy | Details |
|----------|---------|
| Snapshot frequency | On every PR with visual changes |
| Threshold | 0% pixel diff tolerance (manual review) |
| Baseline | Main branch snapshots |
| Review process | PR comment with visual diff → approve/reject in Percy UI |

### Screens to Snapshot (V1 Critical Paths)

| Page | States | Breakpoints |
|------|--------|-------------|
| Lead List | Empty, populated, filtered, loading, error | Desktop, tablet, mobile |
| Lead Detail | Loaded, loading, not found | Desktop, mobile |
| Pipeline Kanban | Empty, populated, drag-and-drop | Desktop, tablet |
| Quotation Builder | Empty line items, populated, margin warning | Desktop |
| Quotation PDF | Preview mode | Desktop |
| Contract Detail | Active, terminated, expired | Desktop, mobile |
| Timesheet Grid | Empty week, populated, submitted, approved | Desktop, mobile |
| Dashboard | All widgets loaded, loading state | Desktop, tablet |

## Layer 3: E2E Tests (Playwright)

### Scope
- Critical business journeys (end-to-end workflows)
- Cross-cutting concerns (auth, RBAC, multi-tenant)
- Form submissions and data persistence
- Navigation and routing

### Tools

| Tool | Purpose |
|------|---------|
| Playwright | E2E test runner (official Microsoft, excellent DX) |
| @playwright/test | Test framework |
| Playwright Trace Viewer | Debug failed tests |
| Playwright Reporter | HTML, JSON, JUnit |

### Location

`apps/web/e2e/` — feature-based file organization:
```
e2e/
├── auth/
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   └── password-reset.spec.ts
├── crm/
│   ├── lead-capture.spec.ts
│   ├── pipeline-management.spec.ts
│   └── quotation-approval.spec.ts
├── hr/
│   ├── leave-request.spec.ts
│   ├── timesheet-submission.spec.ts
│   └── employee-onboarding.spec.ts
├── financial/
│   ├── invoice-approval.spec.ts
│   └── payment-reconciliation.spec.ts
├── setup.ts
└── global-setup.ts
```

### Critical Business Journeys (V1)

| Journey | Domain | Priority |
|---------|--------|----------|
| Login → Pipeline view → Create opportunity | CRM | P0 |
| Capture lead → Convert to opportunity → Create quotation | CRM | P0 |
| Approve quotation → Send to client → Activate contract | CRM | P0 |
| Create project → Add milestones → Assign team | Project | P0 |
| Submit purchase request → Approve → Convert to PO | Procurement | P0 |
| Create invoice → 3-way match → Approve payment | Finance | P0 |
| Submit leave request → Approve → Verify balance update | HR | P0 |
| Submit timesheet → Approve → Verify cost allocation | HR | P0 |
| Check in → Perform work → Check out | HR | P1 |
| Create inventory item → Transfer between warehouses | Inventory | P1 |
| Schedule maintenance → Dispatch → Complete | Maintenance | P1 |

### Test Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e.json' }],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    // Additional browsers in CI
    // { name: 'firefox', use: { browserName: 'firefox' } },
    // { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### Test Helpers (setup.ts)

| Helper | Purpose |
|--------|---------|
| `authenticateAs(role)` | Login, set cookies, return page |
| `createTestData(entity, data)` | Seed test data via API |
| `cleanupTestData(entity, id)` | Clean up after test |
| `waitForTableLoad()` | Wait for DataTable to render |
| `fillFormField(label, value)` | Label-based form filling |
| `verifyToast(message)` | Assert toast notification appears |
| `getByRoleAndName(role, name)` | Accessible query helper |

### Auth Strategy for E2E Tests

```
global-setup.ts
    │
    ├── Create test tenant (if not exists)
    ├── Create test users (admin, manager, employee)
    ├── Seed minimal reference data
    └── Store auth tokens in environment
```

### CI Integration

```yaml
# .github/workflows/e2e.yml
e2e-tests:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16
    redis:
      image: redis:7
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm run db:migrate
    - run: npm run db:seed:e2e
    - run: npx playwright install chromium
    - run: npm run dev:e2e &
    - run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

## Test Selection Strategy

| Change Type | Required Tests |
|-------------|---------------|
| CSS/style change | Visual regression + E2E smoke |
| Component logic change | Component tests + E2E affected path |
| API contract change | E2E affected journeys |
| New feature | Component + E2E full journey |
| Bug fix | Component test reproducing bug + E2E |
| Dependency update | Full E2E smoke suite |
| UI library upgrade | Visual regression full suite |

## CI Test Pipeline Order

```
1. Lint (ESLint)                    — < 30s
2. Type check (tsc)                 — < 1min
3. Unit tests (Vitest)              — < 2min
4. Component tests (Vitest)         — < 3min
5. Visual regression (Percy)        — < 5min
6. E2E smoke (3 critical paths)     — < 5min
7. E2E full suite (all journeys)    — < 15min (nightly only)
```

## Monitoring & Reporting

| Artifact | Format | Retention |
|----------|--------|-----------|
| Test results | JUnit XML | 90 days |
| E2E traces | Playwright trace | 30 days |
| E2E screenshots | PNG | 30 days |
| E2E videos | WebM | 7 days |
| Visual diffs | Percy | Indefinite |
| Coverage reports | HTML, LCOV | 90 days |
