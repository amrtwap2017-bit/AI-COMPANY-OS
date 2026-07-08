# Bug Metrics

## Purpose

Bug metrics quantify the quality of delivered software and the effectiveness of the quality assurance process. They help the team identify quality trends, allocate testing resources effectively, and reduce the number of defects that reach users.

## Severity Classification

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **Critical** | Complete loss of service or security breach. No workaround available. | Immediate | Data loss, authentication bypass, payment failure |
| **High** | Major feature broken. Data integrity at risk. No reasonable workaround. | 4 hours | Core workflow broken, incorrect calculations, permission errors |
| **Medium** | Feature partially broken. Workaround exists but is inconvenient. | 24 hours | UI display issue, non-critical path error, performance degradation |
| **Low** | Minor issue. Cosmetic or non-functional. Workaround is trivial. | Next sprint | Typo, styling inconsistency, minor usability improvement |

## Metrics

### Bug Count (by Severity)

- **Definition**: Total number of open, unresolved bugs categorized by severity level.
- **Measurement**: Count from bug tracking system, filtered by status (open, in progress, resolved, closed).
- **Tools**: Bug tracking system (Jira, Linear, GitHub Issues).
- **Targets**:
  - Critical bugs: 0 (zero tolerance)
  - High bugs: < 5 open at any time
  - Medium bugs: < 20 open at any time
  - Low bugs: Managed in backlog, reviewed quarterly
- **Reporting**: Track trend over time, not absolute count. A growing count of open critical/high bugs indicates a systemic quality issue.

### Bug Density

- **Definition**: Number of bugs per unit of code or feature size.
- **Measurement**:
  - Per line of code: `(bugs found in release / thousands of lines of code)
  - Per story point: `(bugs found in sprint / story points delivered in sprint)`
- **Tools**: Bug tracking system + code metrics.
- **Target**: < 1 bug per 1000 lines of new code. < 0.5 bugs per 10 story points delivered.
- **Context**: Bug density should be measured for new/changed code, not the entire codebase. High bug density in a specific area suggests technical debt or insufficient testing.

### Bug Resolution Time

- **Definition**: Time taken to fix and deploy a bug fix.
- **Measurement**:
  - **Time to fix**: From bug report to fix merged to `main`.
  - **Time to deploy**: From fix merged to fix deployed to production.
- **Tools**: Bug tracking system, version control, deployment platform.
- **Targets**:
  - Critical: Fix within 4 hours. Deploy within 1 hour of fix.
  - High: Fix within 24 hours. Deploy within 4 hours of fix.
  - Medium: Fix within current sprint. Deploy next sprint.
  - Low: Per priority, typically within 90 days.
- **Reporting**: Track median and P95 resolution times. Monitor if resolution times are increasing (indicates growing technical debt).

### Regression Rate

- **Definition**: Percentage of bug fixes that introduce new bugs (regressions).
- **Measurement**: `(regression bugs identified / total bugs fixed) * 100` over a rolling 30-day period.
- **Tools**: Bug tracking system (parent-child linking of regressions to original fixes).
- **Target**: < 5% regression rate.
- **Alerting threshold**: > 10% triggers test process review.
- **Actionable insights**: High regression rates suggest insufficient test coverage for bug fixes or inadequate root cause analysis.

### Escaped Defect Rate

- **Definition**: Percentage of bugs found in production relative to all bugs found.
- **Measurement**: `(bugs found in production / (bugs found in testing + bugs found in production)) * 100`
- **Tools**: Bug tracking system (environment field: staging vs. production).
- **Target**: < 15% escaped defect rate. Target is based on the ratio, not absolute count (finding more total bugs is good, regardless of where).
- **DORA context**: This is related to Change Failure Rate (DORA metric). Escaped defects are a leading indicator of change failure risk.
- **Actionable insights**: A rising escaped defect rate indicates gaps in test coverage, especially in integration and end-to-end tests. A low escaped defect rate combined with high total bug count may indicate overly thorough but inefficient testing.

## Measurement and Reporting

### Bug Dashboard

The bug dashboard should display:

- Open bug count by severity (stacked bar, trending)
- Bug density by component/module (heatmap)
- Bug resolution time (by severity, median and P95)
- Bug inflow vs. outflow (daily) — "bug burn"
- Regression rate trend (line chart)
- Escaped defect rate trend (line chart)
- Top 5 most buggy components
- Bug age — how long bugs have been open (by severity)

### Bug Triage Process

- Bugs are triaged daily by the team lead or designate.
- Severity is assigned during triage based on the classification above.
- Critical and high bugs are immediately assigned to an engineer.
- Medium bugs are added to the current sprint.
- Low bugs are added to the backlog and reviewed during backlog refinement.
- Duplicate bugs are closed and linked to the primary bug.

### Bug Review (Sprint Retrospective)

At each sprint retrospective, review:

1. Total bugs found vs. fixed in the sprint.
2. Escaped defect rate trend.
3. Top areas of bug accumulation.
4. Root cause patterns (e.g., requirement gaps, edge cases not tested, environmental differences).
5. Actions to reduce bug inflow and escaped defects.

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| High escaped defect rate | Add integration/E2E tests for critical paths, implement contract testing, improve UAT process |
| High regression rate | Implement automated regression testing, require tests with every bug fix |
| Slow bug resolution | Establish SLA per severity, automate hotfix pipeline, use swarm approach for critical bugs |
| High bug density in component | Refactor component, improve unit test coverage, consider rewrite |
| Growing bug backlog | Allocate capacity for bug fixing each sprint (e.g., 20% of capacity), triage regularly |
