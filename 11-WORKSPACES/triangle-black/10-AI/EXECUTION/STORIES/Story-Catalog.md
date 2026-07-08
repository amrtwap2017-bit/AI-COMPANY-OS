# Story Catalog Management

## Overview

The Story Catalog is the centralized registry of all user stories across the program. It provides a single source of truth for story status, ownership, and progress. The catalog enables teams to track velocity, identify bottlenecks, manage dependencies, and generate program-level insights.

## Catalog Fields

Each story in the catalog is represented by a record with the following fields:

| Field         | Type      | Description                                              | Example                |
|---------------|-----------|----------------------------------------------------------|------------------------|
| ID            | String    | Unique story identifier                                  | US-042                |
| Title         | String    | Short descriptive name                                   | Agent RBAC Configuration |
| Feature       | String    | Parent feature ID                                        | F-021                 |
| Feature Name  | String    | Parent feature name                                      | Identity & Access Mgmt |
| Epic          | String    | Parent epic ID (optional)                                | E-003                 |
| Status        | Enum      | Current lifecycle stage                                  | Ready                 |
| Priority      | Enum      | Business priority (Critical, High, Medium, Low)          | High                  |
| MoSCoW        | Enum      | Must Have / Should Have / Could Have / Won't Have        | Must Have             |
| Story Points  | Integer   | Effort estimate in story points                          | 5                     |
| Sprint        | String    | Sprint where the story is scheduled                      | Sprint 4              |
| Owner         | String    | Person or AI agent assigned                              | Agent-alpha           |
| Reviewer      | String    | Person responsible for acceptance review                 | jdoe                  |
| Dependencies  | List[String] | IDs of stories this one depends on                     | US-039, US-040        |
| Created       | Date      | Draft date                                                | 2026-06-15            |
| Target Release| String    | Intended release version                                  | v1.2.0                |
| Labels        | List[String] | Tags for filtering (e.g., backend, frontend, security) | [backend, security]   |

## Catalog Views and Filters

The catalog supports multiple views to aid different stakeholder perspectives:

### By Status

Filter stories by lifecycle stage to track workflow balance.

| View               | Purpose                                      |
|--------------------|----------------------------------------------|
| Backlog            | All stories not yet in a sprint              |
| Ready              | Stories ready for development                |
| In Progress        | Stories currently being worked               |
| In Review          | Stories awaiting validation                  |
| Done (This Sprint) | Stories completed in the current iteration   |

### By Priority

View stories ranked by business importance.

- Critical — Requires immediate attention; blocks release.
- High — Core release functionality.
- Medium — Important but can defer.
- Low — Nice-to-have enhancement.

### By Feature

Group stories under their parent feature to assess feature-level completeness.

```
Feature: Identity & Access Management (F-021)
  ├── US-038: User authentication with SSO (Done)
  ├── US-039: Role catalog management (Done)
  ├── US-040: Permission definition (In Review)
  ├── US-041: Agent identity registration (In Progress)
  └── US-042: Agent RBAC configuration (Ready)
```

### By Dependencies

View dependency chains to identify blocking paths and critical paths.

```
US-042 → depends on US-039, US-040
       → blocks US-043, US-044
```

### By Sprint

Sprint-level views show committed stories, progress, and burndown.

| Story   | Points | Status      | Owner        | Remaining Hours |
|---------|--------|-------------|--------------|-----------------|
| US-042  | 5      | In Progress | Agent-alpha  | 6               |
| US-043  | 3      | In Review   | Agent-beta   | 0               |
| US-044  | 8      | Ready       | Agent-gamma  | 16              |

## Catalog Management Rules

- Every story must be registered in the catalog before work begins.
- Status transitions must follow the lifecycle defined in the User Story Management README.
- Status changes must be recorded with a timestamp and the identity of the person or agent making the change.
- Stories cannot skip lifecycle stages (e.g., Draft → In Progress without passing through Ready).
- The catalog must be synchronized with the task decomposition registry at least daily.
- Catalog records are immutable for audit purposes; status changes create new revision records.
- A story may be closed only when marked Done or Rejected.
- Rejected stories must include a reason and reference any replacement stories.

## Reporting

Standard reports derived from the catalog:

- **Velocity Report** — Story points completed per sprint, trailing 8-week average.
- **Flow Efficiency** — Time from Ready to Done vs total elapsed time.
- **Dependency Heat Map** — Stories blocked by dependencies, aggregated by feature.
- **Aged Items** — Stories that have been in the same state beyond a threshold (e.g., In Review > 3 days).
- **Feature Completion** — Percentage of stories Done per feature, by count and by points.
