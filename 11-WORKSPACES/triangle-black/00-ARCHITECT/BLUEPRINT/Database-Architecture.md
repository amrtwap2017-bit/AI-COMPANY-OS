# Phase 02 — Database Architecture

> PostgreSQL database architecture with schema-per-tenant isolation.

## Architecture

```
PostgreSQL 16 Instance
├── postgres                          # System database
├── template1                         # Template for new databases
├── shared                            # Shared schema (platform data)
│   ├── tenants                       # Tenant registry
│   ├── plans                         # Subscription plans
│   └── migrations                    # Shared migration tracking
├── tenant_{uuid}                     # Per-tenant schema (one per customer)
│   ├── users, roles, permissions     # Identity & access
│   ├── leads, opportunities, quotes  # Commercial
│   ├── projects, milestones, ncrs    # Project delivery
│   ├── purchase_orders, receipts     # Procurement
│   ├── stock, warehouses             # Inventory
│   ├── invoices, revenue             # Financial control
│   └── ...                           # Other domain tables
└── tenant_{uuid}                     # Next tenant
    └── ...
```

## Schema-Per-Tenant Design

| Aspect | Implementation |
|--------|---------------|
| Isolation | Each tenant has a dedicated PostgreSQL schema |
| Creation | Runtime schema provisioning with base table set |
| Migration | Prisma runs migrations per tenant schema |
| Query | `SET search_path TO tenant_{uuid}` at connection start |
| Backup | `pg_dump` per schema for granular restore |
| Performance | Connection pooling with schema-scoped connections |

## ORM Strategy

| Tool | Usage | Why |
|------|-------|-----|
| Prisma 6 | Primary ORM | Type-safe, auto-generated client |
| Raw SQL | Complex queries | Performance optimization |
| Migrations | Prisma Migrate | Schema versioning |

## Indexing Strategy

- B-tree indexes on all foreign keys
- Composite indexes on common query patterns (tenant_id + display_id, status + created_at)
- GIN indexes on JSONB columns
- Unique indexes on display_id per entity

## Backup Strategy

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Full database | Daily | 30 days | DO Spaces |
| WAL archiving | Continuous | 7 days | Local volume |
| Schema dump | Per migration | Permanent | Git LFS |

## Related Documents

- [Physical Database](../PHASE-03-DIGITAL-TWIN-DESIGN/Physical-Database.md) — Detailed schema design
- `06-DATA-FOUNDATION/` in Phase 5 — Implementation details
