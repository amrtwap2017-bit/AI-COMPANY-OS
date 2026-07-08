# Phase 04 — Testing Strategy

> Testing approach across all layers of the application.

## Test Pyramid

```
      ╱╲
     ╱ E2E ╲          < 5% — Critical business workflows
    ╱────────╲
   ╱Integration╲     20% — API endpoints, service integration
  ╱──────────────╲
 ╱   Unit Tests    ╲  75% — Services, controllers, components, utilities
╱────────────────────╲
```

## Testing Standards

| Test Type | Tool | Coverage Target | Location |
|-----------|------|----------------|----------|
| Unit (services) | Jest | 80%+ | `apps/api/src/**/*.spec.ts` |
| Unit (components) | Vitest | 80%+ | `apps/web/src/**/*.test.tsx` |
| Integration (API) | Jest + Supertest | 70%+ | `apps/api/test/` |
| E2E (workflows) | Playwright | Key paths | `apps/web/e2e/` |
| Migration | Prisma | Schema validation | per migration |

## Testing Patterns

| Pattern | Description |
|---------|-------------|
| Service mocking | Prisma service mocked for unit tests |
| Factory functions | Test data factories for consistent fixtures |
| Database transactions | Integration tests wrapped in rollback transaction |
| Auth helpers | JWT token generation for authenticated test requests |
| Snapshot testing | For UI components (with regular review) |

## Test Naming

```
describe('LeadService')
  describe('create')
    it('should create a lead with valid data')
    it('should reject lead without required fields')
    it('should assign display ID on creation')
```

See `13-TESTING/` for detailed testing strategy and test examples.
