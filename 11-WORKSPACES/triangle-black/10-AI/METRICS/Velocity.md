# Velocity Metrics

## Overview

Velocity metrics measure the rate at which the delivery pipeline produces completed work. These metrics are the primary input for capacity planning, sprint scoping, and delivery forecasting within the Enterprise AI Delivery Framework.

## Story Points Per Sprint

### Definition

Story points per sprint measure the total estimated effort of all completed tasks in a sprint. Story points use a modified Fibonacci sequence (1, 2, 3, 5, 8, 13).

### Calculation

```
sprint_velocity = SUM(story_points of all completed tasks in sprint)
```

Completed tasks are those with status `done` where all Definition of Done criteria are met.

### Tracking

Story point velocity is tracked across dimensions:

| Dimension | Purpose |
|-----------|---------|
| Per sprint | Overall team throughput |
| Per component | Velocity by module/feature area |
| Per task type | Feature vs bug vs refactoring velocity |
| Per AI role | Frontend vs backend vs DevOps velocity |
| Rolling average | Smoothed velocity for planning (last 3 sprints) |

### Target Ranges

| Sprint Type | Target Velocity | Notes |
|-------------|----------------|-------|
| Standard sprint (2 weeks) | 30-50 points | Adequate throughput |
| Feature-heavy sprint | 25-40 points | More complex tasks |
| Bug-fix sprint | 15-25 points | Smaller tasks, less estimation variance |
| Refactoring sprint | 20-35 points | Moderate throughput |
| First sprint of program | 15-25 points | Ramp-up overhead |

## Throughput

### Definition

Throughput measures the number of work items completed per sprint, regardless of story point size.

### Calculation

```
throughput = COUNT(completed tasks in sprint)
```

### Throughput by Type

| Type | Calculation | Use |
|------|------------|-----|
| Items per sprint | COUNT(done tasks) | Volume tracking |
| Items per day | COUNT(done tasks) / sprint days | Detailed capacity |
| Feature throughput | COUNT(feature-type done tasks) | Feature delivery rate |
| Bug resolution | COUNT(bug-type done tasks) | Fix capacity |
| Item size distribution | Histogram of points per item | Trend in task granularity |

### Target Ranges

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Items per sprint | 8-15 | < 5 or > 25 |
| Feature throughput | 3-8 per sprint | < 2 |
| Bug resolution rate | 100% of priority bugs within sprint | < 80% |
| Item size variance | 70% of items within 2-5 points | < 50% |

## Cycle Time

### Definition

Cycle time measures the time from when work starts on a task to when the task is completed (status moves to `done`).

### Calculation

```
cycle_time = completion_timestamp - start_timestamp
```

Measured in hours or days depending on task granularity.

### Cycle Time by Stage

Cycle time is decomposed into stage-level components:

| Stage | Definition | Target |
|-------|------------|--------|
| Code generation start | Task assigned to first commit | < 2 hours |
| Implementation | First commit to review submission | < 4 hours |
| Review | Review submission to approval | < 2 hours |
| Fix iteration | Review comments to fix commit | < 1 hour |
| Test | Test execution to green | < 30 min |
| Total cycle time | Task assigned to done | < 1 day |

### Tracking

```
cycle_time_avg = MEAN(cycle_time of all completed tasks in sprint)
cycle_time_p50 = MEDIAN(cycle_time of all completed tasks in sprint)
cycle_time_p95 = 95th PERCENTILE(cycle_time of all completed tasks in sprint)
```

### Target Ranges

| Cycle Time Component | Target (p50) | Target (p95) |
|---------------------|--------------|--------------|
| Code generation | 30 min | 2 hours |
| Implementation | 2 hours | 8 hours |
| Review | 1 hour | 4 hours |
| Fix iteration | 15 min | 1 hour |
| Total (small task, 1-3 pts) | 4 hours | 12 hours |
| Total (medium task, 5-8 pts) | 8 hours | 24 hours |
| Total (large task, 13 pts) | 16 hours | 40 hours |

## Lead Time

### Definition

Lead time measures the time from when a task is created (or requested) to when it is completed.

### Calculation

```
lead_time = completion_timestamp - creation_timestamp
```

### Lead Time vs Cycle Time

```
Lead Time: [---Task Created---][---Backlog---][---Active---][---Done---]
                              |---Queue Time---||---Cycle Time---|
                              |----------Lead Time---------------|
```

Queue time (backlog wait) is tracked as a separate indicator:
- Queue time = time from task creation to first start
- Target: P0 tasks < 1 day, P1 tasks < 3 days, P2/P3 tasks < 2 sprints

### Target Ranges

| Priority | Target Lead Time (p50) | Target Lead Time (p95) |
|----------|----------------------|----------------------|
| P0 (critical) | < 1 day | < 2 days |
| P1 (high) | < 3 days | < 1 sprint |
| P2 (medium) | < 2 sprints | < 3 sprints |
| P3 (low) | < 4 sprints | < 6 sprints |

## Burndown / Burnup Tracking

### Sprint Burndown

Tracks remaining story points vs. time within a sprint:

```
remaining_points = total_planned_points - SUM(completed_points)
```

Visualized as a line chart with:
- Ideal burndown line (linear from total_points to 0 over sprint duration)
- Actual burndown line (daily remaining points)
- Buffer zone (last 20% of sprint for spillover)

### Sprint Burnup

Tracks total completed points + remaining points over time:

```
completed_points = SUM(done task points)
total_points = completed_points + in_progress_points + remaining_points
```

### Release Burndown

Tracks remaining story points across multiple sprints toward a release target:

```
release_remaining = release_total_points - SUM(completed_points across all sprints)
projected_completion_sprints = release_remaining / rolling_avg_velocity
```

### Metrics Derived from Burndown/Burnup

| Metric | Calculation | Interpretation |
|--------|------------|----------------|
| Scope change | Delta in total_points during sprint | Requirement instability |
| Completion rate | completed_points / sprint_days_elapsed | Delivery pace |
| Forecast accuracy | actual_completion_sprint vs planned | Planning precision |
| Buffer consumption | buffer_used / buffer_allocated | Risk exposure |
| Velocity trend | Slope of release burndown over sprints | Increasing/decreasing throughput |
