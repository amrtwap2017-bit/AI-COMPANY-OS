# Milestone Definition and Tracking

## Overview

Milestones are significant events or achievements in the program lifecycle that mark the completion of key deliverables, phase transitions, or critical decision points. They provide visibility into program progress, enable stakeholder communication, and serve as governance checkpoints for quality and value assessment.

Effective milestone management ensures that progress is measurable, predictable, and transparent throughout the program lifecycle.

## Milestone Types

Milestones are categorized by their focus and purpose:

| Type | Description | Examples |
|------|-------------|----------|
| **Business** | Business outcomes, stakeholder-facing achievements | Product launch, go-live, customer adoption milestone, revenue target |
| **Architecture** | Architectural decisions, design completions, technical foundations | Architecture decision record approved, system design finalized, technology stack selected |
| **Engineering** | Technical delivery, development completions, integration achievements | MVP release, API integration complete, performance benchmark achieved |
| **Quality** | Testing, validation, compliance, certification achievements | Security audit passed, performance test completed, regulatory approval obtained |
| **Release** | Deployment, rollout, transition achievements | Production deployment complete, user acceptance testing signed off, cutover completed |

## Milestone Template

Each milestone is documented using the following template:

```
==========================================================================
MILESTONE RECORD
==========================================================================

MILESTONE ID:       MS-{NNN}
MILESTONE NAME:     {Descriptive milestone name}
PROGRAM:            {PROG-NNN} — {Program Name}
MILESTONE TYPE:     {Business | Architecture | Engineering | Quality | Release}
EPIC:               {EPIC-NNN} — {Epic Name (if applicable)}

DESCRIPTION:
{2-3 sentence description of what this milestone represents, what must be
 true for it to be considered complete, and why it matters.}

COMPLETION CRITERIA:
- [ ] {Specific, verifiable condition that must be met}
- [ ] {Specific, verifiable condition that must be met}
- [ ] {Specific, verifiable condition that must be met}

DATES:
- Planned Date:     {Date}
- Forecast Date:    {Date (updated as program progresses)}
- Actual Date:      {Date (set when milestone is completed)}
- Variance:         {+/- X days from planned}

DEPENDENCIES:
- {MS-NNN} — {Predecessor milestone}
- {MS-NNN} — {Successor milestone}
- {External dependency}

OWNER:              {Name of person accountable for milestone delivery}
STATUS:             {Planned | In Progress | Achieved | Missed | Deferred}
CONFIDENCE:         {High | Medium | Low}

GATE REVIEW REQUIRED: {Yes | No}
GATE REVIEW DATE:     {Date (if applicable)}

NOTES:
{Additional context, risks, assumptions}
==========================================================================
```

## Milestone Dependency Tracking

Milestones are often interdependent, both within a program and across programs. Dependency tracking ensures that milestone relationships are visible and managed:

### Dependency Types

| Type | Description | Example |
|------|-------------|---------|
| **Finish-to-Start (FS)** | Predecessor must finish before successor can start | MS-001 (Architecture Approved) must finish before MS-002 (Development Starts) |
| **Start-to-Start (SS)** | Predecessor must start before successor can start | MS-003 (Data Migration Starts) must start before MS-004 (Integration Testing Starts) |
| **Finish-to-Finish (FF)** | Predecessor must finish before successor can finish | MS-005 (User Training Complete) must finish before MS-006 (Go-Live Complete) |
| **Start-to-Finish (SF)** | Predecessor must start before successor can finish | MS-007 (Cutover Starts) must start before MS-008 (Legacy Decommission) |

### Dependency Mapping

Dependencies are mapped using a dependency matrix or network diagram:

```
MS-001 (Architecture)
    │ FS
    ▼
MS-002 (Development Start)
    │ FS
    ▼
MS-003 (MVP Complete) ──SS──> MS-004 (Integration Test Start)
    │                               │
    │ FS                            │ FF
    ▼                               ▼
MS-005 (UAT Complete) ──────── MS-006 (Performance Test)
    │ FS
    ▼
MS-007 (Go-Live)
```

### Dependency Tracking Fields

Each milestone dependency record includes:

- Dependency ID
- Predecessor Milestone
- Successor Milestone
- Dependency Type (FS, SS, FF, SF)
- Lag/Lead Time
- Status (Active, Resolved, Blocked)
- Owner
- Notes

## Milestone Dashboard

The milestone dashboard provides a visual overview of milestone progress:

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    MILESTONE DASHBOARD — {Program Name}              ║
╠═══════════════════════════════════════════════════════════════════════╣
║  OVERALL: 24 Planned | 18 Achieved | 3 In Progress | 3 At Risk     ║
╠═══════════════════════════════════════════════════════════════════════╣
║  UPCOMING MILESTONES (Next 90 Days)                                  ║
║  ┌──────┬──────────────────────────────────┬──────────┬──────┬────┐ ║
║  │ ID   │ Name                             │ Date     │ Conf │ St │ ║
║  ├──────┼──────────────────────────────────┼──────────┼──────┼────┤ ║
║  │ MS-08│ Security Audit Complete          │ 15-Mar   │ High │ ON │ ║
║  │ MS-09│ UAT Phase 1 Complete             │ 22-Mar   │ Med  │ AT │ ║
║  │ MS-10│ Performance Benchmark Achieved   │ 05-Apr   │ Low  │ RI │ ║
║  │ MS-11│ Production Deployment Ready      │ 20-Apr   │ High │ ON │ ║
║  └──────┴──────────────────────────────────┴──────────┴──────┴────┘ ║
╠═══════════════════════════════════════════════════════════════════════╣
║  MILESTONE HEALTH                                                     ║
║  On Track: ████████████░ 75%   At Risk: ████░ 12.5%                 ║
║  Achieved: ████████████████░ 75%  Missed: ██░ 4%                     ║
╚═══════════════════════════════════════════════════════════════════════╝
```

## Milestone Review Cadence

| Review Type | Frequency | Participants | Focus |
|-------------|-----------|--------------|-------|
| Milestone Health Check | Weekly | Program Manager, Delivery Leads | Track progress, identify risks |
| Milestone Dependency Review | Bi-weekly | Program Managers (cross-program) | Dependency status, blocker resolution |
| Milestone Status Report | Monthly | Stakeholders | Progress against plan, forecast updates |
| Stage Gate Review | Per milestone | Sponsor, Portfolio Manager | Go/no-go decision |
| Milestone Retrospective | After each major milestone | Program team | Lessons learned, process improvement |

## Milestone Status Definitions

| Status | Definition | Action Required |
|--------|------------|----------------|
| **Planned** | Milestone defined, target date set | Monitor, prepare for execution |
| **In Progress** | Work toward milestone underway | Track progress, manage dependencies |
| **Achieved** | All completion criteria met, milestone validated | Document actual date, communicate success |
| **Missed** | Target date passed without achievement | Root cause analysis, replan, escalate |
| **Deferred** | Deliberately postponed to a later date | Document rationale, update plan, communicate |
| **Cancelled** | No longer required | Document rationale, remove from plan |
