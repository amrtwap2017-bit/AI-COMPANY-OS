# Coverage Metrics

## Purpose

Coverage metrics provide visibility into how thoroughly the codebase, test suite, and documentation exercise and describe the system. Coverage is not a goal in itself — it is a proxy for confidence. Higher coverage in the right areas means higher confidence that changes are safe and correct.

## Coverage Types

| Type | What It Measures | Why It Matters |
|------|------------------|----------------|
| **Code Coverage** | What proportion of source code is executed by tests | Identifies untested code paths |
| **Test Coverage by Layer** | Distribution of tests across the test pyramid | Ensures balanced testing strategy |
| **Documentation Coverage** | What proportion of the system is documented | Ensures maintainability and usability |

---

## Code Coverage

### Line Coverage

- **Definition**: Percentage of executable source lines that are executed by the test suite.
- **Measurement**: `(lines executed / total executable lines) * 100`
- **Tools**: Istanbul (JavaScript), JaCoCo (Java), pytest-cov (Python), tarpaulin (Rust), Coverlet (.NET).
- **Target**: ≥ 80% line coverage.
- **Note**: Line coverage is the most common metric but also the easiest to game. Do not optimize for line coverage alone.

### Branch Coverage

- **Definition**: Percentage of conditional branches (if/else, switch/case) that are executed in both directions.
- **Measurement**: `(branches fully covered / total branches) * 100`
- **Tools**: Same as line coverage (most tools report both).
- **Target**: ≥ 75% branch coverage.
- **Note**: Branch coverage is more meaningful than line coverage because it validates decision logic. Missing branch coverage is often where bugs hide.

### Function Coverage

- **Definition**: Percentage of functions or methods that are called by the test suite at least once.
- **Measurement**: `(functions called / total functions) * 100`
- **Tools**: Same as line coverage.
- **Target**: ≥ 90% function coverage.

### Coverage by Module/Component

- **Definition**: Code coverage broken down by module, package, or component.
- **Measurement**: Coverage tool output grouped by directory or package.
- **Purpose**: Identifies modules with low coverage that may need additional tests. Modules handling security, payments, or data integrity should have higher coverage thresholds.

---

## Test Coverage by Layer

### Test Pyramid Distribution

- **Definition**: Proportion of total tests in each layer of the test pyramid.
- **Measurement**: Count of tests by layer from test configuration or directory structure.
- **Target**:
  - Unit tests: 60-70% of total tests
  - Integration tests: 20-30% of total tests
  - End-to-end (E2E) tests: 5-10% of total tests
- **Tools**: Test runner configuration, directory scanning.

### Unit Test Coverage

- **Target**: ≥ 80% line coverage.
- **Scope**: Individual functions, methods, and classes in isolation. Dependencies are mocked or stubbed.
- **Execution time**: Milliseconds per test.
- **Run frequency**: On every commit.

### Integration Test Coverage

- **Target**: ≥ 70% line coverage of integration surfaces (API endpoints, database access layers, service boundaries).
- **Scope**: Interactions between components — API calls, database queries, message queue operations. Dependencies are real (test containers or lightweight instances).
- **Execution time**: Seconds per test.
- **Run frequency**: On every commit to `main`. On every PR.

### End-to-End Test Coverage

- **Target**: Cover all critical user journeys and happy paths. Key path E2E coverage is prioritized over exhaustive coverage.
- **Scope**: Full system — real instances of all services, databases, and external integrations (in a staging-like environment).
- **Execution time**: Minutes per test.
- **Run frequency**: On every deployment to staging. Before every production deployment.
- **Key paths**: Login, registration, payment flow, data export, error handling. Typically 5-20 critical paths per service.

---

## Documentation Coverage

### API Endpoint Coverage

- **Definition**: Percentage of API endpoints that have complete OpenAPI/Swagger documentation.
- **Measurement**: `(endpoints with documented request/response / total endpoints) * 100`
- **Tools**: OpenAPI diff tool, custom linting.
- **Target**: 100% of public endpoints documented. Internal endpoints ≥ 80%.

### Screens/Component Coverage (UI)

- **Definition**: Percentage of UI screens or components that have associated documentation (design spec, usage guidelines, props documentation).
- **Measurement**: Manual audit or automated scanning for component documentation files.
- **Tools**: Storybook, Styleguidist, custom documentation generators.
- **Target**: 100% of shared/atomic components. 80% of page-level components.

---

## Measurement and Reporting

### Coverage Reporting in CI/CD

Coverage reports are generated on every CI run and published as:

1. **PR comment**: Coverage diff between the PR branch and `main`. Blocking if coverage decreases beyond the allowed threshold.
2. **Dashboard**: Historical coverage trends in a centralized dashboard (Codecov, SonarQube, Coveralls).
3. **Badge**: Repository README badge showing current coverage.

### Coverage Gates

| Gate | Rule |
|------|------|
| PR coverage check | New code must have ≥ 80% line coverage |
| Overall coverage | Total line coverage must not decrease by > 1% per PR |
| Module coverage | Security and data modules must have ≥ 90% line coverage |
| Branch coverage | Must not decrease by > 2% per PR |
| Documentation | New endpoints must have OpenAPI docs or the PR is blocked |

### Coverage Trends

Track coverage trends over time, not just snapshot values. A decreasing trend, even within acceptable absolute thresholds, is a warning sign. Investigate:

- Is new code being written without tests?
- Are tests being removed or disabled?
- Are there untestable code patterns (tight coupling, global state)?

---

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| Low unit coverage | Add tests for new and modified code (enforce via CI), run mutation testing to find untested paths |
| Low integration coverage | Identify critical integration surfaces, add contract tests, use test containers |
| Low E2E coverage | Map critical user journeys, prioritize top 10 paths, automate with headless browser |
| Low API documentation | Add OpenAPI linting to CI, use doc generation from code annotations |
| Coverage decreasing trend | Add coverage check to PRs, pair on testing, include testing in Definition of Done |
| Low branch coverage | Use branch coverage reports to find missed conditional paths, add edge case tests |
