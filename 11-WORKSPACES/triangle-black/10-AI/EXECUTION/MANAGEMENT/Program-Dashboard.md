# Program Dashboard

## Overview

The Program Dashboard provides a real-time, at-a-glance view of program health, progress, and performance. It consolidates key metrics from across the program into a single visual display that enables rapid assessment and informed decision-making. The dashboard serves the program team, stakeholders, and portfolio management as the primary communication tool for program status.

## Dashboard Design Principles

1. **Actionable:** Every metric should drive a decision or action
2. **Current:** Data is refreshed at appropriate cadence (daily or weekly)
3. **Trended:** Single data points are misleading — show direction over time
4. **Contextual:** Metrics include targets, thresholds, and benchmarks
5. **Hierarchical:** Summary view with drill-down capability
6. **Consistent:** Standard format across all programs for portfolio aggregation

## Dashboard Layout

The dashboard is organized into four quadrants, each focused on a key aspect of program health:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                     PROGRAM DASHBOARD — {Program Name}                    ║
║                           Week of {Date}                                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  PROGRAM STATUS:  ● On Track          SPONSOR: {Name}                     ║
║  PROGRAM HEALTH:  82/100              MANAGER: {Name}                     ║
║  PHASE:           Execute              STAGE:  Sprint 4 / 12              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  PROGRESS                    │  QUALITY & VALUE                           ║
║  ┌───────────────────────────┤  ┌────────────────────────────┐           ║
║  │ Epic Completion:  68%    │  │ Business Value Realized: 72%│           ║
║  │ ████████████████░░░░░    │  │ █████████████████░░░░░░░░░░ │           ║
║  │ Milestone Adherence: 85% │  │ Defect Rate: 2.3%           │           ║
║  │ ██████████████████░░░░░  │  │ Technical Debt: 8%          │           ║
║  │ Velocity: 18 pts/sprint  │  │ Security Findings: 3 (Open) │           ║
║  └───────────────────────────┘  └────────────────────────────┘           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  RISK & DEPENDENCIES          │  GOVERNANCE & DECISIONS                  ║
║  ┌───────────────────────────┤  ┌────────────────────────────┐           ║
║  │ Risk Exposure: 12%       │  │ Decisions This Month: 8    │           ║
║  │ ████████████░░░░░░░░░░░  │  │ Pending Decisions: 2 ⚠     │           ║
║  │ Blocking Dependencies: 2 │  │ Stage Gates Passed: 3/4    │           ║
║  │ Open Risks: 14 (H:3,M:7) │  │ Audit Findings: 0          │           ║
║  │ Issues Escalated: 1      │  │ Lessons Captured: 12      │           ║
║  └───────────────────────────┘  └────────────────────────────┘           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  MILESTONE PROGRESS                                                      ║
║  ┌────────────────────────────────────────────────────────────────────┐  ║
║  │ MS-001 ✓ │ MS-002 ✓ │ MS-003 ✓ │ MS-004 ● │ MS-005 ○ │ MS-006 ○ │  ║
║  │ Feb 10   │ Mar 01   │ Mar 22   │ Apr 12   │ May 03   │ May 24   │  ║
║  │ Done     │ Done     │ Done     │ Active   │ Planned  │ Planned  │  ║
║  └────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## Key Metrics

### 1. Epic Completion Rate

**Definition:** Percentage of planned epics that have been completed against the program plan.

**Formula:**
```
Epic Completion Rate = (Completed Epics / Total Planned Epics) × 100
```

**Target:** ≥ 80% on-track completion

**Display:** Progress bar with trend arrow (↑ ↓ →)

### 2. Velocity Trend

**Definition:** Story points or epic count delivered per iteration, tracked over time.

**Formula:**
```
Velocity = Total story points delivered in iteration
Trend = Moving average of last 3 iterations
```

**Target:** Stable or improving velocity

**Display:** Line chart showing actual vs expected velocity over last 8-12 iterations

### 3. Milestone Progress

**Definition:** Percentage of milestones achieved against the plan, adjusted for schedule variance.

**Formula:**
```
Milestone Adherence = (Milestones Achieved on Time / Total Milestones Due) × 100
```

**Target:** ≥ 85% on-time delivery

**Display:** Milestone timeline with status indicators (✓ Achieved, ● In Progress, ○ Planned, ✗ Missed)

### 4. Risk Exposure

**Definition:** Aggregate risk score across all open risks, weighted by probability and impact.

**Formula:**
```
Risk Exposure = Σ (Risk Probability × Risk Impact) / Maximum Possible Score
```

**Target:** < 15% of maximum exposure

**Display:** Gauge with green/yellow/red zones

### 5. Decision Velocity

**Definition:** Average time from decision identification to decision resolution.

**Formula:**
```
Decision Velocity = Average (Decision Resolution Date - Decision Identification Date)
```

**Target:** < 5 business days

**Display:** Trend chart showing decision count and average resolution time by month

### 6. Dependency Health

**Definition:** Percentage of dependencies that are resolved or on track relative to total active dependencies.

**Formula:**
```
Dependency Health = (Resolved + On Track Dependencies / Total Active Dependencies) × 100
```

**Target:** ≥ 80% of dependencies healthy

**Display:** Stacked bar showing Resolved, On Track, At Risk, Blocked

### 7. Budget Variance

**Definition:** Difference between planned and actual spend.

**Formula:**
```
Budget Variance = ((Actual Spend - Planned Spend) / Planned Spend) × 100
```

**Target:** ± 10% variance

**Display:** Burn chart showing planned vs actual cumulative spend

### 8. Value Realization

**Definition:** Percentage of target business value that has been confirmed as achieved.

**Formula:**
```
Value Realization = (Value Achieved / Value Target) × 100
```

**Target:** ≥ 75% of projected value by program midpoint

**Display:** Gauge or progress bar

## Dashboard Hierarchy

The program dashboard supports drill-down from summary to detail:

```
Portfolio Dashboard                 (Portfolio-level view of all programs)
    └── Program Dashboard           (This document — program-level summary)
        ├── Epic Detail View        (Individual epic status and progress)
        ├── Milestone Detail View   (Individual milestone details and dependencies)
        ├── Risk Detail View        (Risk register drill-down)
        ├── Dependency Detail View  (Dependency map and status)
        └── Decision Detail View    (Decision log drill-down)
```

## Data Refresh Cadence

| Metric | Refresh Frequency | Data Source |
|--------|-------------------|-------------|
| Epic Completion Rate | Daily | Program backlog tool |
| Velocity Trend | Per iteration | Program backlog tool |
| Milestone Progress | Weekly | Program schedule |
| Risk Exposure | Weekly | Risk register |
| Decision Velocity | Weekly | Decision log |
| Dependency Health | Weekly | Dependency tracker |
| Budget Variance | Monthly | Financial system |
| Value Realization | Monthly | Value tracking system |

## Dashboard Governance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Data quality check | Weekly | Program Manager |
| Dashboard review with team | Weekly | Program team |
| Dashboard review with sponsor | Monthly | Program Manager, Sponsor |
| Dashboard metrics validation | Monthly | PMO |
| Dashboard improvement | Quarterly | Program Manager |
| Dashboard tooling updates | As needed | PMO |

## Dashboard Success Criteria

The dashboard is effective when it:

1. Provides an accurate, current view of program status
2. Enables rapid identification of issues requiring attention
3. Supports data-driven decision-making at all levels
4. Reduces the time spent on status reporting
5. Provides consistent, comparable data across programs
6. Drives proactive management rather than reactive reporting
7. Builds trust with stakeholders through transparency
