# Dashboard Strategy

## Philosophy

Dashboards exist to support decisions, not to display data. Every widget must answer a specific question that leads to an action.

| Portal | Question | Decision |
|--------|----------|----------|
| Executive Dashboard | Can we hire? | Approve/deny headcount request |
| Executive Dashboard | Which project is at risk? | Allocate resources or escalate |
| Operations Portal | What needs my attention? | Process next item |
| Client Portal | Where does my project stand? | Approve or raise concern |

## Dashboard Types

### 1. Executive Dashboard (Decision Support)

**Purpose:** Answer 8 key business questions (see 01-Executive/Executive-Decision-Dashboard.md)

| Widget | Question Answered | Action |
|--------|------------------|--------|
| Pipeline Funnel | Will we hit revenue targets? | Adjust sales strategy |
| Revenue YTD | Are we on budget? | Cut costs or accelerate |
| Project Health Heatmap | Which projects need intervention? | Schedule review |
| Client Health Scores | Who is at risk of churning? | Schedule QBR |
| Team Workload | Are we over capacity? | Hire or rebalance |
| Contract Expiry Calendar | Which renewals are upcoming? | Start renewal process |
| Cash Flow Projection | Can we make payroll? | Delay payments or draw credit |
| Decision Center | What needs my attention NOW? | Take immediate action |

### 2. Operations Dashboard (Daily Operations)

**Purpose:** Pipeline management, task tracking, operational oversight

| Widget | Question Answered | Action |
|--------|------------------|--------|
| New Leads Today | How many prospects entered? | Assign leads |
| Pipeline Value | What's our active pipeline? | Review stalled opps |
| Pending Approvals | What needs my sign-off? | Approve/reject |
| Overdue Milestones | What's behind schedule? | Escalate or re-plan |
| My Tasks | What do I need to do today? | Execute tasks |
| Recent Activity | What happened while I was away? | Catch up |

### 3. Client Dashboard (Transparency)

**Purpose:** Project visibility, trust building, self-service

| Widget | Question Answered | Action |
|--------|------------------|--------|
| Active Projects | What's happening with my projects? | Review progress |
| Pending Quotations | Do I need to approve anything? | Approve or request revision |
| Open Requests | What did I ask for? | Track status |
| Recent Activity | What's new since my last visit? | Stay informed |
| Upcoming Milestones | What should I expect? | Plan ahead |

## Dashboard Design Principles

| Principle | Implementation |
|-----------|---------------|
| One question per widget | Each widget has a single purpose |
| Mobile-first layout | Stack widgets vertically on mobile |
| Progressive disclosure | Summary first, click for detail |
| Empty states are useful | "No pending approvals" is positive information |
| Refresh on page load | No real-time push in V1; user refreshes |
| 3-second load target | Aggressive caching and materialized views |
| Exportable | PDF export with one click |

## Widget Catalog

| Widget | Type | Data Source | Refresh |
|--------|------|-------------|---------|
| KpiCard | Single metric | Aggregated query | On load |
| TrendChart | Time series | Aggregated query | On load |
| FunnelChart | Stage breakdown | Aggregated query | On load |
| HeatmapGrid | Multi-dimensional | Aggregated query | On load |
| ActivityFeed | Chronological list | Activity log | On load |
| TableWidget | Tabular data | Entity query | On load |
| StatusList | Status-based list | Entity query | On load |
| DecisionAlert | Flagged items | Rule-based | On load |

## Widget Specification Format

```
Widget Name: Pipeline Funnel
Type: FunnelChart
Question: What is our active pipeline value by stage?
Data Source: opportunities table (aggregated by stage)
Query: SELECT stage, SUM(value) as total, COUNT(*) as count
       FROM opportunities WHERE status = 'open'
       GROUP BY stage ORDER BY stage_sequence
Refresh: On page load
Interaction: Hover → show value, count; Click → filter to opportunity list
Empty State: "No active opportunities. Convert a lead to get started."
Error State: "Unable to load pipeline data. [Retry]"
```

## Dashboard Implementation Rules

| Rule | Detail |
|------|--------|
| No real-time | WebSocket/polling not required in V1 |
| Cache aggressively | 30-second TTL on all dashboard queries |
| Materialized views | Pre-compute common aggregations (15-min refresh) |
| Role-filtered data | Dashboard content varies by user role |
| Tenant-scoped | Client dashboard restricted to client tenant |
| Accessibility | All charts have screen-reader-compatible text alternatives |
