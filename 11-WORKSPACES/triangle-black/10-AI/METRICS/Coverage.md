# Coverage Metrics

## Overview

Coverage metrics measure the extent to which the codebase, test suite, and documentation provide comprehensive protection and reference material. Coverage is a key quality indicator across code, test, and documentation dimensions.

## Code Coverage

### Coverage Types

| Type | Definition | Measurement Method |
|------|-----------|-------------------|
| Line coverage | Percentage of executable lines exercised by tests | Istanbul/nyc, JaCoCo |
| Branch coverage | Percentage of control flow branches (if/else, switch) exercised | Branch instrumentation |
| Function coverage | Percentage of functions/methods called during tests | Function call tracking |
| Statement coverage | Percentage of statements executed | Statement-level instrumentation |

### Calculation

```
line_coverage = (lines_executed / total_executable_lines) * 100
branch_coverage = (branches_exercised / total_branches) * 100
function_coverage = (functions_called / total_functions) * 100
statement_coverage = (statements_executed / total_statements) * 100
```

### Composite Coverage Score

```
coverage_score = line_coverage * 0.40 + branch_coverage * 0.35 + function_coverage * 0.15 + statement_coverage * 0.10
```

### Target Ranges

| Coverage Type | Minimum Target | Stretch Target | Gate Threshold |
|--------------|---------------|----------------|----------------|
| Line coverage | 80% | 90% | 70% |
| Branch coverage | 70% | 85% | 60% |
| Function coverage | 85% | 95% | 75% |
| Statement coverage | 80% | 90% | 70% |
| Composite | 78% | 88% | 68% |

### Coverage by Module Criticality

| Module Criticality | Line Coverage Target | Notes |
|-------------------|---------------------|-------|
| Core domain logic | 95% | Business-critical paths |
| API/Controllers | 85% | Request handling paths |
| Data access layer | 80% | Query execution |
| UI components | 70% | Visual rendering |
| Configuration | 60% | Wiring and setup |
| Infrastructure/CI | 50% | Operational scripts |

## Test Coverage by Layer

### Test Pyramid

Coverage is tracked per test layer as defined by the test pyramid:

```
     /\             E2E: 5-10% coverage
    /  \
   /    \
  /      \          Integration: 15-25% coverage
 /________\
 /        \
/__________\        Unit: 70-80% coverage
```

### Unit Test Coverage

- Scope: Individual functions, methods, classes in isolation
- Tools: Jest, Mocha, JUnit, pytest
- Key metric: Branch coverage of unit-tested modules
- Target: 80% line coverage, 70% branch coverage across all modules
- Reporting: Per-module coverage, module-level pass/fail against target

### Integration Test Coverage

- Scope: Module interactions, API endpoints, database access
- Tools: Supertest, Spring Boot Test, pytest with fixtures
- Key metric: API endpoint coverage (endpoints tested / total endpoints)
- Target: 90% of API endpoints have integration tests
- Target: 75% of data access paths have integration tests

### End-to-End Test Coverage

- Scope: Full user workflows across all system layers
- Tools: Cypress, Playwright, Selenium
- Key metric: User journey coverage (critical journeys tested / total critical journeys)
- Target: 100% of critical user journeys covered
- Target: 50% of secondary journeys covered

### Coverage by Layer Targets

| Layer | Metric | Target |
|-------|--------|--------|
| Unit | Line coverage | >= 80% |
| Unit | Branch coverage | >= 70% |
| Integration | API endpoint coverage | >= 90% |
| Integration | Data access path coverage | >= 75% |
| E2E | Critical journey coverage | 100% |
| E2E | All journey coverage | >= 60% |

## Documentation Coverage

### API Documentation Coverage

| Metric | Definition | Target |
|--------|-----------|--------|
| Endpoint documented | Public API endpoints with OpenAPI spec | 100% |
| Parameter documented | Query/path/body parameters described | 100% |
| Response documented | Response codes and schemas documented | 95% |
| Authentication documented | Auth methods documented per endpoint | 100% |
| Error documented | Error response codes documented | 90% |

### Screen/Component Documentation Coverage (UI)

| Metric | Definition | Target |
|--------|-----------|--------|
| Screen documented | UI screens in component library documented | 90% |
| Component props | Component properties documented | 100% |
| State documented | Component states (loading, empty, error, success) | 80% |
| Accessibility documented | ARIA roles, keyboard navigation documented | 75% |

### Architecture Documentation Coverage

| Metric | Definition | Target |
|--------|-----------|--------|
| Module documented | All modules have README | 100% |
| ADR coverage | All significant decisions have ADRs | 100% |
| Data flow documented | Data flow diagrams for key workflows | 80% |
| Dependency documented | External dependency list maintained | 100% |

## Measurement Tools

### Code Coverage Tools

| Stack | Unit Coverage | Integration Coverage |
|-------|--------------|---------------------|
| TypeScript/JavaScript | Istanbul/nyc | Istanbul with supertest |
| Java/Kotlin | JaCoCo | JaCoCo |
| Python | pytest-cov | pytest-cov |
| .NET/C# | Coverlet | Coverlet |

### Documentation Coverage Tools

| Tool | Purpose |
|------|---------|
| OpenAPI CLI | API spec completeness validation |
| Docusaurus plugin | Documentation coverage checker |
| Custom crawler | Scans for undocumented components |

## Reporting

### Coverage Report

Each build produces a coverage report containing:

```yaml
coverage_report:
  build: "{build-id}"
  timestamp: "{ISO-timestamp}"
  summary:
    overall: {composite-coverage-percentage}
    code:
      line: {percentage}
      branch: {percentage}
      function: {percentage}
    test_layer:
      unit: {percentage}
      integration: {percentage}
      e2e: {percentage}
    documentation:
      api: {percentage}
      screens: {percentage}
      architecture: {percentage}
  deltas:
    vs_previous: {percentage-point-change}
    vs_target: {percentage-point-variance}
  failing_modules:
    - module: "{module-name}"
      metric: "{metric-name}"
      value: {actual}
      target: {target}
```

### Coverage Trend

Coverage trends are tracked over time with:

- Sprint-over-sprint coverage delta
- Module-level coverage heatmap (green = above target, yellow = near target, red = below target)
- Coverage regression alerts (coverage drops by more than 2% in a single build)
