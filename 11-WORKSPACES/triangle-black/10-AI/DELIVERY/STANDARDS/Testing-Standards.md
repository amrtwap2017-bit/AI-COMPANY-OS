# Testing Standards

## Test Pyramid

```
       ┌──────────┐
       │   E2E    │  < 10% of tests
       │  (few)   │  Critical user journeys
      ┌┴──────────┴┐
      │ Integration│  ~20% of tests
      │ (some)     │  API endpoints, repository, middleware
     ┌┴────────────┴┐
     │   Unit       │  ~70% of tests
     │  (many)      │  Domain entities, use cases, value objects, utilities
     └──────────────┘
```

## Test Runner and Tools

- **Test Runner**: Vitest (or Jest as fallback).
- **Assertion Library**: Built-in `expect` from Vitest.
- **Mocking**: `vitest.mock` or `ts-mockito` for Type-safe mocks.
- **Component Testing**: React Testing Library.
- **E2E Testing**: Playwright.
- **Coverage**: `vitest --coverage` with `v8` or `istanbul`.

## Naming Conventions

### File Naming
```
src/domains/orders/domain/entities/order.entity.ts
src/domains/orders/domain/entities/order.entity.test.ts  ← test file
```

### Test Block Naming
```typescript
describe('OrderEntity', () => {
  describe('calculateTotal', () => {
    it('should return the sum of all item prices multiplied by quantities', () => { ... });
    it('should return 0 when items array is empty', () => { ... });
    it('should throw OrderValueError when any item has a negative price', () => { ... });
  });
});
```

- `describe('ModuleName')` — title-case module name.
- `it('should <expected behavior> when <condition>')` — behavioral description.

## Coverage Targets

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Lines | >= 80% | CI gate failure below threshold |
| Branches | >= 75% | CI gate failure below threshold |
| Functions | >= 80% | CI gate failure below threshold |
| Statements | >= 80% | CI gate failure below threshold |
| New code | >= 90% | PR review gate |

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
      include: ['src/domains/**'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    },
  },
});
```

## Mocking Strategy

### What to Mock
- External HTTP calls (third-party APIs).
- Database access (repository layer in unit tests).
- File system operations.
- Message queues and event buses.
- Time-dependent functions (`Date.now`, `setTimeout`).

### What NOT to Mock
- Value objects and entities (test the real implementation).
- Utility functions that have no side effects.
- Type definitions and DTOs.

### Mocking Pattern

```typescript
// ✅ Correct — mock interface, test through use case
const mockRepo = {
  save: vi.fn(),
  findById: vi.fn(),
} satisfies IOrderRepository;

const useCase = new CreateOrderUseCase(mockRepo);

// ❌ Wrong — mock the use case itself
vi.mock('./create-order.usecase'); // don't mock what you're testing
```

## Test Data Factories

Use `@/test/factories/` for generating test data. Never hard-code test data in tests.

```typescript
// factories/order.factory.ts
import { faker } from '@faker-js/faker';

export function buildOrder(overrides: Partial<OrderProps> = {}): OrderProps {
  return {
    id: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    status: OrderStatus.PENDING,
    items: [buildOrderItem()],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildOrderItem(overrides: Partial<OrderItemProps> = {}): OrderItemProps {
  return {
    productId: faker.string.uuid(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    price: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
    ...overrides,
  };
}
```

```typescript
// ✅ Correct — use factories
it('should create order with items', () => {
  const order = OrderEntity.create(buildOrder({ status: OrderStatus.PENDING }));
  expect(order.status).toBe(OrderStatus.PENDING);
});

// ❌ Wrong — hard-coded data
it('should create order', () => {
  const order = OrderEntity.create({
    id: 'abc123',
    tenantId: 'def456',
    status: OrderStatus.PENDING,
    items: [{ productId: 'ghi789', quantity: 2, price: 49.99 }],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
});
```

## Test Structure

### Unit Tests
- Test one class/function per `describe` block.
- Mock all external dependencies.
- Test public API only (no testing private methods directly).
- Cover: happy path, error path, edge cases, boundary conditions.

### Integration Tests
- Test repository implementations against a test database.
- Test API endpoints with supertest (`request(app).post('/api/...')`).
- Use a separate test database or in-memory SQLite.
- Clean database state between test runs.

```typescript
describe('OrderRepository (integration)', () => {
  beforeEach(async () => {
    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
    ]);
  });

  it('should persist and retrieve an order', async () => {
    const repo = new OrderRepository(prisma);
    const order = buildOrder();
    await repo.save(OrderEntity.create(order));

    const retrieved = await repo.findById(order.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(order.id);
  });
});
```

### E2E Tests
- Test critical user journeys only (login, order flow, payment).
- Use `page` object model for reusability.
- Run in CI against the deployed staging environment.
- Retry flaky tests up to 2 times.

```typescript
test('user can complete order flow', async ({ page }) => {
  await page.goto('/orders');
  await page.click('text=Create Order');
  await page.fill('[name="productId"]', 'prod-123');
  await page.fill('[name="quantity"]', '2');
  await page.click('text=Submit');
  await expect(page.locator('text=Order created')).toBeVisible();
});
```

## CI Integration

- Tests run on every push to any branch.
- Unit + integration tests run in parallel (fast feedback).
- E2E tests run on staging deployment after merge to main.
- Coverage report is generated and uploaded to the CI artifacts.
- Build is blocked if coverage thresholds are not met.

```yaml
# .github/workflows/test.yml (example)
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci
      - run: npm run test:unit -- --coverage

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - run: npm ci
      - run: npm run test:integration

  e2e:
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    steps:
      - run: npm ci
      - run: npm run test:e2e
```

## Test Quality Checklist

- [ ] Tests follow naming conventions (`describe`/`it` pattern).
- [ ] Test data uses factories, not hard-coded values.
- [ ] Mocks are properly scoped to individual tests (`beforeEach` setup).
- [ ] No skipped tests without documented reason.
- [ ] No `any` types in test files.
- [ ] No `console.log` in test files.
- [ ] Each test tests exactly one behavior.
- [ ] No test depends on another test's state (isolation).
