# Testing

| Field | Value |
|---|---|
| Document ID | 17-Engineering-05 |
| Document Purpose | Define testing philosophy, levels, and coverage targets |
| Version | 1.0 |
| Status | Approved |

## Philosophy

- Tests are first-class code — same review rigor, same coding standards
- Write tests before or alongside implementation (TDD preferred for business logic)
- A feature is not complete until its tests pass and coverage targets are met
- Tests must be deterministic — no flaky tests allowed
- CI blocks merge on test failure

## Testing Pyramid

```
       /\
      /E2E\
     /------\
    /Integr. \
   /----------\
  /   Unit     \
 /--------------\
```

| Level | Scope | Speed | Count | Coverage Target |
|---|---|---|---|---|
| Unit | Single function/class | ms | Many | 80%+ line, 70%+ branch |
| Integration | API endpoint, database, module | s | Some | 60%+ line |
| E2E | Full user journey | min | Few | Critical paths only |

## What to Test at Each Level

### Unit Tests
- Service methods with mocked dependencies
- Helper/utility functions
- Domain logic, validation rules
- DTO transformations
- Error handling paths

**Not unit tested**: Controllers (tested via integration), database queries, config loading.

### Integration Tests
- API endpoints (request -> response, including auth, validation)
- Database operations (Prisma queries against test DB)
- Middleware, guards, interceptors, pipes
- Module wiring (NestJS `Test.createTestingModule`)

**Not integration tested**: External service calls (mocked), UI rendering.

### E2E Tests
- Critical user journeys: registration, login, booking flow, payment
- Cross-cutting concerns: auth, error pages, redirects
- Smoke tests on deployment

**Not E2E tested**: Edge cases, admin flows (covered by lower levels).

## Coverage Targets

| Metric | Frontend (Next.js) | Backend (NestJS) |
|---|---|---|
| Line coverage | 70% | 80% |
| Branch coverage | 60% | 70% |
| Function coverage | 80% | 85% |

Coverage thresholds are enforced in CI. PRs that reduce coverage must add tests.

## Test File Structure

Test files mirror source files:

```
src/modules/user/
  user.service.ts
  tests/
    user.service.spec.ts
    user.controller.spec.ts
    dto/
      create-user.dto.spec.ts
```

## Tools

| Level | Tool | Config |
|---|---|---|
| Unit | Jest | `jest.config.ts` |
| Integration | Jest + Supertest | `jest.integration.config.ts` |
| E2E | Playwright | `playwright.config.ts` |
| Coverage | Jest `--coverage` | >80% threshold |
| Mutation (future) | Stryker | Targeted at domain logic |

## Cross-References

- [19-Testing/Strategy.md](../19-Testing/Strategy.md) — Detailed testing strategy
- [19-Testing/Unit.md](../19-Testing/Unit.md) — Unit testing specifics
- [19-Testing/Integration.md](../19-Testing/Integration.md) — Integration testing specifics
- [19-Testing/E2E.md](../19-Testing/E2E.md) — E2E testing specifics
- [CI-CD.md](CI-CD.md) — CI test execution
