# Feature Dependency Management

## Overview

Feature dependency management ensures that dependencies between features, teams, and external systems are identified, tracked, and resolved throughout the delivery lifecycle. Effective dependency management prevents delays, reduces risk, and enables smooth feature delivery.

## Dependency Types

### 1. Technical Dependencies
Dependencies on shared technical components, infrastructure, or platforms.

| Type | Example | Impact |
|------|---------|--------|
| Shared Service | Feature depends on a shared authentication service | Feature cannot function without the service |
| Infrastructure | Feature requires database migration | Delays until migration is complete |
| Platform | Feature requires a specific runtime version | Feature blocked until platform upgrade |
| Library | Feature uses a shared library with pending updates | Feature may require updated library version |

### 2. Data Dependencies
Dependencies on data availability, quality, or structure.

| Type | Example | Impact |
|------|---------|--------|
| Data Source | Feature requires data from an external API | Feature cannot be developed without API access |
| Data Migration | Feature depends on historical data migration | Incomplete migration blocks feature |
| Data Quality | Feature requires cleaned/standardized data | Quality issues cause feature defects |
| Data Schema | Feature depends on schema changes | Schema changes must precede feature work |

### 3. API Dependencies
Dependencies on internal or external APIs.

| Type | Example | Impact |
|------|---------|--------|
| Internal API | Feature consumes an API from another team | API changes can break the feature |
| External API | Feature depends on a third-party API | Third-party outages block feature |
| API Version | Feature requires API v2 | API v1 compatibility may be lost |
| API Contract | Feature depends on API contract agreement | Cannot proceed without defined contract |

### 4. UI Dependencies
Dependencies on shared UI components or design assets.

| Type | Example | Impact |
|------|---------|--------|
| Design Component | Feature uses a shared design component | Component updates affect feature |
| Design System | Feature requires new design system pattern | Pattern must be created first |
| UX Research | Feature depends on usability study results | Implementation may need to wait |
| Accessibility | Feature requires accessibility audit | Audit findings may require changes |

### 5. External Dependencies
Dependencies on entities outside the program or organization.

| Type | Example | Impact |
|------|---------|--------|
| Vendor | Feature requires vendor software or service | Vendor timelines outside control |
| Regulatory | Feature depends on regulatory approval | Cannot release until approved |
| Partner | Feature requires partner integration | Partner development timeline |
| Third-Party | Feature uses third-party data or service | Service changes affect feature |

## Dependency Mapping Template

```yaml
Dependency ID: DEP-{NNN}
Feature ID: FEAT-{NNN}
Title: {Dependency description}

Type:
  - {Technical | Data | API | UI | External}

Direction:
  - {Feature depends on} / {Depends on feature}

Source:
  Team: {Team name}
  System: {System name}
  Contact: {Contact person}

Target:
  Feature: FEAT-{NNN} or N/A
  Epic: EPIC-{NNN} or N/A
  External: {Organization name}

Timeline:
  Required By: {Date}
  Expected Resolution: {Date}
  Critical Path: {Yes/No}

Status: {Identified | In Progress | Resolved | Blocked | Mitigated}
Risk Level: {High | Medium | Low}
Mitigation Plan: {Description of mitigation approach}

Owner: {Name}
Last Updated: {Date}
```

## Dependency Tracking in Sprints

### Sprint Planning
During sprint planning, each feature's dependencies are reviewed:
1. Identify which dependencies are relevant to the current sprint
2. Confirm dependency status (Resolved / In Progress / Blocked)
3. Assign dependency resolution to specific owners
4. Create dependency tracking items in the sprint backlog
5. Document dependency risks and mitigation plans

### Daily Standup
During daily standups, dependency owners report:
- Progress toward dependency resolution
- Any blockers or delays
- Mitigation actions taken
- Changes in dependency risk level

### Sprint Review
During sprint reviews, dependency status is reported:
- Dependencies resolved during the sprint
- Dependencies that remain open
- New dependencies identified
- Dependency impact on feature delivery

### Dependency Risk Indicators

| Indicator | Status | Action Required |
|-----------|--------|----------------|
| Dependency on critical path, high risk | **Red** | Escalated to Program Manager; mitigation plan required |
| Dependency on critical path, low risk | **Yellow** | Active monitoring; mitigation plan prepared |
| Dependency not on critical path, any risk | **Yellow** | Routine tracking; standard mitigation |
| Dependency resolved or not applicable | **Green** | No action required |

## Dependency Resolution Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Avoid** | Redesign to eliminate the dependency | When dependency risk is high and alternative exists |
| **Mitigate** | Reduce dependency impact through buffers, fallbacks | When dependency cannot be avoided |
| **Transfer** | Move dependency ownership to another party | When another team is better positioned to resolve |
| **Accept** | Acknowledge and plan for dependency risk | When dependency risk is low and cannot be avoided |
| **Monitor** | Track dependency status without active intervention | When dependency is outside control |

## Dependency Escalation Path

| Level | Escalation To | Trigger | Response Time |
|-------|--------------|---------|---------------|
| L1 | Feature Owner | Dependency identified or at risk | Within 1 business day |
| L2 | Product Owner | Dependency blocking sprint delivery | Within 1 business day |
| L3 | Program Manager | Dependencies blocking multiple features | Within 4 hours |
| L4 | Steering Committee | Critical dependency delaying program milestone | Within 1 business day |

## Dependency Reporting

### Dependency Matrix
A cross-reference showing dependencies between all features in the current epic or release:

```
         │ FEAT-01 │ FEAT-02 │ FEAT-03 │ FEAT-04
─────────┼─────────┼─────────┼─────────┼─────────
FEAT-01  │    -    │    X    │         │
FEAT-02  │         │    -    │    X    │
FEAT-03  │    X    │         │    -    │
FEAT-04  │         │         │    X    │    -
```

**X = FEAT-{row} depends on FEAT-{column}**

### Dependency Aging Report
Lists all open dependencies sorted by age (days since identification). Highlights dependencies requiring immediate attention.

### Dependency Closure Rate
Percentage of dependencies resolved within their required timeline. Tracked per sprint and per epic.
