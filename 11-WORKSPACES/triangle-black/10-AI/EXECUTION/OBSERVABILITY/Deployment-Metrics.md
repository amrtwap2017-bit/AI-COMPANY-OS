# Deployment Metrics

## Purpose

Deployment metrics measure the speed, frequency, reliability, and safety of the deployment process. These metrics are leading indicators of delivery effectiveness and organizational agility. High-performing teams deploy frequently with low failure rates and fast recovery times.

## Metrics

### Deployment Frequency

- **Definition**: Number of successful deployments to production per unit of time (typically per day).
- **Measurement**: Count of successful production deployments per day, measured as a rolling 7-day or 30-day average.
- **Tools**: Deployment automation platform (ArgoCD, Spinnaker, GitHub Actions), CI/CD pipeline.
- **Target**: Daily deployments (elite: multiple times per day).
- **DORA classification**:
  - Elite: Multiple deployments per day
  - High: Once per day to once per week
  - Medium: Once per week to once per month
  - Low: Once per month to once every 6 months
- **Actionable insights**: Low deployment frequency often indicates long release cycles, manual processes, or fear of deployment. Addressing pipeline automation and testing confidence typically increases frequency.

### Deployment Lead Time

- **Definition**: The time from a commit being merged to `main` to it being deployed to production.
- **Measurement**: Timestamp of merge to `main` subtracted from timestamp of successful production deployment.
- **Tools**: CI/CD pipeline, git history, deployment platform.
- **Target**: < 1 hour for elite performance.
- **Note**: This is distinct from Lead Time for Changes (DORA metric), which measures from code commit to running in production. Deployment Lead Time specifically measures the pipeline portion.

### Deployment Success Rate

- **Definition**: Percentage of deployment attempts that complete successfully (all stages pass, application serves traffic normally).
- **Measurement**: `(successful deployments / total deployment attempts) * 100`
- **Tools**: Deployment platform, monitoring system.
- **Target**: ≥ 99% success rate.
- **Alerting threshold**: < 95% triggers investigation. Rolling back to a known good state is preferred over debugging a failed deployment in progress.

### Deployment Duration

- **Definition**: Total time from deployment start to completion (all traffic serving normally).
- **Measurement**: Timestamp of first deployment action minus timestamp of healthy status confirmation.
- **Tools**: Deployment platform, health check monitoring.
- **Target**: < 5 minutes for standard deployments. < 15 minutes for major releases.
- **Breakdown**: Monitor duration by deployment stage (build, image push, manifest apply, rollout, health check). Long durations in specific stages indicate optimization opportunities.

### Rollback Rate

- **Definition**: Percentage of deployments that result in a rollback (automated or manual).
- **Measurement**: `(number of rollbacks / total deployments) * 100`
- **Tools**: Deployment platform, incident tracking.
- **Target**: < 5% rollback rate.
- **Alerting threshold**: > 10% triggers process review.
- **Note**: A low rollback rate is not necessarily good if it means the team avoids deploying. A healthy team deploys frequently and occasionally rolls back quickly.

### Hotfix Rate

- **Definition**: Percentage of deployments that are hotfixes (expedited, non-scheduled deployments to address production issues).
- **Measurement**: `(number of hotfix deployments / total deployments) * 100`
- **Tools**: Deployment platform, ticket system (hotfix tag).
- **Target**: < 10% of total deployments.
- **Alerting threshold**: > 20% triggers delivery process review.
- **Actionable insights**: A high hotfix rate suggests quality issues in the regular release process, insufficient testing, or inadequate test coverage.

## Measurement and Reporting

### Data Collection

Deployment metrics are collected from:

1. **Deployment platform events** — triggers, approvals, stage transitions, rollbacks
2. **CI/CD pipeline** — build and deployment timestamps
3. **Health monitoring** — deployment success confirmation via health check endpoints
4. **Incident management** — rollback events and hotfix tagging

### Deployment Dashboard

The deployment dashboard should display:

- Deployment frequency (daily rolling average, weekly trend)
- Deployment lead time (average and P95, trend)
- Deployment success rate (daily, with failure reasons)
- Deployment duration (average and P95, by stage)
- Rollback rate (trend, with root causes)
- Hotfix rate (trend)
- Current deployment status (green/red)
- Recent deployment timeline

### Deployment Review

After each production deployment:

- Confirm deployment success via monitoring dashboards
- Log deployment duration and any anomalies
- Document any manual steps taken (for automation)
- If rollback occurred, document root cause and preventive measures

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| Low deployment frequency | Automate release process, reduce batch size, improve test confidence |
| High deployment duration | Parallelize pipeline stages, optimize container builds, improve health check responsiveness |
| High rollback rate | Improve staging environment parity, enhance pre-deployment testing, implement canary deployments |
| High hotfix rate | Improve testing coverage, implement feature flags for gradual rollout, strengthen release criteria |
| Deployment failures | Improve automated rollback capabilities, enhance deployment monitoring and alerting |
