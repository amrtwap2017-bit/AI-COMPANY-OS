# 04 — Data Pipelines

> Data pipeline architecture for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Data-Warehouse.md | Warehouse ingestion |
| Phase 10 — Data-Quality.md | Quality monitoring |

## Pipeline Architecture

```
Source ──► Extract ──► Transform ──► Load ──► Serve
  │         │            │            │         │
  │      dbt/dlt     dbt           PostgreSQL   BI / AI
  │      connectors  transformations             models
```

## Pipeline Types

| Type | Latency | Tooling | Volume |
|------|---------|---------|--------|
| Batch (nightly) | 24 hours | dbt | Large tables (bookings, invoices) |
| Batch (hourly) | 1 hour | dbt | Medium tables (occupancy, metrics) |
| Streaming (H2) | Real-time | Kafka + Flink | Events (check-ins, maintenance) |
| API sync | On demand | Custom scripts | External data |

## Pipeline Catalog

| Pipeline | Source → Target | Frequency | Volume (rows/day) |
|----------|----------------|-----------|-------------------|
| Bookings | PMS → warehouse | Hourly | 10K |
| Revenue | PMS → warehouse | Hourly | 5K |
| Housekeeping | PMS → warehouse | Real-time | 50K |
| Maintenance | PMS → warehouse | Hourly | 1K |
| Finance | ERP → warehouse | Daily | 2K |
| Guest profiles | PMS → warehouse | Nightly | 1K |

## Pipeline Monitoring

| Metric | Target | Alert |
|--------|--------|-------|
| Pipeline success rate | > 99% | On failure |
| Data freshness | Within SLA | On delay > 30 min |
| Row count consistency | 100% of expected | On discrepancy > 5% |
| Schema change detection | Any change flagged | On change |
| Pipeline latency | < SLA | On breach |

## Error Handling

| Error | Action | Notification |
|-------|--------|-------------|
| Source unavailable | Retry 3 times, then alert | Engineering |
| Schema change | Log, alert, pause pipeline | Engineering + Data team |
| Data quality failure | Skip batch, alert | Data team |
| Pipeline timeout | Kill, retry with backoff | Engineering |
