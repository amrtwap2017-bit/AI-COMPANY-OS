# Continuous Planning

## Purpose

Continuous planning moves beyond the traditional sprint planning event. Instead of a single point-in-time planning session, planning is a continuous activity where near-term plans are detailed and long-term plans are kept at the appropriate level of abstraction. Plans are adjusted dynamically based on velocity trends, feedback loops, and changing business conditions.

## Rolling Wave Planning

Rolling wave planning acknowledges that the further ahead you plan, the less accurate your plan becomes. Instead of planning everything in detail upfront, the team plans in waves:

- **Near-term (Daily)**: Detailed, task-level planning.
- **Short-term (Sprint)**: Story-level planning with acceptance criteria.
- **Medium-term (Quarter)**: Epic-level planning with objectives and key results.
- **Long-term (Annual)**: Program-level planning with strategic themes.

### Planning Horizons

| Horizon | Timeframe | Detail Level | Reviewed | Adjusted |
|---------|-----------|--------------|----------|----------|
| Daily | Today | Task-level (hours) | Daily standup | Continuously |
| Sprint | 2 weeks | Story-level (points) | Sprint planning | Per sprint |
| Quarterly | 3 months | Epic-level | Quarterly review | Monthly |
| Annual | 12 months | Program themes | Annual planning | Quarterly |

### Daily Planning (Task Level)

- **When**: During daily standup and continuously through the day.
- **Who**: Individual team members, guided by AI agents.
- **What**: Break down in-sprint stories into individual tasks. Assign work based on skill, availability, and priority.
- **AI agent role**: Suggests task breakdown, identifies blocked items, reassigns work when priorities shift.

### Sprint Planning (Story Level)

- **When**: First day of each sprint (2-hour timebox).
- **Who**: Entire team.
- **What**:
  1. Review team velocity (last 3 sprints rolling average).
  2. Review top-priority Ready items from the backlog.
  3. Commit to a sprint goal (single measurable outcome).
  4. Select stories for the sprint based on capacity.
  5. Break down selected stories into tasks.
  6. Assign initial owners.
- **AI agent role**: Suggests capacity allocation, predicts completion likelihood based on historical velocity, flags items that may overrun.

### Quarterly Planning (Epic Level)

- **When**: Last week of each quarter (half-day offsite or virtual session).
- **Who**: Full program team, product management, stakeholders.
- **What**:
  1. Review previous quarter's achievements against OKRs.
  2. Review velocity trends and team capacity projections.
  3. Prioritize epics for the upcoming quarter.
  4. Define measurable objectives and key results.
  5. Identify cross-team dependencies and align on sequencing.
  6. Resource planning and staffing adjustments.
- **AI agent role**: Synthesizes historical data, provides capacity projections, suggests dependency resolution sequencing.

### Annual Planning (Program Level)

- **When**: Last month of the year (1-2 day session).
- **Who**: Program leadership, stakeholders, team representatives.
- **What**:
  1. Review annual performance against program objectives.
  2. Define strategic themes for the upcoming year.
  3. High-level roadmap definition by quarter.
  4. Budget and resource allocation.
  5. Technology strategy decisions.
  6. Organizational changes (if any).
- **AI agent role**: Provides comprehensive data analysis, trend projections, and historical comparison reports.

## Dynamic Plan Adjustment

Plans are not static — they adjust continuously based on:

### Velocity-Based Adjustment

- At the end of each sprint, actual velocity is compared to planned velocity.
- If variance exceeds ±20%, the next sprint's capacity is adjusted accordingly.
- The rolling average velocity (last 3 sprints) is used for capacity planning, not the single most recent sprint.

### Feedback-Driven Adjustment

| Feedback Source | Adjustment Action | Frequency |
|-----------------|-------------------|-----------|
| Sprint retrospective | Process changes, impediment removal | Per sprint |
| Metrics dashboard | Capacity recalibration, priority shifts | Weekly |
| Incident post-mortem | Architectural changes, tech debt addition | As needed |
| Stakeholder feedback | Priority reordering, scope changes | As needed |
| Market changes | Strategic realignment | Quarterly |

### Bottleneck-Driven Adjustment

When pipeline bottlenecks are detected (via Cycle Time, Lead Time, or DORA metrics), the plan is adjusted to allocate capacity for bottleneck resolution:

1. Bottleneck identified (e.g., long review times).
2. Root cause analyzed (e.g., insufficient reviewers).
3. Plan adjusted (e.g., allocate reviewer capacity, pair programming).
4. Improvement measured (e.g., review time decrease tracked).

## Planning Artifacts

| Artifact | Owner | Updated | Detail |
|----------|-------|---------|--------|
| Program Roadmap | Program Manager AI | Quarterly | Epics by quarter, dependencies, milestones |
| Sprint Backlog | Team | Per sprint | Committed stories with tasks |
| Epic Overview | Product Owner AI | Continuously | Epic scope, acceptance criteria, timeline |
| OKR Tracker | Program Manager AI | Monthly | Progress against quarterly OKRs |
| Velocity Chart | Automated | Per sprint | Planned vs. actual velocity trend |
| Capacity Plan | Program Manager AI | Per sprint | Team capacity allocation by skill area |

## Principles

| Principle | Description |
|-----------|-------------|
| **Plan just enough** | Detail matches the horizon. Near-term is detailed, long-term is high-level. |
| **Adapt, don't predict** | Plans are hypotheses. Adjust based on data, not guesses. |
| **Plans are commitments, not promises** | Sprint plans are committed. Quarterly plans are directional. Annual plans are aspirational. |
| **Transparency** | All plans are visible to all team members and stakeholders. |
| **Data-driven adjustment** | Changes to plans are supported by metric trends, not opinions. |
