# Feature Catalog

## Overview

The Feature Catalog is the centralized registry for all features within the program. It provides end-to-end visibility into what features exist, their current status, and their relationships to epics and delivery sprints. The catalog enables effective portfolio management, progress tracking, and reporting.

## Feature Organization

### Taxonomy

Features are organized hierarchically:

```
Program
 ├── Epic 1
 │    ├── Feature 1
 │    ├── Feature 2
 │    └── Feature 3
 ├── Epic 2
 │    ├── Feature 4
 │    └── Feature 5
 └── Epic 3
      ├── Feature 6
      ├── Feature 7
      └── Feature 8
```

### Classification Dimensions

Features can be classified along multiple dimensions:
- **Type:** Functional, Non-functional, Technical, Data, Integration, UX
- **Value Category:** Revenue, Cost, Experience, Efficiency, Compliance, Risk
- **Domain:** Business capability area from Program 1

## Catalog Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Feature ID | String | Yes | Unique identifier (FEAT-{NNN}) |
| Title | String | Yes | Concise feature name |
| Epic ID | String | Yes | Parent epic identifier |
| Epic Name | String | Yes | Parent epic name |
| Description | Text | Yes | Feature summary |
| Status | Enum | Yes | Current lifecycle state |
| Priority | Enum | Yes | P0, P1, P2, or P3 |
| Value Score | Number | Yes | Composite value score (0-100) |
| Effort Estimate | String | Yes | T-shirt size or story points |
| Feature Owner | String | Yes | Responsible individual |
| Sprint | String | No | Assigned sprint or TBD |
| Release | String | No | Target release |
| Dependencies | List | No | Key dependency references |
| Risk Level | Enum | Yes | High, Medium, Low |
| Completion % | Percentage | No | Delivery progress |
| Created Date | Date | Yes | Registration date |
| Last Updated | Date | Yes | Last modification date |
| Planned Start | Date | No | Planned sprint start |
| Planned End | Date | No | Planned sprint end |
| Actual End | Date | No | Actual completion date |
| Acceptance Status | Enum | No | Pending, Accepted, Rejected |

## Catalog Template

```yaml
Feature ID: FEAT-{NNN}
Title: {Feature Title}
Epic ID: EPIC-{NNN}
Epic Name: {Epic Title}
Status: identified | defined | planned | in_progress | completed | deployed | measured
Priority: P0 | P1 | P2 | P3
Value Score: {0-100}
Effort: {XS | S | M | L | XL}
Feature Owner: {Name}
Sprint: {Sprint name or TBD}
Release: {Release name or TBD}
Risk Level: High | Medium | Low
Completion: {0-100%}
Dependencies: [DEP-{NNN}, DEP-{NNN}]
Created: {YYYY-MM-DD}
Last Updated: {YYYY-MM-DD}
Planned Start: {YYYY-MM-DD}
Planned End: {YYYY-MM-DD}
Actual End: {YYYY-MM-DD}
Acceptance Status: Pending | Accepted | Rejected
```

## Feature Tracking

Features are tracked across their lifecycle with the following key events:

| Event | Trigger | Data Captured |
|-------|---------|---------------|
| Registration | Feature identified from epic decomposition | ID, title, epic link, owner |
| Definition Complete | Feature template filled | All template fields |
| Sprint Assignment | Feature planned into sprint | Sprint, release, planned dates |
| Development Start | First commit or story start | Actual start date |
| Development Complete | All stories closed | Completion percentage |
| Testing Complete | All acceptance criteria verified | Quality metrics |
| Deployment | Feature released | Deployment date, environment |
| Measurement | Post-deployment value check | Value metrics, adoption data |

## Reporting

### Standard Reports

- **Feature Completion Rate:** Features completed per sprint vs. planned
- **Feature Cycle Time:** Average time from sprint start to deployment
- **Feature Quality:** Pass/fail rate against acceptance criteria
- **Feature Count by Status:** Distribution across lifecycle states
- **Feature Count by Priority:** Distribution across priority tiers
- **Feature Count by Epic:** Feature breakdown per epic
- **Sprint Feature Load:** Features assigned per sprint

### Custom Queries

The catalog supports filtering and grouping by any field:
- Features by owner
- Features by risk level
- Features by value score range
- Overdue features (past planned end date)
- Features without sprint assignment
- Features with dependencies

## Catalog Governance

| Activity | Cadence | Responsible |
|----------|---------|-------------|
| Data quality check | Weekly | Program Manager |
| New feature intake | Continuous | Product Owner |
| Feature reassignment | As needed | Program Manager |
| Stale feature review | Bi-weekly | Product Owner |
| Catalog cleanup | Monthly | Program Manager |
| Full catalog audit | Quarterly | Program Manager |

## Data Quality Rules

- Every feature must link to an approved epic
- Status must be updated within 1 business day of any change
- Sprint assignment must be updated by sprint planning
- Completion percentage must reflect story completion status
- Features with no updates for 14 days are flagged for review
- Duplicate features must be merged or removed within 5 business days
