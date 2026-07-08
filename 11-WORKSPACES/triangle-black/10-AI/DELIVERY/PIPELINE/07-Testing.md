# Stage 07: Testing

## Purpose

Review all test artifacts, enforce coverage thresholds, run integration and end-to-end test suites, and produce a comprehensive test report.

## Agent Role

**QA Director AI** — Responsible for test quality, coverage enforcement, and test execution management.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Backend Implementation | Backend artifact with status `APPROVED` |
| Frontend Implementation | Frontend artifact with status `APPROVED` |
| Test Files Present | Unit tests, integration tests, and any E2E test files exist |
| Test Environment Available | CI or local environment configured for test execution |

## Process

### Step 1: Review Test Coverage
- Run coverage analysis: `jest --coverage` or equivalent.
- Check coverage against thresholds:
  - Lines: >= 80%
  - Branches: >= 75%
  - Functions: >= 80%
  - Statements: >= 80%
- Identify uncovered lines and branches.
- Flag any uncovered critical paths (error handling, edge cases, security logic).

### Step 2: Enforce Test Quality Standards
- Verify test naming follows `describe('Module')` / `it('should ...')` pattern.
- Check that tests use factories/fixtures rather than hard-coded data.
- Ensure mocks are properly scoped and restored after each test.
- Verify there are no skipped tests (`it.skip`, `describe.skip`) without documented reasons.
- Ensure no test uses `any` type (TypeScript strict mode in tests).

### Step 3: Run Integration Tests
- Execute integration tests against a test database.
- Verify all repository tests pass with actual Prisma queries.
- Check API endpoint integration tests pass end-to-end (request → DB → response).

### Step 4: Run E2E Tests
- Execute any Cypress or Playwright E2E test suites.
- Verify critical user journeys work from the browser perspective.
- Check cross-browser compatibility if applicable.

### Step 5: Generate Test Report
- Produce a consolidated test report artifact: `.test-report.md`.
- Include pass/fail counts, coverage percentages, and any flaky tests.
- List any tests that were skipped and the reason.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Test Report Approved | Artifact status is `APPROVED` |
| Coverage Thresholds Met | All coverage metrics meet or exceed targets |
| All Tests Passing | 100% pass rate for unit, integration, and E2E tests |
| No Skipped Tests | No undocumented skipped or disabled tests |
| Test Quality Passed | Tests follow naming and structure conventions |
| Flaky Tests Documented | Any flaky tests are flagged with issue references |

## Artifact Template

```markdown
# Test Report: <Feature Title>

**Backend**: `BE-<ID>`
**Frontend**: `FE-<ID>`
**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Summary
| Suite | Total | Passed | Failed | Skipped | Duration |
|-------|-------|--------|--------|---------|----------|
| Unit (Backend) | 45 | 45 | 0 | 0 | 2.3s |
| Unit (Frontend) | 32 | 32 | 0 | 0 | 1.8s |
| Integration | 18 | 18 | 0 | 0 | 4.1s |
| E2E | 6 | 6 | 0 | 0 | 12.5s |
| **Total** | **101** | **101** | **0** | **0** | **20.7s** |

## Coverage
| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| Lines | 87% | >= 80% | ✅ |
| Branches | 82% | >= 75% | ✅ |
| Functions | 91% | >= 80% | ✅ |
| Statements | 86% | >= 80% | ✅ |

## Quality Review
- [x] Tests follow naming conventions
- [x] Factories used instead of hard-coded data
- [x] Mocks properly scoped and restored
- [x] No undocumented skipped tests
- [x] No `any` types in tests

## Flaky Tests
- None identified

## Notes
- 3 edge case scenarios identified without test coverage — added to backlog
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Coverage below threshold | Add tests for uncovered lines, especially error paths |
| Integration tests failing | Check test database state, migration order, or test data factory |
| Flaky E2E tests | Add retry logic, fix async timing, or isolate test data |
| Tests use hard-coded data | Refactor to use test data factories |
| Skipped tests without reason | Either implement the tests or document the reason |

## Cross-References

- [05-Backend.md](./05-Backend.md)
- [06-Frontend.md](./06-Frontend.md)
- [Standards: Testing Standards](../05-STANDARDS/Testing-Standards.md)
