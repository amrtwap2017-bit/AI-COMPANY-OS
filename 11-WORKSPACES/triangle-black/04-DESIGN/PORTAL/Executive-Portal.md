# Executive Portal

## Identity

| Field | Value |
|-------|-------|
| URL | app.triangleblack.com/dashboard |
| Purpose | Decision support — not reporting. Answer: Can we hire? Which hotel is most profitable? Which project is at risk? |
| Tone | Analytical, concise, actionable |
| Primary Action | Make informed operational decisions |

## User Roles & Access

| Role | Access |
|------|--------|
| CEO | Full — all metrics, all clients, all modules |
| COO | Operations KPIs, project health, team workload |
| Sales Director | Pipeline, revenue, win rates |
| Department Head | Team-specific KPIs |

## Navigation

```
[Dashboard]  [Pipeline]  [Revenue]  [Projects]  [Clients]  [Operations]
```

## Decision Support Framework

| Decision Question | Data Required | Widget |
|------------------|---------------|--------|
| Can we hire? | Revenue vs target, pipeline coverage, margin trend | Revenue KPI + Pipeline Value |
| Which hotel is most profitable? | Per-client revenue, cost, margin | Client Profitability Breakdown |
| Which supplier underperforms? | Supplier delivery, quality, pricing | Supplier Scorecard (V2) |
| Which project is at risk? | Schedule variance, budget variance, issues | Project Health Heatmap |
| Cash flow forecast? | AR aging, expected payments, committed PO spend | Cash Flow Projection |
| Contract renewal forecast? | Contract end dates, health scores, engagement | Contract Expiry Calendar |
| Pipeline health? | Funnel stages, win rate, velocity | Pipeline Funnel Chart |
| Team capacity? | Assignments vs availability, open roles | Workload Distribution |

## Dashboard Sections (V1)

### Section 1: Pipeline Health
```
┌─────────────────────────────────────────────────────────────┐
│ Pipeline Health                                    [Month] ▾│
│                                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │$2.1M │  │$1.5M │  │$890K │  │$420K │  │$180K │         │
│  │Qual  │  │Analysis│  │Proposl│  │Negot │  │Won   │         │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘         │
│  Total Pipeline: $5.1M    Win Rate: 34%    Velocity: 45d   │
└─────────────────────────────────────────────────────────────┘
```

### Section 2: Revenue & Profitability
```
┌─────────────────────────────────────────────────────────────┐
│ Revenue YTD                                        [Filter] ▾│
│                                                             │
│  Revenue ████████████████████████████████░░  $1.2M         │
│  Target  ████████████████████████████████████  $1.5M       │
│                                                             │
│  ┌────┬────┬────┬────┬────┬────┐                             │
│  │180 │195 │210 │185 │220 │210 │  Monthly Revenue (K)      │
│  └────┴────┴────┴────┴────┴────┘                             │
│  Jan  Feb  Mar  Apr  May  Jun                                │
│                                                             │
│  Gross Margin: 26.2%    MRR: $75K    ARR: $900K            │
└─────────────────────────────────────────────────────────────┘
```

### Section 3: Project Health
```
┌─────────────────────────────────────────────────────────────┐
│ Project Health                                     [All] ▾  │
│                                                             │
│  ● Hilton Sharm        ████████████████░░ 75%  🟢 On track │
│  ● Marriott Cairo      ██████████░░░░░░░░ 45%  🟡 At risk  │
│  ● Sheraton Hurghada   ██████████████████ 90%  🟢 On track │
│  ● Movenpick Resort    ████░░░░░░░░░░░░░░ 20%  🔴 Delayed │
│                                                             │
│  Total Active: 12    On Track: 8  At Risk: 3  Delayed: 1   │
└─────────────────────────────────────────────────────────────┘
```

### Section 4: Client Health
```
┌─────────────────────────────────────────────────────────────┐
│ Client Health                                      [All] ▾  │
│                                                             │
│  Client        │ Health │ Projects │ AR (days) │ Renewal    │
│ ───────────────┼────────┼──────────┼───────────┼────────────│
│ Hilton Sharm   │ 🟢 92  │ 3 active │ 28        │ Mar 2027   │
│ Marriott Cairo │ 🟡 68  │ 2 active │ 45        │ Dec 2026   │
│ Sheraton       │ 🟢 85  │ 1 active │ 15        │ Jun 2027   │
│ Movenpick      │ 🔴 42  │ 1 active │ 72        │ Sep 2026   │
└─────────────────────────────────────────────────────────────┘
```

### Section 5: Quick Decisions
```
┌─────────────────────────────────────────────────────────────┐
│ Decision Center                                             │
│                                                             │
│ ⚠ 2 contracts expiring in < 90 days → Review Renewals      │
│ ⚠ 3 milestones overdue → Review Projects                   │
│ ℹ Pipeline coverage is 2.1x (target: 3x)                   │
│ ℹ Team capacity at 85% — consider hiring                   │
└─────────────────────────────────────────────────────────────┘
```

## Technical Approach

| Aspect | Decision |
|--------|----------|
| Data source | Materialized views refreshed every 15 minutes |
| Refresh trigger | On page load + manual refresh button |
| Caching | In-memory cache per dashboard query (30 second TTL) |
| Performance | All dashboard queries < 2 seconds |
| Export | PDF export of dashboard (P1) |
| Drill-down | Click on widget → filtered detail view |
