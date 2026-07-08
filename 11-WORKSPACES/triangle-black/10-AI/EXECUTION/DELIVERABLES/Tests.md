# Tests Deliverable Contract

## Purpose

Ensure that all new and modified code is adequately tested, tests are reliable, and testing is fully automated within the CI pipeline.

## Testing Framework Agnostic

This contract applies regardless of the testing framework or language used. Teams may choose the most appropriate framework for their stack.

## Requirements

### 1. Unit Tests for All New Logic

- Every new function, method, or class must have corresponding unit tests.
- All branches and logical paths must be exercised (statement, branch, and path coverage).
- Pure functions must be tested in isolation with mocked dependencies where appropriate.
- Edge cases (empty input, null values, boundary conditions, error states) must be covered.

### 2. Integration Tests for API Endpoints

- Every API endpoint must have integration tests that verify:
  - Successful request-response flow
  - Request validation (invalid input, missing fields, wrong types)
  - Authentication and authorization enforcement
  - Error response format and status codes
- Integration tests must use a test database or mocked service layer.

### 3. End-to-End Tests for Critical Paths

- Critical user journeys must be covered by E2E tests.
- E2E tests must run against a production-like environment.
- At minimum, cover: happy path, authentication flow, data submission, error recovery.

### 4. Minimum 80% Coverage

- Line coverage: minimum 80% across the codebase.
- Branch coverage: minimum 70%.
- New code must maintain or improve the project's coverage percentage.
- Coverage reports must be generated and published with every CI build.
- Coverage thresholds are enforced by CI; builds fail below the minimum.

### 5. Tests Are Deterministic

- Tests must produce the same result every time they are run.
- No dependency on: system time, random values (without seeding), network availability, or external service state.
- Flaky tests must be identified and quarantined immediately.
- A flaky test process: flag → investigate → fix or remove → verify stability.

### 6. Tests Run in CI

- All tests must execute as part of the CI pipeline.
- Test suites must complete within the pipeline's timeout limit (default: 15 minutes).
- Test results must be published in a standard format (JUnit XML, etc.).
- Test failures block the pipeline and prevent merging.

### 7. Test Naming and Organization

- Test names must clearly describe what is being tested and the expected outcome.
- Test files must mirror the source file structure (e.g., `src/foo.ts` → `tests/foo.test.ts`).
- Test suites must be organized by module or feature area.

### 8. Test Data Management

- Test data must be self-contained and not rely on shared mutable state.
- Setup and teardown must leave the system in a clean state.
- Fixtures and factories should be used for complex test data.

## Verification

| Check | Tool/Method | Pass/Fail |
|---|---|---|
| Coverage minimum | Coverage tool | Pass |
| Deterministic runs | CI rerun check | Pass |
| CI execution | Pipeline | Pass |
| Naming convention | Code review | Pass |
| Branch coverage | Coverage tool | Pass |

## Non-Compliance

Tests that fail, are non-deterministic, or do not meet coverage thresholds will block the build. Teams must address test debt as part of every sprint.
