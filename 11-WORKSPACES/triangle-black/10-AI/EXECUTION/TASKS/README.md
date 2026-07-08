# Task Decomposition

## Overview

Task decomposition is the process of breaking user stories into discrete, assignable engineering tasks. Each task represents a unit of work that can be independently estimated, assigned, executed, and verified. Proper decomposition ensures that stories are deliverable by AI agents and human engineers working in parallel, with clear boundaries and well-defined interfaces between tasks.

## How Stories Are Decomposed Into Tasks

The decomposition process follows a structured approach:

1. **Story Analysis** — Review the story description, acceptance criteria, BDD scenarios, and technical notes.
2. **Task Identification** — Identify all discrete activities required to implement the story. Consider the full technology stack: backend, frontend, database, testing, documentation, and configuration.
3. **Task Sequencing** — Determine dependencies between tasks. Identify tasks that can run in parallel vs those that must be sequential.
4. **Effort Estimation** — Estimate each task in hours. Standard effort ranges are defined per task type.
5. **Assignment** — Assign each task to the appropriate AI agent or human engineer based on agent capabilities and specialization.
6. **Quality Gate Definition** — Define the quality gates for each task: test coverage, review requirements, acceptance criteria.
7. **Task Registration** — Register tasks in the task tracking system, linked to their parent story.

### Decomposition Example

```
User Story: US-042 — Agent RBAC Configuration
│
├── T-042-01 [Database]   Create agent_roles migration         (2h)
├── T-042-02 [Backend]    Implement role CRUD API endpoints     (6h)
├── T-042-03 [Backend]    Implement permission assignment logic (4h)
├── T-042-04 [Backend]    Implement RBAC enforcement middleware  (5h)
├── T-042-05 [Frontend]   Create role management page           (6h)
├── T-042-06 [Frontend]   Add agent-role assignment UI          (4h)
├── T-042-07 [QA]         Write unit tests for RBAC services    (3h)
├── T-042-08 [QA]         Write integration tests for API       (3h)
├── T-042-09 [Security]   Review RBAC authorization logic       (2h)
├── T-042-10 [Docs]       Update RBAC API documentation         (1h)
└── T-042-11 [Review]     Code review all changes               (2h)
```

## Task Taxonomy by Type

| Type          | Category     | Description                                     | Typical Effort |
|---------------|-------------|-------------------------------------------------|----------------|
| Backend       | Development | API endpoints, services, business logic         | 2–8 hours      |
| Frontend      | Development | Pages, components, state management, styling    | 2–8 hours      |
| Database      | Data        | Migrations, schema changes, indexes, seed data  | 1–4 hours      |
| QA            | Testing     | Unit, integration, E2E tests, exploratory       | 1–6 hours      |
| Security      | Assurance   | Reviews, validation, vulnerability scanning     | 1–3 hours      |
| Documentation | Knowledge   | API docs, runbooks, changelogs                  | 1–3 hours      |
| Review        | Governance  | Architecture, code, security, performance       | 1–2 hours      |

## Task Lifecycle

Each task progresses through the following states:

1. **Open** — Task is defined, estimated, and awaiting assignment.
2. **Assigned** — An owner (human or AI agent) has been designated.
3. **In Progress** — Active development work is underway.
4. **In Review** — Development is complete; awaiting quality gate verification.
5. **Completed** — All quality gates have been satisfied; task accepted.
6. **Blocked** — Task cannot proceed due to an unresolved dependency or impediment.

### Lifecycle Rules

- Tasks may transition from Open to Assigned only when all input dependencies are satisfied.
- A task in In Review must pass all quality gates before transitioning to Completed.
- Blocked tasks must include a reason and action plan.
- A Completed task contributes to its parent story's completion progress.
- A story is Ready for Review only when all its tasks are Completed.

## Task Dependency Management

Dependencies between tasks are explicitly documented with the following types:

| Dependency Type | Description                                  | Example                                              |
|----------------|----------------------------------------------|------------------------------------------------------|
| Blocks         | This task must finish before another starts  | Database migration must complete before backend API  |
| Depends On     | This task requires another to finish first   | Frontend page depends on backend endpoint            |
| Related To     | Tasks are related but not blocking           | Unit tests and integration tests for the same module |

## Quality Gates

Each task type has pre-defined quality gates that must be satisfied before a task can be marked Completed:

- **Backend Tasks**: Tests pass, code reviewed, API contract aligned, security reviewed.
- **Frontend Tasks**: Responsive design verified, accessibility checked, integration tested.
- **Database Tasks**: Migration tested forward and rollback, no data loss.
- **QA Tasks**: Test coverage threshold met, no regressions, flaky tests resolved.
- **Security Tasks**: All findings addressed or accepted with risk documentation.
- **Documentation Tasks**: Accuracy verified, links validated, formatting consistent.
- **Review Tasks**: All checklist items addressed, findings resolved or escalated.
