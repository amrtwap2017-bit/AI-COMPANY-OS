# Continuous Testing

## Purpose

Testing is not a phase — it happens continuously throughout the delivery pipeline. Continuous Testing shifts testing left (earlier in the pipeline), automates execution on every change, and ensures that quality is built in, not inspected in at the end.

## Shift-Left: Test Earlier

The traditional approach tests late in the cycle — after development is complete. Shift-left testing moves testing activities earlier:

```
Traditional:  Requirements → Design → Code → Test → Deploy
Shift-Left:   Requirements → Test Design → Code with Tests → Deploy
                             ↑            ↑
                         Test as you    Test as you
                         specify        write code
```

### Shift-Left Practices

| Practice | Description | When |
|----------|-------------|------|
| **Test-first / TDD** | Write test before implementation | During development |
| **Acceptance test-driven (ATDD)** | Define acceptance criteria as tests before coding | During refinement |
| **Static analysis** | Analyze code for defects without executing | On every commit |
| **Code review** | Peer review of test coverage and quality | On every PR |
| **Property-based testing** | Test invariants and properties, not just examples | For core logic |
| **Mutation testing** | Verify tests catch intentional code mutations | Weekly |

## Automated Test Execution on Every Commit

Every commit triggers automated test execution:

| Test Type | Trigger | Must Pass? | Duration Target |
|-----------|---------|------------|-----------------|
| Unit tests | Every commit | Yes | < 2 minutes |
| Static analysis | Every commit | Yes | < 1 minute |
| Integration tests | PR to main | Yes | < 5 minutes |
| Contract tests | PR to main | Yes | < 3 minutes |
| End-to-end tests | Merge to main | Yes | < 10 minutes |
| Performance regression | Staging deploy | Yes | < 15 minutes |
| Security tests | PR to main | Yes | < 5 minutes |

## Test Pyramid Enforcement

The automated pipeline enforces test distribution aligned with the test pyramid:

```
         ╱╲
        ╱  ╲          E2E Tests (5-10%)
       ╱    ╲
      ╱──────╲
     ╱        ╲      Integration Tests (20-30%)
    ╱          ╲
   ╱────────────╲
  ╱              ╲
 ╱                ╲  Unit Tests (60-70%)
╱──────────────────╲
```

### Enforcement Rules

- **New PRs** must maintain the test distribution within the target ranges.
- **Unit test count** must always exceed integration test count.
- **Integration test count** must always exceed E2E test count.
- Ratio violations are flagged in PR review and may block the PR.

### Test Layers

#### Unit Tests

- **Scope**: Single function, method, or class in isolation.
- **Dependencies**: Mocked or stubbed.
- **Speed**: Milliseconds per test.
- **Coverage target**: ≥ 80% line coverage.
- **Run frequency**: On every commit.
- **Ownership**: Developer.

#### Integration Tests

- **Scope**: Interactions between components — APIs, databases, queues, services.
- **Dependencies**: Real instances (test containers, lightweight services).
- **Speed**: Seconds per test.
- **Coverage target**: ≥ 70% of integration surfaces.
- **Run frequency**: On every PR to main. On every merge to main.
- **Ownership**: Developer + QA.

#### End-to-End Tests

- **Scope**: Full system — all services, real infrastructure.
- **Dependencies**: Staging environment.
- **Speed**: Minutes per test.
- **Coverage target**: Critical user journeys (5-20 paths).
- **Run frequency**: On every staging deployment. Before every production deployment.
- **Ownership**: QA team.

## Flaky Test Detection and Quarantine

### Definition

A flaky test is one that passes and fails on different runs with no code changes. Flaky tests erode trust in the test suite and CI pipeline.

### Detection

- Automated flaky test detection runs after each CI build.
- A test is flagged as flaky if it fails on one run and passes on the next with no intervening code change.
- Flaky tests are tracked in a dedicated database.

### Quarantine Process

1. **Detection**: Pipeline detects a flaky test (pass/fail inconsistency).
2. **Notification**: Team is notified via Slack/email. A ticket is created automatically.
3. **Quarantine**: The test is moved to a "quarantine" test suite. It no longer blocks the pipeline.
4. **Investigation**: Test owner investigates root cause within 48 hours.
5. **Fix**: Root cause is fixed (test logic, environment issue, or actual bug).
6. **Verification**: Fixed test runs for 5 consecutive builds without flaking.
7. **Unquarantine**: Test returns to the main suite.
8. **Prevention**: Root cause is documented. Pattern is addressed across the test suite.

### Flaky Test Tolerance

- **Target**: Zero flaky tests in the main suite.
- **Quarantine limit**: Maximum 5 tests in quarantine at any time. If exceeded, the team stops feature work to address flaky tests.

## Performance Regression Testing

### When

Performance tests run automatically on every staging deployment.

### What

- Response time for critical endpoints (P50, P95, P99).
- Throughput (requests per second).
- Resource utilization (CPU, memory, database connections).
- Database query performance (slow query detection).

### Thresholds

| Metric | Regression Threshold | Action |
|--------|---------------------|--------|
| Response time (P50) | > 10% increase | Flag, non-blocking |
| Response time (P95) | > 15% increase | Block deployment |
| Response time (P99) | > 20% increase | Block deployment |
| Throughput | > 15% decrease | Block deployment |
| Error rate | > 1% increase | Block deployment |

### Reporting

- Performance test results are published as a comparison to the baseline (previous deployment).
- Results are shown as a percentage change with visual indicators (green/red).
- Historical trend is maintained for long-term performance tracking.

## Testing Ownership

| Test Type | Primary Owner | Secondary | Review |
|-----------|--------------|-----------|--------|
| Unit tests | Developer | AI agent | Automated |
| Integration tests | Developer | QA | PR review |
| E2E tests | QA | Developer | PR review |
| Performance tests | DevOps | Developer | Report review |
| Security tests | Security team | Developer | Scan result review |
| Flaky test resolution | Test author | QA | Ticket review |
