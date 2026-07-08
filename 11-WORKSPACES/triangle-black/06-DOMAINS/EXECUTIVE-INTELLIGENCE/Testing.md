# 09-EXECUTIVE-INTELLIGENCE — Testing

## Unit Tests
- Pipeline forecast calculation (weighted value)
- KPI aggregation formulas (win rate, margin, DSO)
- Materialized view refresh triggers
- Scheduled report generation

## Integration Tests
- Domain events → materialized view refresh → dashboard reads correct data
- Report schedule → generation → email delivery
- Export endpoint: CSV, PDF, Excel formats
