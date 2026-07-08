# 04 — Data Warehouse

> Central data warehouse architecture.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 3 — Physical-Database.md | Source databases |
| Phase 6 — All domains | Domain data sources |

## Architecture

```
Source Systems ──► Staging ──► Warehouse ──► Data Marts ──► BI Tools
     │                │           │              │              │
  PostgreSQL       Raw        Star/        Per-domain      Superset
  (OLTP)         tables      Snowflake    aggregated      Metabase
                              schema      tables
```

## Schema Design

| Layer | Description | Update | Access |
|-------|-------------|--------|--------|
| Staging | Raw copies from source | Batch (nightly) | Engineers only |
| Warehouse | Star/snowflake fact + dim | After staging | Analysts |
| Data Marts | Aggregated per domain | After warehouse | BI dashboards |
| Reports | Pre-computed views | On demand | End users |

## Fact Tables

| Fact | Grain | Measures |
|------|-------|----------|
| Booking fact | Per-booking | Revenue, nights, guests |
| Invoice fact | Per-invoice | Amount, tax, payments |
| Maintenance fact | Per-work-order | Cost, hours, parts |
| Housekeeping fact | Per-room-per-day | Status, time, chemicals |
| Procurement fact | Per-PO-line | Quantity, cost, supplier |

## Dimension Tables

| Dimension | Attributes |
|-----------|-----------|
| Date | Day, week, month, quarter, year, holiday |
| Hotel | Name, brand, city, tier, size |
| Room | Type, capacity, amenities, floor |
| Guest | Name, tier, nationality, preferences |
| Supplier | Name, category, region, contract |
| Employee | Role, department, skills, shift |

## ETL Strategy

| Method | Frequency | Tools |
|--------|-----------|-------|
| Full refresh | Weekly (small tables) | dbt |
| Incremental | Nightly (large tables) | dbt |
| CDC (Change Data Capture) | Real-time (H2) | Debezium |
| API pull | Hourly (external) | Custom scripts |
