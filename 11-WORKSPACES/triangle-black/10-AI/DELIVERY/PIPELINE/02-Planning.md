# Stage 02: Planning

## Purpose

Take an approved requirement and produce an estimated, assigned, and prioritized sprint backlog item that is ready for development.

## Agent Role

**Program Manager AI** — Responsible for estimation, sprint assignment, and task decomposition.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Approved Requirement | Requirement artifact has status `APPROVED` |
| Sprint Capacity Known | Current sprint capacity and future sprint slots are available |
| Team Composition Known | Available AI agent roles and their specializations are identified |

## Process

### Step 1: Decompose Requirement into Tasks
- Break the requirement into granular, estimable tasks (2-8 hours each).
- Identify task types: schema change, service method, API endpoint, UI component, test, docs.
- Map each task to the appropriate AI agent role (Backend, Frontend, Database, etc.).

### Step 2: Estimate Effort
- Use story points (Fibonacci: 1, 2, 3, 5, 8, 13, 21).
- Base estimates on: complexity, ambiguity, known patterns vs. novel work.
- Record estimation confidence (High/Medium/Low).

### Step 3: Assign to Sprint
- Determine target sprint based on priority and capacity.
- If the current sprint has capacity, assign there. Otherwise, assign to the next sprint with room.
- Ensure no single agent role is overloaded within a sprint.

### Step 4: Create Sprint Backlog Item
- Write the sprint backlog item artifact to `.sprint-item.md`.
- Include: title, description, linked requirement ID, task list, estimates, assignments.
- Set sprint name and due date.

### Step 5: Validate Dependencies
- Check task dependencies are ordered correctly (e.g., schema before backend).
- Verify no circular dependencies between tasks.
- Flag any external dependencies that may block the sprint.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Sprint Backlog Item Created | Artifact with all tasks, estimates, and assignments |
| Tasks Non-Overlapping | Each task assigned to one and only one agent role |
| Estimates Complete | All tasks have story point estimates |
| Dependency Graph Valid | No circular or missing dependencies |
| Capacity Checked | Total sprint points do not exceed team capacity |

## Artifact Template

```markdown
# Sprint Backlog Item: <Title>

**Requirement**: `REQ-<ID>`
**Sprint**: S-<number>
**Status**: APPROVED | CHANGES_REQUESTED | REJECTED
**Priority**: P0 | P1 | P2 | P3

## Description
<brief summary>

## Tasks
| # | Task | Role | Est. (pts) | Dependencies |
|---|------|------|-----------|--------------|
| 1 | ... | Backend | 3 | None |

## Assignments
- Backend: @backend-lead
- Frontend: @frontend-lead
- Database: @database-architect

## Risk Flags
- <any identified risks or blockers>
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Task exceeds 8 hours | Split into smaller tasks |
| Conflicting dependencies | Reorder tasks or flag for architecture review |
| Overloaded sprint | Move lowest-priority item to next sprint |
| Missing role for a task | Identify alternative agent or request human oversight |

## Cross-References

- [01-Requirement.md](./01-Requirement.md)
- [Pipeline README](./README.md)
