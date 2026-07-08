# Build and CI Metrics

## Purpose

Build and CI metrics measure the health, speed, and reliability of the automated build and test pipeline. A fast, reliable CI pipeline is the foundation of continuous delivery. Slow or flaky builds destroy developer productivity and erode trust in automation.

## Metrics

### Build Success Rate

- **Definition**: Percentage of CI builds that complete successfully (all stages pass).
- **Measurement**: `(successful builds / total builds) * 100`
- **Tools**: CI platform dashboard (GitHub Actions, GitLab CI, Jenkins).
- **Target**: ≥ 95% success rate on `main` branch. ≥ 90% across all branches.
- **Alerting threshold**: < 90% triggers team notification. < 80% triggers engineering lead escalation.
- **Degradation factors**: Flaky tests, infrastructure issues, configuration drift, dependency changes.

### Build Duration (Average and P95)

- **Definition**: Time from pipeline trigger to completion.
- **Measurement**:
  - **Average**: Mean build time across all builds in a rolling 7-day window.
  - **P95**: The time below which 95% of builds complete. Represents the typical worst-case experience.
- **Tools**: CI platform API, custom dashboards (Grafana, Datadog).
- **Target**: Average < 10 minutes. P95 < 20 minutes.
- **Alerting threshold**: P95 > 20 minutes triggers investigation. P95 > 30 minutes triggers escalation.
- **Breakdown**: Monitor build duration broken down by stage (compile, unit test, integration test, lint, security scan, package) to identify bottlenecks.

### Build Queue Time

- **Definition**: Time a build spends waiting for a CI runner to become available.
- **Measurement**: Pipeline start timestamp minus pipeline trigger timestamp.
- **Tools**: CI platform API, runner metrics.
- **Target**: Average < 30 seconds. P95 < 2 minutes.
- **Alerting threshold**: P95 > 5 minutes triggers runner scaling review.
- **Remediation**: Increase runner capacity, optimize concurrency limits, reduce build parallelism.

### Test Execution Time

- **Definition**: Total time spent executing tests across all test stages.
- **Measurement**: Sum of test stage durations per pipeline.
- **Tools**: CI platform, test framework reporting (JUnit XML, pytest timings).
- **Target**: < 5 minutes for unit tests. < 10 minutes for integration tests.
- **Tracking**: Monitor trend over time. Test execution time tends to grow monotonically as the codebase grows.
- **Action**: When test time increases by > 10% in a month, investigate test quality and consider test parallelization or splitting.

### Flaky Test Rate

- **Definition**: Percentage of tests that pass and fail on different runs with no code changes.
- **Measurement**: `(flaky test runs / total test runs) * 100` over a rolling 7-day window.
- **Tools**: Flaky test detection plugins (Flaky Test Reporter, pytest-flakefinder), CI test history analysis.
- **Target**: < 1% flaky test rate. Zero flaky tests on `main`.
- **Alerting threshold**: Any flaky test detected triggers automatic quarantining and a ticket creation.
- **Flaky test quarantine process**:
  1. Test is automatically quarantined (moved to a separate job, does not block builds).
  2. Ticket is created and assigned to the test owner.
  3. Fix is prioritized within the current sprint.
  4. Fix is verified and test is unquarantined.
  5. Root cause is documented to prevent recurrence.

### Deployment Frequency

- **Definition**: Number of deployments to production per unit of time.
- **Measurement**: Count of successful production deployments per day.
- **Tools**: Deployment platform (ArgoCD, Spinnaker), CI/CD pipeline.
- **Target**: Daily or multiple times per week (elite: multiple times per day).
- **Context**: This metric is shared with Deployment-Metrics.md and DORA-Metrics.md. It is listed here because the build pipeline is a primary enabler of deployment frequency.

## Measurement and Reporting

### Data Collection

All build metrics are collected automatically:

1. CI platform sends build events (trigger, start, stage completion, failure) to a central event bus.
2. Metrics are aggregated and stored in a time-series database (InfluxDB, Prometheus).
3. Dashboards are rendered in Grafana (or embedded from the CI platform).

### Dashboard

The build health dashboard should display:

- Build success rate (7-day rolling)
- Build duration (average and P95, 7-day trend)
- Build queue time (average and P95)
- Test execution time (breakdown by stage)
- Flaky test count and quarantine status
- Top failing tests (by frequency)
- Build duration trend (30-day)

### Weekly Review

Build metrics are reviewed in the weekly engineering meeting:

- Did build success rate meet target?
- Were there any significant build duration spikes?
- How many flaky tests were detected and resolved?
- Are there any infrastructure bottlenecks?

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| Slow builds | Parallelize stages, optimize dependency caching, split into smaller modules |
| Flaky tests | Quarantine immediately, investigate root cause, add retry with backoff for environment-sensitive tests |
| Queue time | Add more runners, reduce concurrent build load, optimize build times |
| Long test execution | Split test suite, use test impact analysis (run only affected tests), increase parallelism |
| Frequent failures | Investigate common failure patterns, improve pre-merge validation, fix environment drift |
