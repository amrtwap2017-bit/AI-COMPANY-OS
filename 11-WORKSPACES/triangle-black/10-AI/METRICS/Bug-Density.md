# Bug Density Metrics

## Overview

Bug density metrics track the prevalence and impact of defects across the delivery pipeline. These metrics help identify quality hotspots, measure the effectiveness of quality processes, and guide investment in prevention versus detection activities.

## Bugs Per Feature

### Definition

Bugs per feature measures the number of bugs reported against a specific feature after its initial delivery.

### Calculation

```
bugs_per_feature = COUNT(bugs linked to feature) / COUNT(features delivered)
```

Calculated per sprint and cumulatively per release.

### Tracking Dimensions

| Dimension | Purpose |
|-----------|---------|
| Per feature | Identify problematic features |
| Per component | Identify problematic modules |
| Per developer/AI role | Identify skill/process gaps |
| Per sprint | Track quality trend over time |
| Per release | Release-level quality assessment |

### Target Ranges

| Time Window | Target | Warning | Critical |
|-------------|--------|---------|----------|
| Within 1 sprint of delivery | < 1 bug per feature | 1-2 bugs | > 2 bugs |
| Within 1 release | < 2 bugs per feature | 2-4 bugs | > 4 bugs |
| Lifetime | < 3 bugs per feature | 3-5 bugs | > 5 bugs |

## Bugs Per Sprint

### Definition

Total number of bugs identified during a sprint, including bugs found in new code and regressions in existing code.

### Calculation

```
bugs_per_sprint = COUNT(bugs opened during sprint)
bug_introduction_rate = COUNT(bugs introduced in sprint features) / COUNT(sprint features)
```

### Classification

| Classification | Definition | Target |
|---------------|-----------|--------|
| In-sprint bugs | Bugs found during the sprint features are developed | < 3 per sprint |
| Escaped bugs | Bugs found after feature delivery (in later sprints) | < 1 per sprint |
| Regression bugs | Bugs in previously working functionality | 0 per sprint |
| Production bugs | Bugs found in production environment | 0 per sprint |

### Target Ranges

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Total bugs per sprint | < 5 | 5-10 | > 10 |
| Bug introduction rate | < 20% | 20-35% | > 35% |
| Escape rate | < 10% | 10-20% | > 20% |
| Regression rate | 0% | < 5% | > 5% |

## Critical / Blocker Bug Count

### Definition

Count of bugs classified as Critical (P0) or Blocker severity. These bugs represent production incidents or complete feature blocks.

### Severity Classification

| Severity | Definition | Examples |
|----------|-----------|---------|
| Blocker | Complete system outage, data loss, security breach | Authentication broken, data corruption |
| Critical (P0) | Major feature unusable, significant data integrity issue | Payment processing fails, wrong calculation |
| Major (P1) | Feature partially broken, workaround available | UI rendering glitch, suboptimal performance |
| Minor (P2) | Cosmetic issue, low-impact inconvenience | Typo in UI, non-critical styling |
| Trivial (P3) | Very low impact, can be deferred | Documentation typo, rare edge case |

### Target Ranges

| Severity | Target | Maximum Acceptable |
|----------|--------|-------------------|
| Blocker | 0 at all times | 0 |
| Critical (P0) | 0 in production | 1 open |
| Major (P1) | < 2 open at any time | 5 open |
| Minor (P2) | < 10 open | 20 open |
| Trivial (P3) | No limit, prioritize by impact | N/A |

## Bug Resolution Time

### Definition

Time from bug report to bug fix deployed to the affected environment.

### Calculation

```
resolution_time = deployment_timestamp - report_timestamp
```

Measured in hours for production bugs, days for non-production bugs.

### Resolution Time by Severity

| Severity | Target Resolution (p50) | Target Resolution (p95) |
|----------|------------------------|------------------------|
| Blocker | < 1 hour | < 4 hours |
| Critical | < 4 hours | < 24 hours |
| Major | < 3 days | < 7 days |
| Minor | < 2 sprints | < 3 sprints |
| Trivial | < 4 sprints | < 6 sprints |

### Aging Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Mean time to resolve (MTTR) | Average resolution time across all bugs | < 3 days |
| Bug aging | Days since bug was opened | P50 < 5 days, P95 < 30 days |
| Stale bug ratio | Bugs with no activity in 30+ days | < 5% of open bugs |

## Regression Rate

### Definition

The percentage of changes that introduce regressions in previously working functionality.

### Calculation

```
regression_rate = (COUNT(deployments with regressions) / COUNT(total deployments)) * 100
```

Or per-sprint basis:

```
regression_rate = (COUNT(regression bugs in sprint) / COUNT(feature bugs + regression bugs in sprint)) * 100
```

### Target Ranges

| Environment | Target | Warning | Critical |
|-------------|--------|---------|----------|
| Development | < 5% | 5-10% | > 10% |
| Staging | < 3% | 3-5% | > 5% |
| Production | < 1% | 1-2% | > 2% |

### Regression Prevention Actions

| Regression Rate | Action |
|----------------|--------|
| > 5% in dev | Improve test coverage for affected area |
| > 3% in staging | Add integration/E2E tests for regression path |
| > 1% in production | Incident review, automated regression test suite expansion |

## Tracking and Reporting

### Bug Dashboard Metrics

| Metric | Display | Update Frequency |
|--------|---------|-----------------|
| Open bugs by severity | Bar chart | Real-time |
| Bug introduction trend | Line chart (per sprint) | Daily |
| Resolution time distribution | Histogram | Weekly |
| Regression rate trend | Line chart | Per deployment |
| Bug age distribution | Stacked bar | Weekly |
| Top 10 buggy components | Table | Per sprint |

### Bug Density Report Structure

```yaml
bug_density:
  period: "{sprint-number|release-version}"
  summary:
    total_bugs_opened: {count}
    total_bugs_closed: {count}
    net_change: {count}
    open_bugs: {count}
  by_severity:
    blocker: {count}
    critical: {count}
    major: {count}
    minor: {count}
    trivial: {count}
  by_type:
    feature_bug: {count}
    regression: {count}
    production: {count}
  metrics:
    bugs_per_feature: {ratio}
    bugs_per_sprint: {count}
    bug_introduction_rate: {percentage}
    escape_rate: {percentage}
    regression_rate: {percentage}
    mttr: {hours}
    aging_p50: {days}
    aging_p95: {days}
  trending:
    bugs_per_sprint: [{n-3_sprint}, {n-2_sprint}, {n-1_sprint}, current]
    regression_rate: [{n-3_sprint}, {n-2_sprint}, {n-1_sprint}, current]
    mttr: [{n-3_sprint}, {n-2_sprint}, {n-1_sprint}, current]
```

### Continuous Improvement Targets

| Metric | Current | 1-Month Target | 3-Month Target |
|--------|---------|----------------|----------------|
| Bugs per feature | Baseline | -20% | -40% |
| Regression rate | Baseline | -30% | -50% |
| MTTR | Baseline | -15% | -30% |
| Escape rate | Baseline | -25% | -50% |
