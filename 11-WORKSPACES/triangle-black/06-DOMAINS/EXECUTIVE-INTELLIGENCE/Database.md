# 09-EXECUTIVE-INTELLIGENCE — Database Schema

Materialized views (aggregated from domain tables).

## mv_sales_pipeline
```sql
CREATE MATERIALIZED VIEW mv_sales_pipeline AS
SELECT
  tenant_id,
  stage,
  COUNT(*) as opportunity_count,
  SUM(value) as total_value,
  SUM(value * probability / 100) as weighted_value,
  AVG(probability) as avg_probability
FROM opportunities
WHERE deleted_at IS NULL
GROUP BY tenant_id, stage;
```

## mv_financial_summary
```sql
CREATE MATERIALIZED VIEW mv_financial_summary AS
SELECT
  tenant_id,
  DATE_TRUNC('month', created_at) as month,
  SUM(CASE WHEN type = 'receivable' THEN total ELSE 0 END) as revenue,
  SUM(CASE WHEN type = 'payable' THEN total ELSE 0 END) as costs,
  COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
  SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END) as overdue_amount
FROM invoices
WHERE deleted_at IS NULL
GROUP BY tenant_id, month;
```

## mv_project_portfolio
```sql
CREATE MATERIALIZED VIEW mv_project_portfolio AS
SELECT
  tenant_id,
  status,
  COUNT(*) as project_count,
  SUM(budget) as total_budget,
  AVG(EXTRACT(DAY FROM (end_date - start_date))) as avg_duration
FROM projects
WHERE deleted_at IS NULL
GROUP BY tenant_id, status;
```
