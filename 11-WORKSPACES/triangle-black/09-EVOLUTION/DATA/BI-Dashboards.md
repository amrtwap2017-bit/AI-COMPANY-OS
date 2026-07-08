# 04 — BI Dashboards

> Business intelligence dashboard framework.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Data-Warehouse.md | Warehouse schema |
| Phase 10 — Executive-Review.md | Executive needs |

## Dashboard Hierarchy

```
EXECUTIVE DASHBOARD
├── Revenue dashboard
├── Operations dashboard
├── Customer dashboard
└── AI performance dashboard

DOMAIN DASHBOARDS
├── Finance: P&L, AR/AP, collections
├── Operations: Occupancy, maintenance, housekeeping
├── Sales: Pipeline, conversion, revenue per customer
├── Support: Tickets, resolution time, satisfaction
├── Product: Adoption, engagement, feature usage
└── AI: Copilot usage, resolution rate, cost

CUSTOMER DASHBOARDS
├── Hotel performance
├── Revenue analytics
├── Guest insights
└── Operational efficiency
```

## Dashboard Specifications

| Dashboard | Refresh | Data Sources | Users |
|-----------|---------|--------------|-------|
| Executive | Daily | All | CTO, COO, CEO |
| Revenue | Hourly | Bookings, invoices | Finance, Sales |
| Operations | Real-time | PMS, maintenance, HK | Ops team |
| Customer | Daily | Per-hotel | Hotel managers |
| Product | Daily | Usage analytics | Product team |
| AI | Weekly | AI evaluation | AI Engineering |

## Dashboard Standards

| Standard | Requirement |
|----------|-------------|
| Load time | < 3 seconds |
| Mobile support | Responsive, touch-friendly |
| Export | CSV, PDF, scheduled email |
| Filtering | Date range, hotel, department |
| Drill-down | Clickable to underlying data |
| Alerts | Configurable threshold alerts |
| Access control | Role-based dashboard access |

## Tool Selection

| Tool | Use | Justification |
|------|-----|---------------|
| Metabase | Internal BI, self-service | Open source, SQL-based |
| Superset | Customer-facing dashboards | Embeddable, multi-tenant |
| Grafana | Real-time ops monitoring | Time-series optimized |
