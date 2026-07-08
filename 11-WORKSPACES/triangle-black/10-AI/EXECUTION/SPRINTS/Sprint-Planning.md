# Sprint Planning

## Overview

Sprint Planning is the opening event of every sprint. The Program Manager AI, with input from AI agents and human stakeholders, selects the backlog items to be delivered in the upcoming sprint and decomposes them into executable tasks assigned to specific AI agents.

**Duration: 2 hours maximum** for a standard 2-week sprint. Shorter sprints (1 week) use a 1-hour planning window.

## Inputs

| Input | Source | Description |
|---|---|---|
| **Program Backlog** | Program Backlog (maintained by Program Manager AI) | All known features, epics, and technical work items with priority, estimate, and dependencies |
| **Prioritized Epics/Features** | Program Backlog (top of backlog) | Items selected by business value, risk reduction, or dependency order |
| **Team Capacity** | Velocity & Capacity Planning | Available story points for the sprint based on historical velocity minus buffer |
| **Definition of Ready** | Team Operating Agreement | Criteria that backlog items must meet before they can be selected into a sprint |
| **Sprint Templates** | Sprint 0 deliverable | Reusable planning artifacts and task decomposition patterns |

## Definition of Ready

A backlog item is eligible for sprint selection only when:

- [ ] Clear, testable acceptance criteria are defined.
- [ ] Dependencies are identified and resolved or documented as risks.
- [ ] Effort estimate (story points) is assigned.
- [ ] Technical approach is outlined (sufficient for task decomposition).
- [ ] Stakeholder approval for priority is confirmed.
- [ ] No blockers or open questions that prevent execution.

## Activities

### Step 1: Capacity Confirmation (15 min)

- Retrieve current team velocity from the last 3-5 sprints (or use initial estimate for early sprints).
- Apply 20% buffer for defects, unplanned work, and overhead.
- Calculate available capacity = `velocity × (1 - buffer)`.
- Confirm any planned holidays, reduced availability, or environment downtime.

### Step 2: Backlog Item Selection (30 min)

- Review top-of-backlog items in priority order.
- For each item, confirm it meets Definition of Ready.
- Estimate item contribution toward the sprint goal.
- Select items until total estimated story points equal available capacity.
- If a high-priority item exceeds remaining capacity, do not carry it over; it becomes the top candidate for the next sprint.

### Step 3: Sprint Goal Definition (15 min)

- Draft the sprint goal: a single, concise statement of the sprint's unifying objective.
- The sprint goal is not a list of features — it is the business outcome or capability being delivered.
- Examples:
  - "Enable users to complete the self-service onboarding flow end-to-end."
  - "Achieve PCI DSS compliance for the payment processing module."
  - "Reduce API p95 latency below 200ms for the search endpoint."
- Ensure all selected backlog items align with and contribute to the sprint goal.

### Step 4: Task Decomposition (45 min)

- Decompose each selected backlog item into granular, executable tasks.
- Each task must map to one agent and produce one deliverable.
- Task sizing guideline: 2-8 hours of effort. Tasks larger than 8 hours must be further decomposed.
- For each task, specify:
  - Task ID, title, description
  - Assigned AI agent
  - Dependencies (tasks that must be completed first)
  - Estimated effort (hours)
  - Quality gate criteria (tests, lint, security scan, documentation)
  - Acceptance criteria

### Step 5: Dependency and Risk Review (10 min)

- Review task dependencies across agents. Identify any agent that is blocked by another agent's task.
- Adjust sequencing or add buffer where cross-agent dependencies exist.
- Identify top 3 risks for the sprint and document mitigation strategies.

### Step 6: Final Review and Commitment (5 min)

- Summarize the sprint backlog, sprint goal, and capacity allocation.
- Confirm that total task hours do not exceed agent capacity.
- Commit the sprint backlog to version control.
- Broadcast the sprint plan to all stakeholders.

## Outputs

| Output | Description | Format |
|---|---|---|
| **Sprint Backlog** | Selected backlog items with decomposed tasks, assignments, estimates, and acceptance criteria | Structured file (YAML/JSON/table) in sprint tracking system |
| **Sprint Goal** | Single unifying objective statement | Plain text, prominently displayed in dashboards and daily reports |
| **Capacity Plan** | Per-agent allocation showing tasks, estimated hours, and available capacity | Table with agent rows and task columns |

## Sprint Backlog Template

```
Sprint: [Sprint Number]
Sprint Goal: [Goal Statement]
Capacity: [Total story points] points ([N] points velocity - 20% buffer)

Backlog Items:
  - [BI-001]: [Title] ([N] points)
  - [BI-002]: [Title] ([N] points)

Tasks:
  | Task ID | Item | Title | Agent | Est. Hours | Deps | Quality Gates |
  |---------|------|-------|-------|------------|------|---------------|
  | T-001   | BI-001 | [description] | [agent] | 4 | none | unit tests, lint |
  | T-002   | BI-001 | [description] | [agent] | 6 | T-001 | integration tests, docs |
  ...
```

## Rules of Sprint Planning

1. **No mid-sprint scope changes.** Once planning is complete and the sprint begins, no new backlog items are added. If something urgent arises, either it waits, or the sprint is terminated early (see Sprint Lifecycle — Escaping a Sprint).
2. **Capacity is a hard constraint.** Do not oversprint the team. Under-commitment is preferable to over-commitment.
3. **Every task has exactly one owner.** If a task requires multiple agents, split it into sub-tasks.
4. **The sprint goal is non-negotiable.** All backlog items must support the sprint goal. Items that do not must be deferred.
