# 04 — Reporting Framework

> Standardized reporting framework for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Data-Warehouse.md | Data availability |
| Phase 10 — Executive-Review.md | Reporting needs |

## Report Types

| Type | Example | Frequency | Format |
|------|---------|-----------|--------|
| Operational | Daily occupancy report | Daily | Dashboard + email |
| Financial | Monthly P&L | Monthly | PDF + dashboard |
| Executive | Strategic overview | Weekly | Dashboard |
| Compliance | Regulatory reports | Quarterly | PDF |
| Customer | Hotel performance | Monthly | White-label PDF |
| AI | AI performance metrics | Weekly | Dashboard |

## Report Specifications

| Report | Data Sources | Dimensions | Metrics | Recipients |
|--------|-------------|------------|---------|------------|
| Daily Occupancy | Bookings, rooms | Hotel, date, room type | Occupancy %, ADR, RevPAR | Ops team |
| Weekly Revenue | Bookings, invoices | Hotel, date, source | Revenue, avg spend, nights | Finance |
| Monthly P&L | Invoices, expenses | Hotel, category | Revenue, costs, profit | Exec team |
| Customer Health | Usage, support, billing | Customer | NPS, tickets, adoption | CS team |
| AI Performance | AI evaluation | Copilot, date | Resolution %, CSAT, cost | AI team |

## Report Delivery

| Channel | Method | Automation |
|---------|--------|------------|
| Dashboard | Web (Metabase/Superset) | Real-time |
| Email scheduled | Daily/weekly PDF | Automated via cron |
| Slack | Summary + link | Automated via webhook |
| API | Programmatic access | On demand |
| Export | CSV from dashboard | User-initiated |

## Reporting Standards

| Standard | Requirement |
|----------|-------------|
| Currency | All amounts in USD (configurable) |
| Date format | ISO 8601 |
| Timezone | UTC + configurable local |
| Naming | Consistent metric names across reports |
| Accuracy | All numbers must reconcile with source data |
