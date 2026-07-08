# Automated Task Generation

## Overview

The Program Manager AI automatically generates granular, actionable tasks from high-level requirements. Task decomposition transforms ambiguous requirements into structured, assignable work items with clear acceptance criteria, dependencies, and effort estimates.

## Task Decomposition Rules

### Decomposition Granularity

Requirements are decomposed according to the INVEST principle for task quality:

- **Independent**: Each task should be self-contained with minimal external dependencies
- **Negotiable**: Task scope allows flexibility in implementation approach
- **Valuable**: Each task delivers measurable value independently
- **Estimable**: Task size is small enough for reliable estimation (max 8 story points)
- **Size-appropriate**: Tasks exceeding 13 story points are further decomposed
- **Testable**: Clear pass/fail criteria are defined for each task

### Decomposition Strategy

| Requirement Type | Decomposition Approach | Typical Task Count |
|-----------------|----------------------|-------------------|
| Feature | Split by architectural layer (UI, API, domain, data) | 5-15 tasks |
| Epic | Split by feature subset, then by layer | 20-50 tasks |
| Bug fix | Single task with reproduction steps | 1-2 tasks |
| Technical debt | Split by module/component | 3-10 tasks |
| Spike/research | Single investigation task with timebox | 1 task |
| Integration | Split by integration points, then by layer | 3-8 tasks |

### Mandatory Splitting Points

Tasks MUST be split at these boundaries:

1. **Architectural layer boundary**: UI logic, API/controller, domain/business logic, data/persistence
2. **Component/module boundary**: Different modules should be separate tasks
3. **Technology stack boundary**: Frontend vs backend vs infrastructure
4. **Authentication/authorization boundary**: Security implementation in separate tasks
5. **Data model change boundary**: Schema migrations separate from business logic
6. **Third-party integration boundary**: External API integration separated from core logic

## Task Format

Each generated task follows a strict schema:

```yaml
id: TSK-{sprint}-{sequence}
title: "[{component}] {short description}"
description: |
  ## Description
  {detailed description of what needs to be done}

  ## Acceptance Criteria
  - [ ] {criterion 1}
  - [ ] {criterion 2}
  - [ ] {criterion 3}

  ## Technical Notes
  {implementation guidance, relevant files, patterns to follow}

  ## Definition of Done
  - [ ] Code written and committed
  - [ ] Unit tests passing (>=80% coverage on new code)
  - [ ] Integration tests passing
  - [ ] Code review approved
  - [ ] Documentation updated (if applicable)

priority: {P0|P1|P2|P3}
component: "{component-name}"
type: {feature|bug|refactor|chore|spike}
story_points: {1|2|3|5|8|13}
dependencies:
  - TSK-{dependency-id}
assigned_to: "{ai-role|unassigned}"
labels:
  - {label-1}
  - {label-2}
created_at: "{timestamp}"
source_requirement: "{REQ-ID}"
```

## Dependency Detection

### Automated Dependency Analysis

The system detects task dependencies through multiple strategies:

1. **Artifact Dependency**: Tasks modifying the same file/module are sequential or require merge coordination
2. **Data Dependency**: Task producing data consumed by another task creates a producer-consumer dependency
3. **Interface Dependency**: Task defining an interface must precede tasks implementing against it
4. **Sequential Logic Dependency**: Tasks with logical ordering constraints (auth before authorized endpoints)
5. **Shared Resource Dependency**: Tasks contending for the same resource (test environment, API rate limit)
6. **Knowledge Dependency**: Task requiring output or learning from another task

### Dependency Graph

Dependencies are represented as a directed acyclic graph (DAG). The system:

1. Builds the dependency graph from all generated tasks
2. Validates for cycles; if cycles detected, splits or reorders tasks
3. Computes critical path (longest chain of dependent tasks)
4. Identifies parallelizable task clusters
5. Generates dependency-ordered task list

### Dependency Types

| Dependency | Effect | Example |
|------------|--------|---------|
| `blocks` | Task cannot start until dependency is done | API endpoint task blocks frontend integration task |
| `requires` | Task needs artifact from dependency | Data model task requires schema migration task |
| `informs` | Task should consider dependency's output | UI design task informs component implementation |
| `duplicates` | Tasks overlap; one should be merged | Two tasks modifying same validation logic |

## Effort Estimation

### Estimation Methodology

Effort is estimated in story points using a modified Fibonacci sequence (1, 2, 3, 5, 8, 13). The estimation model considers:

| Factor | Weight | Description |
|--------|--------|-------------|
| Complexity | 40% | Algorithmic/architectural complexity |
| Uncertainty | 25% | Ambiguity in requirements or approach |
| Effort magnitude | 20% | Expected lines of code or configuration |
| Risk | 15% | Known unknowns, integration risk |

### Estimation Formula

```
story_points = ROUND(SUM(complexity_score * 0.4 + uncertainty * 0.25 + effort * 0.20 + risk * 0.15), FIBONACCI_SCALE)
```

Where each factor is scored 1-5, and the weighted sum is mapped to the nearest Fibonacci number.

### Historical Calibration

Estimates are calibrated against historical velocity data:

1. After each sprint, compare estimated vs actual story points by task type
2. Calculate estimation accuracy = |actual - estimated| / estimated
3. Adjust estimation model weights when accuracy drops below 70%
4. Apply calibration factors per component/team (e.g., UI tasks historically take 1.2x estimate)

## Assignment Logic

### Role-Based Assignment

Tasks are assigned to the appropriate AI agent role based on task characteristics:

| Task Type | Assigned Role | Rationale |
|-----------|---------------|-----------|
| Feature implementation (UI) | Frontend Engineer AI | UI-specific expertise |
| Feature implementation (API) | Backend Engineer AI | API/domain logic expertise |
| Data model / persistence | Backend Engineer AI | Data layer expertise |
| Infrastructure / CI/CD | DevOps Engineer AI | Infrastructure expertise |
| Code review | Code Review AI | Review specialization |
| Documentation | Documentation Engineer AI | Documentation specialization |
| Test implementation | SDET AI | Testing specialization |
| Architectural decision | Architect AI | Cross-cutting design decisions |

### Load Balancing

When multiple tasks could be assigned to the same role, the system:

1. Orders tasks by priority (P0 first) within dependency constraints
2. Calculates total story points per role per sprint
3. Caps assignment at 125% of historical average throughput for that role
4. Surplus tasks are queued for next sprint
5. Considers task affinity (similar tasks to same assignee for efficiency)

### Unassignment Rules

Tasks are left unassigned when:

- Requirement ambiguity exceeds threshold (>3 unresolved clarification questions)
- Design decision required before implementation can begin
- Task is intentionally reserved for human assignment (marked `human-only`)
- Cross-cutting task requiring coordination between multiple roles
