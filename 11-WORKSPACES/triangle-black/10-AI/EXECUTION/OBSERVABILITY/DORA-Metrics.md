# DORA Metrics

## Purpose

The DORA (DevOps Research and Assessment) metrics are the industry-standard four key indicators of software delivery performance. Originally identified by the State of DevOps Report, these metrics correlate strongly with organizational performance — high-performing teams across all four metrics deliver better business outcomes.

## The Four Key Metrics

| Metric | What It Measures | Why It Matters |
|--------|------------------|----------------|
| **Deployment Frequency** | How often the organization deploys to production | Measures throughput and release velocity |
| **Lead Time for Changes** | Time from code commit to code running in production | Measures speed from decision to delivery |
| **Mean Time to Restore (MTTR)** | Time to recover from a production incident | Measures resilience and recovery capability |
| **Change Failure Rate** | Percentage of deployments causing a failure in production | Measures quality and safety of deployments |

---

## 1. Deployment Frequency

- **Definition**: How often code is deployed to production.
- **Measurement**: Count of successful production deployments per time period.
- **Interval**: Measured as deployments per day, week, or month.

### Performance Levels

| Level | Threshold | Implications |
|-------|-----------|-------------|
| **Elite** | Multiple deployments per day | Continuous delivery, fully automated |
| **High** | Once per day to once per week | Regular releases, mostly automated |
| **Medium** | Once per week to once per month | Scheduled releases, some manual steps |
| **Low** | Once per month to once every 6 months | Release train, significant manual process |

### How to Measure

```
Deployment Frequency = Count of successful deployments to production
                         over a rolling 30-day period
```

Track using deployment platform events, CI/CD pipeline triggers, or release management system.

---

## 2. Lead Time for Changes

- **Definition**: The time from code commit to code successfully running in production.
- **Measurement**: Elapsed time between the commit being merged and the deployment completing.

### Performance Levels

| Level | Threshold |
|-------|-----------|
| **Elite** | Less than 1 hour |
| **High** | Between 1 hour and 1 week |
| **Medium** | Between 1 week and 1 month |
| **Low** | Between 1 month and 6 months |

### How to Measure

```
Lead Time for Changes = Median time from commit merge to production deployment
                         over a rolling 30-day period
```

Note: This is different from "Lead Time" defined in Lead-Time.md. DORA's Lead Time for Changes starts at code commit, not at request creation. The DORA metric is narrower and focuses on the pipeline portion.

### Distinction from Lead-Time.md

| Aspect | DORA Lead Time for Changes | Lead Time (Lead-Time.md) |
|--------|---------------------------|--------------------------|
| Start point | Code commit | Request creation |
| End point | Running in production | Deployed to production |
| What it measures | Pipeline efficiency | Organizational responsiveness |
| Improvement focus | CI/CD pipeline | Backlog management + delivery |

---

## 3. Mean Time to Restore (MTTR)

- **Definition**: The time required to recover from a production incident (restore service to normal operation).
- **Measurement**: Elapsed time from incident detection (or user report) to service recovery.

### Performance Levels

| Level | Threshold |
|-------|-----------|
| **Elite** | Less than 1 hour |
| **High** | Less than 1 day |
| **Medium** | Less than 1 week |
| **Low** | Between 1 week and 1 month |

### How to Measure

```
MTTR = Average time from incident detection to service restoration
        over a rolling 90-day period
```

Track using incident management system timestamps (detection time, response time, resolution time).

### What Counts as Restored

Service is considered restored when:

- The application is serving traffic normally.
- Users can complete critical workflows.
- No data has been lost (or data has been restored from backup).
- A mitigation (not necessarily a fix) is in place. The root cause fix can come later.

---

## 4. Change Failure Rate

- **Definition**: The percentage of changes to production that result in a degraded service (incident, outage, rollback, hotfix).
- **Measurement**: Count of failed deployments divided by total deployments.

### Performance Levels

| Level | Threshold |
|-------|-----------|
| **Elite** | 0-15% |
| **High** | 16-30% |
| **Medium** | 31-45% |
| **Low** | > 45% |

### How to Measure

```
Change Failure Rate = (Deployments that caused a failure in production)
                      / (Total deployments) * 100
                      over a rolling 30-day period
```

A "failure" includes: service degradation, outage, performance regression, data corruption, security concern, or any incident requiring rollback or hotfix.

### Distinction from Escaped Defect Rate

Change Failure Rate measures deployment-caused failures. Escaped Defect Rate (Bug-Metrics.md) measures bugs found in production regardless of cause. A deployment can fail (CFR) even if no code bug is involved (e.g., infrastructure misconfiguration).

---

## Measurement and Reporting

### Integration

DORA metrics should be automatically calculated and displayed alongside other operational metrics. Integrate data from:

1. **CI/CD platform** — deployment events, commit merge timestamps.
2. **Incident management** — incident start and end timestamps.
3. **Monitoring system** — deployment verification and rollback events.
4. **Code review platform** — PR merge timestamps.

### DORA Dashboard

The DORA dashboard should display:

- Four-quadrant display showing current performance level for each metric
- Historical trend for each metric (90-day rolling)
- Performance level classification (Elite, High, Medium, Low)
- Comparison across teams (if multiple teams)
- Weekly change in each metric

### Reporting Cadence

- DORA metrics are reviewed **weekly** by engineering leadership.
- Performance level changes are flagged and discussed.
- Negative trends are investigated with root cause analysis.
- Positive trends are celebrated and analyzed for repeatable practices.

## Improvement Strategies

| Metric | Improvement Strategies |
|--------|----------------------|
| **Deployment Frequency** | Automate release pipeline, reduce batch size, implement feature flags, shift from release branches to trunk-based development |
| **Lead Time for Changes** | Optimize CI/CD pipeline, automate testing, reduce manual approvals, implement continuous integration |
| **MTTR** | Improve monitoring and alerting, create incident response runbooks, implement automated rollback, practice chaos engineering |
| **Change Failure Rate** | Improve test coverage, implement canary deployments, enhance staging-to-production parity, add feature toggles |

## Targets

| Metric | Current Target | Next Target (12 months) |
|--------|---------------|------------------------|
| Deployment Frequency | Daily | Multiple times per day |
| Lead Time for Changes | < 2 hours | < 1 hour |
| MTTR | < 4 hours | < 1 hour |
| Change Failure Rate | < 15% | < 10% |
