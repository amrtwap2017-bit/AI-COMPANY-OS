# 04 — Data Quality

> Data quality monitoring and improvement framework.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Data-Governance.md | Governance framework |
| Phase 10 — Data-Pipelines.md | Pipeline quality |

## Quality Dimensions

| Dimension | Definition | Metric | Target |
|-----------|-----------|--------|--------|
| Completeness | No missing values | % non-null | > 99% |
| Accuracy | Correct values | % correct | > 98% |
| Timeliness | Available when needed | % within SLA | > 99% |
| Consistency | Same across systems | % matching | > 95% |
| Uniqueness | No duplicates | % unique | > 99.9% |
| Validity | Conforms to schema | % valid | > 99.9% |

## Quality Checks

| Check | Pipeline | Action on Failure | 
|-------|----------|-------------------|
| Null check on critical fields | All | Block pipeline |
| Duplicate detection | All | Log, quarantine duplicates |
| Referential integrity | Warehouse | Block, alert |
| Range validation | Numerical fields | Block if outlier |
| Freshness check | All | Alert if stale > 1 hour |
| Row count threshold | All | Alert if count < 50% expected |

## Quality Monitoring Dashboard

| Metric | Status | Trend | Last Check |
|--------|--------|-------|------------|
| Overall data health | — | — | — |
| Completeness score | — | — | — |
| Accuracy score | — | — | — |
| Pipeline success rate | — | — | — |
| Active quality issues | — | — | — |

## Issue Management

| Severity | Response SLA | Description |
|----------|-------------|-------------|
| Critical | 1 hour | Data loss, incorrect financials |
| High | 4 hours | Missing data, stale data > 24h |
| Medium | 24 hours | Minor quality issue |
| Low | 1 week | Non-blocking quality improvement |
