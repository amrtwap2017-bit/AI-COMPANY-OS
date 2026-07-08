# Dependency Management

## Overview

Dependency management is the practice of identifying, tracking, and resolving dependencies between work items within a program and across programs. Unmanaged dependencies are a primary source of program delay, budget overrun, and quality issues. A structured dependency management process ensures that dependencies are visible, owned, and resolved proactively.

## Dependency Types

Dependencies are classified by their nature to enable appropriate management approaches:

### Technical Dependencies

Dependencies related to technology, systems, platforms, and infrastructure.

| Example | Description |
|---------|-------------|
| API Integration | Program B must expose an API before Program A can consume it |
| Platform Upgrade | Database upgrade must complete before application migration |
| Infrastructure Provisioning | Cloud environment must be provisioned before deployment |
| Tooling | CI/CD pipeline must be configured before code deployment |

### Data Dependencies

Dependencies related to data availability, quality, and access.

| Example | Description |
|---------|-------------|
| Data Availability | Source system data must be available before data migration |
| Data Quality | Data quality issues must be resolved before analytics can run |
| Data Access | Access permissions must be granted before data integration |
| Data Standards | Data must adhere to enterprise standards before ingestion |

### Workflow Dependencies

Dependencies related to process sequences, approvals, and handoffs.

| Example | Description |
|---------|-------------|
| Approval Gate | Security review must be completed before production deployment |
| Sequential Work | Design must be completed before development begins |
| Handoff | Training materials must be delivered before user training |
| Review Cycle | Legal review must be completed before contract signing |

### External Dependencies

Dependencies on third parties, vendors, partners, or regulatory bodies.

| Example | Description |
|---------|-------------|
| Vendor Delivery | Software vendor must deliver the updated module |
| Regulatory Approval | Regulatory body must approve the new process |
| Partner Integration | Partner system must be updated to support integration |
| Third-Party API | Cloud provider must enable the new service in the region |

## Dependency Mapping

Dependencies are mapped to understand relationships, identify critical paths, and support impact analysis:

### Dependency Map Format

```
Program A                    Program B                    Program C
═══════════════              ═══════════════             ═══════════════
Epic A-1 ──────────────────────> Epic B-1
    │                              │
    │                              ├────────────────────────> Epic C-1
    │                              │
    └────> Epic A-2 <─────────────┘
                                    │
                                    └────> Platform Team: DB Upgrade
```

### Dependency Matrix

A structured matrix captures all dependencies in a searchable format:

| Dep ID | Source Item | Target Item | Type | Relationship | Status | Owner |
|--------|-------------|-------------|------|--------------|--------|-------|
| DEP-001 | PROG-A: Epic A-1 | PROG-B: Epic B-1 | Technical | Blocking | Resolved | J. Smith |
| DEP-002 | PROG-B: Epic B-1 | PROG-C: Epic C-1 | Data | Blocking | Active | L. Jones |
| DEP-003 | PROG-A: Epic A-2 | Platform Team | External | Non-Blocking | Active | M. Brown |

## Dependency Tracking Template

Each dependency is recorded and tracked using this template:

```
==========================================================================
DEPENDENCY RECORD
==========================================================================

DEPENDENCY ID:      DEP-{NNN}
DEPENDENCY NAME:    {Descriptive dependency name}

SOURCE:
- Program:           {PROG-NNN}
- Epic/Item:         {EPIC/BL-NNN} — {Name}
- Owner:             {Name}

TARGET:
- Program:           {PROG-NNN}
- Epic/Item:         {EPIC/BL-NNN} — {Name}
- Owner:             {Name}

DEPENDENCY TYPE:     {Technical | Data | Workflow | External}
RELATIONSHIP TYPE:   {Blocking | Non-Blocking | Informational}
DIRECTION:           {Inbound (we need them) | Outbound (they need us) | Mutual}

DESCRIPTION:
{Clear description of the dependency — what is needed, from whom, by when,
 and what happens if it is not delivered.}

DATES:
- Identified Date:   {Date}
- Required By Date:  {Date}
- Expected Resolve:  {Date}
- Actual Resolve:    {Date}

STATUS:              {Identified | Active | Resolved | Blocked | Escalated | Closed}
AGREED RESOLUTION:   {Description of agreed approach}
ESCALATION LEVEL:    {Team | Program | Portfolio | Executive}

CONTINGENCY:
- {Backup plan if dependency is not resolved}

NOTES:
{Additional context, decisions, meeting notes}
==========================================================================
```

## Dependency Management Process

### 1. Identification

Dependencies are identified during:
- Program planning and charter development
- Epic and feature refinement
- Milestone planning
- Cross-program coordination meetings
- Architecture and design reviews

### 2. Documentation

Each identified dependency is:
- Recorded in the dependency tracking system
- Assigned a unique dependency ID
- Categorized by type and relationship
- Assigned an owner from the source and target sides

### 3. Assessment

Dependencies are assessed for:
- Criticality (what happens if not resolved)
- Timing (when is resolution needed)
- Complexity (how difficult to resolve)
- Risk (probability of delay or failure)

### 4. Agreement

For each dependency, the source and target owners agree on:
- What needs to be delivered
- When it needs to be delivered
- Quality and acceptance criteria
- Communication and escalation path

### 5. Tracking

Dependencies are actively tracked:
- Status updated at least weekly
- Progress reviewed in dependency management meetings
- Alerts triggered for approaching deadlines
- Escalation initiated for blocked dependencies

### 6. Resolution

When a dependency is resolved:
- Verification that delivery meets requirements
- Formal acknowledgment by both parties
- Dependency record updated to "Closed"
- Lessons captured for future reference

## Escalation for Blocked Dependencies

When a dependency threatens program timelines, escalation follows a defined path:

| Level | Trigger | Escalation To | Action |
|-------|---------|---------------|--------|
| **Team** | Dependency not progressing as expected | Program Manager | Facilitate discussion, adjust plans |
| **Program** | Dependency at risk of missing deadline | Portfolio Manager | Resource reallocation, priority adjustment |
| **Portfolio** | Dependency blocking critical milestone | Portfolio Review Board | Cross-program trade-off decisions |
| **Executive** | Dependency causing program-level impact | Executive Sponsor | Strategic resolution, organizational change |

### Escalation Template

```
==========================================================================
DEPENDENCY ESCALATION
==========================================================================

DEPENDENCY ID:      DEP-{NNN}
CURRENT STATUS:     Blocked
ESCALATION LEVEL:   {Level}
ESCALATION DATE:    {Date}

IMPACT:
- {What is blocked or at risk}
- {Schedule impact: X days/weeks delay}
- {Cost impact: $X additional}
- {Value impact: X% value reduction}

ATTEMPTED RESOLUTIONS:
1. {What was tried, by whom, when}
2. {What was tried, by whom, when}

REQUESTED ACTION:
- {Specific action needed from escalation recipient}

DECISION:
- {To be filled by escalation recipient}
==========================================================================
```

## Dependency Health Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Dependency Count** | Total active dependencies | Track trend |
| **Blocking Dependencies** | Dependencies blocking progress | < 3 at any time |
| **Resolution Time** | Average time from identification to resolution | < 30 days |
| **Escalation Rate** | % of dependencies escalated | < 10% |
| **Dependency Miss Rate** | % of dependencies that missed required date | < 15% |
| **Identification Timing** | Average time between program start and dependency identification | < 4 weeks |
