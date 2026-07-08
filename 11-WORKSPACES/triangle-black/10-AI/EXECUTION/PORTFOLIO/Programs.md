# Program Catalog

## Overview

The Program Catalog is the authoritative registry of all programs within the enterprise portfolio. It provides a single source of truth for program definitions, status, ownership, and performance. The catalog enables portfolio-level analysis, cross-program dependency management, and strategic reporting.

## Program Definition

A program is a group of related projects, epics, and operational activities managed in a coordinated way to obtain benefits and control not available from managing them individually. Programs are the primary execution units within portfolios.

### Key Characteristics

- **Outcome-oriented:** Programs deliver business outcomes, not just outputs
- **Duration-bound:** Programs have defined start and end dates (typically 6-24 months)
- **Cross-functional:** Programs span organizational boundaries
- **Change-focused:** Programs drive organizational change and capability building
- **Benefits-driven:** Programs are justified by the value they deliver

## Program Charter Summary

Each program in the catalog has a charter that defines its scope, objectives, and governance. The charter summary in the catalog includes:

- Program ID and Name
- Strategic Objective Alignment
- Business Value Case
- Total Investment
- Duration (start date, end date)
- Executive Sponsor
- Program Manager
- Status
- Key Deliverables (high-level)
- Dependencies

The full program charter is maintained in the Program Management section (01-PROGRAM-MANAGEMENT/Program-Charter.md).

## Program Lifecycle

Programs progress through a defined lifecycle with stage gates:

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ DEFINE  │───>│  PLAN    │───>│ EXECUTE  │───>│  CLOSE   │───>│  REVIEW  │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │              │              │               │               │
     │ Charter      │ Backlog &    │ Milestone     │ Handover      │ Lessons
     │ Approval     │ Milestones   │ Tracking      │ & Transition  │ Learned
     └──────────────┴──────────────┴───────────────┴───────────────┘
```

### Lifecycle Stages

| Stage | Description | Key Artifacts | Gate Criteria |
|-------|-------------|---------------|---------------|
| **Define** | Program concept is developed, charter is drafted, initial business case is validated | Program Charter, Business Case, Feasibility Assessment | Sponsor approval, strategic alignment confirmed |
| **Plan** | Detailed planning: backlog, milestones, resources, budget, risk assessment | Program Plan, Backlog, Milestone Schedule, Risk Register | Portfolio review board approval, funding allocated |
| **Execute** | Program delivers epics and projects, tracks progress, manages risks | Status Reports, Decision Log, Milestone Tracker | Quality gates passed, value being realized |
| **Close** | Program deliverables are transitioned, resources released, outcomes documented | Closure Report, Handover Documentation, Benefits Review | All deliverables accepted, documentation complete |
| **Review** | Post-program benefits realization assessment, lessons learned | Benefits Realization Report, Lessons Learned | Value realization confirmed |

## Program Template

Each program in the catalog follows this standardized template:

```
==========================================================================
PROGRAM RECORD — {Program Name}
==========================================================================

PROGRAM ID:          PROG-{NNN}
PROGRAM NAME:        {Descriptive program name}
STRATEGIC OBJECTIVE: {OBJ-NNN} — {Objective Name}
PORTFOLIO:           {PORT-NNN} — {Portfolio Name}

EXECUTIVE SPONSOR:   {Name, Title}
PROGRAM MANAGER:     {Name, Title}

BUSINESS VALUE:
{Clear statement of the business value this program is expected to deliver,
 including quantified benefits where possible.}

INVESTMENT SUMMARY:
- Total Budget:       ${Amount}
- Budget YTD:         ${Amount}
- Actual Spend:       ${Amount}
- Remaining Budget:   ${Amount}

TIMELINE:
- Start Date:         {Date}
- End Date:           {Date}
- Duration:           {Months}
- Current Phase:      {Define | Plan | Execute | Close | Review}

STATUS:
- Overall Status:     {On-Track | At-Risk | Critical | Completed | On-Hold}
- Schedule:           {Green | Yellow | Red}
- Budget:             {Green | Yellow | Red}
- Quality:            {Green | Yellow | Red}
- Risk:               {Green | Yellow | Red}

KEY DELIVERABLES:
--------------------------------------------------------------------------
ID       | Deliverable                     | Milestone Date  | Status
---------|---------------------------------|-----------------|---------
DEL-001  | {Key deliverable description}   | {Date}          | {Status}
DEL-002  | {Key deliverable description}   | {Date}          | {Status}

DEPENDENCIES:
--------------------------------------------------------------------------
ID           | Dependency                     | Type        | Status
-------------|--------------------------------|-------------|---------
DEP-001      | {Dependency description}       | {Type}      | {Status}

KEY METRICS:
- Epic Completion Rate:    {X}%
- Milestone Adherence:     {X}%
- Budget Variance:         {X}%
- Risk Exposure:           {Score}

NOTES:
{Additional context, assumptions, or comments}

==========================================================================
```

## Program Categorization

Programs may be categorized by type to support portfolio analysis:

| Category | Description | Example |
|----------|-------------|---------|
| **Transformational** | Drives significant business change, new capabilities | Digital transformation, new platform |
| **Growth** | Expands revenue, market presence, or customer base | New market entry, product launch |
| **Optimization** | Improves efficiency, reduces cost, streamlines operations | Process automation, legacy modernization |
| **Foundational** | Builds enterprise capabilities or infrastructure | Data platform, security enhancement |
| **Compliance** | Addresses regulatory or legal requirements | GDPR compliance, audit remediation |

## Program Status Definitions

| Status | Definition |
|--------|------------|
| **Proposed** | Concept identified, charter in development |
| **Approved** | Charter signed, funding allocated, planning underway |
| **Active** | Execution in progress |
| **At-Risk** | One or more dimensions (schedule, budget, quality) are yellow or red |
| **On-Hold** | Temporarily paused pending portfolio decision |
| **Completed** | All deliverables accepted, transitioning to close |
| **Closed** | Formal closure completed, post-review activities done |
| **Cancelled** | Terminated before completion, resources released |

## Program Portfolio Review

Programs are reviewed on a recurring basis as part of portfolio governance:

- **Weekly:** Program Manager status check (internal team)
- **Monthly:** Portfolio investment review (portfolio manager, sponsor)
- **Quarterly:** Strategic alignment review (portfolio review board)
- **Annually:** Portfolio rebalancing (executive leadership)
