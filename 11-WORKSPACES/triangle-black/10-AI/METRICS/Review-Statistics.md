# Review Statistics

## Overview

Review statistics track the efficiency, effectiveness, and quality of the automated code review process. These metrics help calibrate review rules, identify review bottlenecks, and measure the value that automated review provides to the delivery pipeline.

## Review Cycle Time

### Definition

Review cycle time measures the duration from when a code submission enters review to when it receives a final verdict (approved or rejected).

### Calculation

```
review_cycle_time = final_verdict_timestamp - review_submission_timestamp
```

### Decomposition

Review cycle time is decomposed into sub-stages:

| Stage | Definition | Target (p50) | Target (p95) |
|-------|------------|--------------|--------------|
| Queue time | Submission to review start | < 5 min | < 15 min |
| Analysis time | Review start to initial findings | < 2 min | < 5 min |
| Author response time | Findings to author's first response | < 30 min | < 2 hours |
| Fix time | First response to fix submission | < 15 min | < 1 hour |
| Re-review time | Fix submission to final verdict | < 2 min | < 5 min |
| Total review cycle | Submission to final verdict | < 1 hour | < 4 hours |

### Factors Affecting Cycle Time

| Factor | Impact | Mitigation |
|--------|--------|------------|
| Submission size | +5 min per 100 lines | Enforce smaller commits |
| Finding count | +10 min per finding | Improve code generation quality |
| Severity of findings | +15 min per critical finding | Block critical findings pre-review |
| Re-review iterations | +20 min per iteration | Improve fix quality |

### Target Ranges

| Submission Type | Target Cycle Time | Maximum Acceptable |
|----------------|-------------------|-------------------|
| Small (1-50 lines) | < 15 min | < 1 hour |
| Medium (51-200 lines) | < 30 min | < 2 hours |
| Large (201-500 lines) | < 1 hour | < 4 hours |
| Extra large (> 500 lines) | < 2 hours | < 8 hours (flag for splitting) |

## Findings Per Review

### Definition

The number of distinct issues identified by the Code Review AI in a single review.

### Calculation

```
findings_per_review = COUNT(findings in a single review)
```

### Distribution Tracking

Findings per review is tracked as a distribution:

| Percentile | Target | Interpretation |
|------------|--------|----------------|
| p25 | < 2 findings | Most reviews are clean |
| p50 | < 3 findings | Median review has few issues |
| p75 | < 5 findings | Three quarters are clean |
| p90 | < 8 findings | Most reviews pass quickly |
| p95 | < 12 findings | Rare exception with many findings |

### Findings by Submission Size

```
findings_density = findings_per_review / lines_of_code_changed * 1000
```

| Density | Rating | Target |
|---------|--------|--------|
| < 2 findings per 1000 lines | Excellent | 80% of reviews |
| 2-5 findings per 1000 lines | Acceptable | 15% of reviews |
| 5-10 findings per 1000 lines | Needs improvement | < 5% of reviews |
| > 10 findings per 1000 lines | Poor | 0% of reviews |

## Finding Severity Distribution

### Definition

The distribution of findings across severity levels (critical, high, medium, low, info).

### Target Distribution

| Severity | Target % of Findings | Max Acceptable % |
|----------|---------------------|------------------|
| Critical | 0% | < 1% |
| High | < 5% | < 10% |
| Medium | 15-25% | < 30% |
| Low | 40-50% | < 60% |
| Info | 30-40% | No limit |

### Severity Shift Trend

Tracking whether findings are shifting toward lower severity over time indicates improving code quality:

```
severity_index = (critical_count * 5 + high_count * 4 + medium_count * 3 + low_count * 2 + info_count * 1) / total_findings
```

Target: Decreasing severity_index over sprints (fewer high-severity findings relative to total)

## Acceptance Rate

### Definition

The percentage of review findings that are accepted (acknowledged as valid) by the author.

### Calculation

```
acceptance_rate = (COUNT(findings accepted as valid) / COUNT(total findings)) * 100
```

### Finding Acceptance by Severity

| Severity | Target Acceptance Rate | Notes |
|----------|----------------------|-------|
| Critical | 100% | Must be accepted |
| High | 95% | Should be accepted |
| Medium | 85% | Most accepted |
| Low | 70% | Some may be style preferences |
| Info | 40% | Suggestions, may be optional |

### False Positive Rate

```
false_positive_rate = (COUNT(findings rejected as invalid) / COUNT(total findings)) * 100
```

| Target | Warning | Critical |
|--------|---------|----------|
| < 5% | 5-10% | > 10% |

High false positive rates indicate that review rules need tuning.

## Re-Review Rate

### Definition

The percentage of submissions that require multiple review cycles after fixes.

### Calculation

```
re_review_rate = (COUNT(submissions requiring > 1 review cycle) / COUNT(total submissions)) * 100
```

### Iteration Distribution

| Iterations | Target % | Action if Exceeded |
|------------|---------|-------------------|
| 1 cycle (approved first time) | 75% | Maintain |
| 2 cycles | 20% | Normal |
| 3 cycles | 4% | Investigate recurring issues |
| 4+ cycles | 1% | Escalate, potential generation issue |

### Reasons for Re-Review

| Reason | Acceptable Rate | Action if Exceeded |
|--------|-----------------|-------------------|
| Incomplete fix | < 10% of re-reviews | Improve fix generation |
| New issue introduced | < 5% of re-reviews | Add test for fix verification |
| Misunderstood finding | < 5% of re-reviews | Improve finding description clarity |
| Multiple independent issues | < 15% of re-reviews | Consider splitting submission |

## Tracking and Reporting

### Review Statistics Dashboard

| Metric | Display | Update Frequency |
|--------|---------|-----------------|
| Review cycle time (p50, p95) | Line chart | Per review |
| Findings per review | Histogram | Per review |
| Severity distribution | Stacked bar (daily/weekly) | Daily |
| Acceptance rate | Gauge chart | Weekly |
| Re-review rate | Percentage with trend | Per sprint |
| False positive rate | Percentage with trend | Per sprint |
| Review queue depth | Current count | Real-time |

### Review Statistics Report

```yaml
review_statistics:
  period: "{sprint-number | date-range}"
  summary:
    total_reviews: {count}
    total_findings: {count}
    avg_findings_per_review: {number}
    total_lines_reviewed: {count}
  cycle_time:
    p50: {minutes}
    p95: {minutes}
    avg: {minutes}
    queue_time_p50: {minutes}
    analysis_time_p50: {minutes}
    fix_time_p50: {minutes}
  findings:
    distribution:
      critical: {count}
      high: {count}
      medium: {count}
      low: {count}
      info: {count}
    density_per_1000_loc: {number}
    severity_index: {number}
  acceptance:
    acceptance_rate: {percentage}
    false_positive_rate: {percentage}
    by_severity:
      critical: {percentage}
      high: {percentage}
      medium: {percentage}
      low: {percentage}
      info: {percentage}
  rework:
    re_review_rate: {percentage}
    iteration_distribution:
      "1": {percentage}
      "2": {percentage}
      "3": {percentage}
      "4+": {percentage}
  trending:
    cycle_time_trend: [{week1}, {week2}, {week3}, {week4}]
    findings_trend: [{week1}, {week2}, {week3}, {week4}]
    acceptance_trend: [{week1}, {week2}, {week3}, {week4}]
```

## Process Improvement Targets

| Metric | Current | 1-Month Target | 3-Month Target |
|--------|---------|----------------|----------------|
| p50 review cycle time | Baseline | -20% | -35% |
| p95 review cycle time | Baseline | -15% | -30% |
| Acceptance rate | Baseline | +5% | +10% |
| False positive rate | Baseline | -30% | -50% |
| Re-review rate | Baseline | -20% | -35% |
| Findings density | Baseline | -15% | -25% |

### Improvement Actions

| Metric Condition | Action |
|-----------------|--------|
| Cycle time increasing | Review tool performance, parallelize analysis |
| False positive rate > 10% | Tune review rules, increase threshold for low-severity rules |
| Re-review rate > 25% | Improve finding clarity, provide fix examples |
| Acceptance rate < 70% | Calibrate severity levels, reduce noise |
| Critical findings recurring | Feed into code generation training data |
