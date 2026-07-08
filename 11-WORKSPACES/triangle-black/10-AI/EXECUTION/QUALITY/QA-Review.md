# QA Review Gate

## Gate Keeper

**QA Director AI** — Automated quality assurance review that validates test coverage, test quality, and overall release readiness.

## When Triggered

This gate is triggered when:

- **Feature ready for testing**: A feature has passed code review and business review.
- **Release candidate**: A release candidate has been built and is ready for QA validation.
- **Regression test cycle**: Before any production deployment.

## Review Criteria

### 1. All Test Levels Present

- Unit tests exist for all new and modified code.
- Integration tests cover API endpoints and service interactions.
- End-to-end tests cover critical user journeys.
- Contract tests exist for service-to-service interactions (if applicable).

### 2. Coverage Targets Met

- Line coverage: minimum 80%.
- Branch coverage: minimum 70%.
- New code coverage: minimum 90%.
- Coverage trends: no regression in overall coverage.
- Coverage reports are generated and published.

### 3. Edge Cases Covered

- Boundary conditions are tested (min/max values, empty states, null inputs).
- Error states and error handling paths are tested.
- Concurrency and race conditions are considered (where applicable).
- State transitions are tested (where state machines exist).

### 4. No Regressions Introduced

- All existing tests pass with the new changes.
- Regression test suite is executed and results are clean.
- Previously fixed bugs are re-tested to confirm they remain fixed.
- No flaky tests introduced (tests must be deterministic).

### 5. Accessibility Tested

- UI components meet accessibility standards (WCAG 2.1 AA minimum).
- Keyboard navigation is functional.
- Screen reader compatibility is verified.
- Color contrast meets accessibility requirements.

### 6. Responsive Design Verified

- Application renders correctly on supported screen sizes.
- Mobile, tablet, and desktop layouts are tested.
- Touch interactions work on mobile devices.
- No layout breakage at standard breakpoints.

### 7. Test Quality

- Tests are readable and maintainable.
- Tests are independent (no shared mutable state, no test ordering dependencies).
- Test cleanup is proper (database, filesystem, mocks).
- Test data is realistic and representative of production data.

### 8. Performance Baseline

- Tests establish a performance baseline for the feature.
- No significant performance regression compared to baseline.
- Load test results (if applicable) show acceptable throughput and latency.

## Review Process

1. Feature is submitted to QA review with all test artifacts.
2. QA Director AI runs automated test analysis (coverage, test quality, test results).
3. Regression test suite is executed in a QA environment.
4. Accessibility and responsive design checks are performed.
5. Test results and quality metrics are compiled into a QA report.
6. For critical issues, human QA lead performs additional manual testing.
7. Decision is recorded in the QA review log.

## Gate Output

- **Passed**: Feature is QA-approved and ready for release.
- **Conditional Pass**: Feature is approved with minor issues documented. Issues must be addressed before production deployment.
- **Failed**: Feature has significant quality issues. Returned to development with documented defects.
- **Blocked**: Feature has critical quality issues that prevent any further progress.

## Quality Metrics

| Metric | Minimum | Target |
|---|---|---|
| Line coverage | 80% | 90% |
| Branch coverage | 70% | 80% |
| Flaky tests | 0 | 0 |
| Regression failures | 0 | 0 |
| Accessibility violations (critical) | 0 | 0 |
| Responsive layout issues | 0 | 0 |

## Non-Compliance

Features that fail QA review are returned to the development team. All critical and high-severity issues must be resolved before re-submission. Repeated QA failures may trigger a process improvement review.
