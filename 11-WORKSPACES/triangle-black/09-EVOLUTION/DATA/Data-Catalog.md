# 04 — Data Catalog

> Central data catalog for discoverability.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Data-Governance.md | Data ownership |
| Phase 10 — Data-Warehouse.md | Warehouse schema |

## Catalog Structure

```
CATALOG
├── Data Sources
│   ├── PostgreSQL (OLTP)
│   ├── Data Warehouse
│   ├── Analytics Views
│   └── External APIs
├── Datasets
│   ├── Bookings (fact)
│   ├── Invoices (fact)
│   ├── Hotels (dimension)
│   ├── Guests (dimension)
│   └── ...
├── Metrics
│   ├── Revenue
│   ├── Occupancy
│   ├── Customer Satisfaction
│   └── ...
└── Reports & Dashboards
    ├── Executive Dashboard
    ├── Domain Dashboards
    └── Customer Reports
```

## Catalog Entry Template

```yaml
dataset: bookings
description: "Hotel booking transactions"
owner: COO
steward: Data Team
classification: confidential
retention: 7 years
schema:
  - column: booking_id
    type: UUID
    description: "Unique booking identifier"
    nullable: false
  - column: hotel_id
    type: integer
    description: "Foreign key to hotels"
    nullable: false
  - column: guest_id
    type: integer
    description: "Foreign key to guests"
    nullable: false
  - column: check_in
    type: date
    description: "Arrival date"
    nullable: false
  - column: check_out
    type: date
    description: "Departure date"
    nullable: false
  - column: total_amount
    type: decimal(10,2)
    description: "Booking total in USD"
    nullable: false
freshness_sla: hourly
quality_checks:
  - null_check: [booking_id, hotel_id, total_amount]
  - range: [total_amount, 0, 100000]
```

## Catalog Maintenance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Add new datasets | On creation | Data team |
| Update schema | On schema change | Engineering |
| Audit ownership | Quarterly | Data team |
| Remove deprecated | As needed | Data team |
