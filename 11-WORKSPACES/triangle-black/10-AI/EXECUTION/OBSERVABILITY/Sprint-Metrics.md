# Sprint Metrics

## Purpose

Sprint metrics measure the team's ability to plan accurately, execute consistently, and deliver value within a fixed timebox. These metrics inform sprint planning, retrospective discussions, and the continuous improvement of the team's delivery process.

## Metrics

### Velocity (Planned vs. Actual)

- **Definition**: The amount of work (in story points or ideal hours) completed in a sprint compared to what was planned.
- **Measurement**:
  - **Planned velocity**: Sum of story points for all committed stories at sprint start.
  - **Actual velocity**: Sum of story points for all completed stories at sprint end (stories must meet the Definition of Done).
- **Tools**: Sprint tracking tool (Jira, Linear, Azure DevOps).
- **Target**: Actual velocity within ±20% of planned velocity. Trend line should be stable or improving.
- **Reporting**: Tracked as a rolling average over the last 3-5 sprints. Used for capacity planning, not performance evaluation.

### Velocity Trend

- **Definition**: The moving average of actual velocity over the last 3 to 5 sprints.
- **Measurement**: Rolling average of actual velocity. Also track standard deviation to assess consistency.
- **Target**: Stable or gradually increasing trend. Sudden drops or spikes warrant investigation.
- **Actionable insights**: A declining velocity trend may indicate technical debt accumulation, team morale issues, or process bottlenecks. Increasing velocity combined with stable quality is a positive signal.

### Story Completion Percentage

- **Definition**: Percentage of committed stories that are fully completed (meet Definition of Done) by sprint end.
- **Measurement**: `(completed stories / committed stories) * 100`
- **Tools**: Sprint tracking tool.
- **Target**: ≥ 85%.
- **Actionable insights**: Low completion rates suggest overcommitment or unexpected blockers. Consistently high rates may indicate the team is under-committing.

### Task Completion Percentage

- **Definition**: Percentage of individual tasks (sub-tasks, not just stories) completed within the sprint.
- **Measurement**: `(completed tasks / total tasks in sprint) * 100`
- **Tools**: Sprint tracking tool.
- **Target**: ≥ 90%.
- **Note**: This is a finer-grained view than story completion. Tasks left incomplete on completed stories may indicate poor decomposition or scope creep.

### Sprint Goal Achievement

- **Definition**: Whether the sprint goal (the single, measurable outcome the team commits to) was achieved.
- **Measurement**: Binary assessment (achieved / not achieved) by the team at sprint review.
- **Target**: ≥ 80% of sprints achieve their sprint goal.
- **Reporting**: Tracked as a rolling percentage over the program. Sprint goals that are consistently not achieved may indicate that goals are too ambitious or poorly defined.

### Scope Change Rate

- **Definition**: Percentage of scope added, removed, or modified after sprint planning is complete.
- **Measurement**:
  - **Scope added**: `(points added after planning / points at planning) * 100`
  - **Scope removed**: `(points removed after planning / points at planning) * 100`
  - **Net scope change**: `scope added - scope removed`
- **Tools**: Sprint tracking tool audit log.
- **Target**: Net scope change < 15%.
- **Actionable insights**: High scope change rates indicate incomplete requirements gathering, external pressure, or poor stakeholder alignment. Frequent scope additions without removals indicate the team is taking on more work mid-sprint.

### Blocked Time Percentage

- **Definition**: Percentage of total sprint time during which work items are blocked by external dependencies or impediments.
- **Measurement**: `(sum of blocked hours for all items / (team size * sprint hours)) * 100`
- **Tools**: Sprint tracking tool (blocked flag with timestamps).
- **Target**: < 5% of total sprint capacity.
- **Reporting**: Track blocked time by category (external dependency, environment issue, requirement clarification, tooling).

## Measurement and Reporting

### Sprint Dashboard

The sprint dashboard should display:

- Planned vs. actual velocity (bar chart, sprint-over-sprint)
- Story and task completion percentages (gauges)
- Sprint goal achievement status (traffic light)
- Scope change burndown (original vs. current scope overlay)
- Blocked time by category (stacked bar)
- Velocity trend (line chart, 3-5 sprint rolling)

### Sprint Review Reporting

At each sprint review, present:

1. Sprint goal — was it achieved?
2. Planned vs. actual velocity
3. Story completion percentage
4. Scope changes (added and removed)
5. Key blockers and how they were resolved
6. One metric to improve next sprint (chosen by the team)

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| Low completion rate | Reduce WIP limit, improve task decomposition, identify recurring blockers |
| High scope change | Stricter change control during sprint, improve backlog refinement |
| Low sprint goal achievement | Make sprint goals smaller and more focused, involve whole team in goal definition |
| High blocked time | Address top blocking categories, create an impediment removal process |
| Inconsistent velocity | Standardize story point estimation, improve Definition of Done consistency |
| Declining velocity trend | Investigate technical debt, team dynamics, or process fatigue |
