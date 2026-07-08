# 09-EXECUTIVE-INTELLIGENCE — Workflows

## Dashboard Data Flow

```
[Domain Events] → Aggregate Service → Materialized Views → Dashboard API → Frontend Charts
     ↓                   ↓                    ↓                  ↓               ↓
  lead.created      Counter inc         mv_sales_pipeline     GET /api/v1/bi    Chart.js
  invoice.paid      Summation           mv_financial          /pipeline         Recharts
  milestone.approved Calculation        mv_project_portfolio  /financial        Tables
```

## Scheduled Report

```
[Cron] → Execute report query → Generate PDF/CSV → Email to recipients
```
