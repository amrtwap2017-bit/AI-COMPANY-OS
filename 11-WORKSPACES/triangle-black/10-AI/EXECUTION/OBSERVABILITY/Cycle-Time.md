# Cycle Time

## Purpose

Cycle time measures how long work takes from the moment it starts until it is complete. It is one of the most important metrics for understanding and improving delivery speed. Reducing cycle time means delivering value to users faster.

## Definition

**Cycle time**: The elapsed time between work start and work completion.

- **Start**: When active development begins (typically when the ticket moves from "To Do" to "In Progress").
- **End**: When the work is deployed to production and verified (when the ticket moves to "Done").

Cycle time measures the actual time work is actively being done, including wait time between handoffs.

## Measurement

### By Story

- Single story cycle time = `deployment timestamp - first commit timestamp`
- Tracked for each completed user story or task.
- Reported as average, median, and P95 across all completed stories in a sprint or rolling window.

### By Task Type

Cycle time is broken down by task type to identify where bottlenecks exist:

| Task Type | Typical Cycle Time Target | Notes |
|-----------|--------------------------|-------|
| Backend feature | 2-4 days | Depends on complexity |
| Frontend feature | 1-3 days | Depends on complexity |
| Database migration | 1-2 days | Requires careful review |
| Bug fix (high) | < 24 hours | Expedited through pipeline |
| Bug fix (medium) | 2-5 days | Standard process |
| Configuration change | < 4 hours | Automated where possible |
| Documentation | < 1 day | Usually straightforward |

### By AI Agent (if applicable)

- Cycle time for AI-generated artifacts: time from AI agent accepting a task to the artifact passing human review.
- Tracked separately to measure AI agent effectiveness and identify areas for prompt improvement.

### Breakdown: Development, Review, Deployment

Cycle time is decomposed into three phases:

#### Development Time

- **Start**: First commit on the feature branch.
- **End**: Pull request opened (or pushed for review).
- **Includes**: Coding, local testing, debug iterations.
- **Target**: 50-70% of total cycle time. If development time is too high, consider pair programming or reducing scope.

#### Review Time

- **Start**: Pull request opened.
- **End**: Pull request approved (or changes requested).
- **Includes**: Human review time, CI pipeline execution, any rework iterations.
- **Target**: < 25% of total cycle time. If review time is too high, consider smaller PRs or more reviewers.

#### Deployment Time

- **Start**: PR merged to main.
- **End**: Change deployed to production and verified.
- **Includes**: CI/CD pipeline execution, manual approval, rollout, health check monitoring.
- **Target**: < 10% of total cycle time. If deployment time is too high, automate manual approval steps and optimize the pipeline.

## Targets

| Metric | Target | Elite |
|--------|--------|-------|
| Average cycle time (standard story) | < 5 days | < 1 day |
| P95 cycle time | < 10 days | < 3 days |
| Development time | < 3 days | < 1 day |
| Review time | < 1 day | < 4 hours |
| Deployment time | < 4 hours | < 1 hour |

## Trend Analysis

Cycle time trends are more important than absolute values. A rising cycle time trend indicates:

- Growing technical debt
- Increasing complexity
- Process bottlenecks
- Team capacity issues
- External dependencies slowing work

Monitor the cycle time trend on a rolling 4-week basis. If the trend increases by more than 20% over 4 weeks, initiate a process review.

### Cycle Time Scatter Plot

Plot each completed story's cycle time on a scatter plot (x-axis: completion date, y-axis: cycle time in days). Look for:

- **Clusters**: Stories of certain types or sizes always take longer.
- **Outliers**: Stories with exceptionally long cycle times should be analyzed for root causes.
- **Shifts**: A sudden shift up or down indicates a process change or external factor.

## Measurement and Reporting

### Data Collection

Cycle time data is collected from:

1. **Project management tool** — ticket status transitions and timestamps.
2. **Version control** — first commit timestamp on branch.
3. **CI/CD pipeline** — merge and deployment timestamps.
4. **Code review platform** — PR open, approval, and merge timestamps.

### Cycle Time Dashboard

The cycle time dashboard should display:

- Average, median, and P95 cycle time (rolling 30 days)
- Cycle time breakdown (dev / review / deploy)
- Cycle time by task type (bar chart)
- Cycle time scatter plot
- Cycle time trend (30-day rolling)
- Cycle time comparison across teams (if multiple teams)

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| Long development time | Smaller stories, better specifications, pair programming, spike solutions for unknowns |
| Long review time | Smaller PRs, more reviewers, review SLAs, async review culture |
| Long deployment time | Automate pipeline stages, reduce manual gates, improve test speed |
| Highly variable cycle time | Standardize story sizes (e.g., no story > 3 days), improve estimation, reduce work-in-progress |
| Rising cycle time trend | Address bottlenecks, reduce WIP, improve automation, investigate team health |
