# Stage 04: Database

## Purpose

Design database schema changes, generate Prisma migrations, review query performance impact, and ensure schema changes follow established conventions.

## Agent Role

**Database Architect AI** — Responsible for schema design, migration generation, and query optimization review.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Architecture Spec | Architecture artifact with status `APPROVED` |
| Existing Schema | Current Prisma schema and migration history are accessible |
| Data Model Requirements | Entity definitions and relationships are defined in the architecture spec |

## Process

### Step 1: Design Schema Changes
- Identify new models, fields, enums, and relations required by the feature.
- Follow naming conventions: `snake_case` for table/column names, plural for tables.
- Add indexes for all foreign keys and frequently queried columns.
- Define constraints (unique, check, not null) at the schema level.
- For multi-tenant schemas, ensure `tenantId` is included and indexed.

### Step 2: Write Prisma Migrations
- Update `schema.prisma` with the new models and fields.
- Use `prisma migrate dev --create-only` to generate the migration SQL.
- Review the generated SQL for correctness and performance implications.
- Name migrations descriptively: `YYYYMMDDHHMMSS_<feature_name>`.

### Step 3: Review Query Impact
- For each new query pattern the feature requires:
  - Write the expected Prisma query.
  - Check if existing indexes cover it.
  - Add composite indexes where necessary for multi-filter queries.
  - Flag any N+1 query patterns or large table scans.

### Step 4: Validate Migration Safety
- Ensure the migration is backward-compatible (no destructive changes on production).
- If dropping or renaming columns is required, plan a multi-step migration:
  - Phase 1: Add new column, dual-write.
  - Phase 2: Migrate data, backfill.
  - Phase 3: Drop old column.
- Verify rollback script exists.

### Step 5: Submit for Approval
- Write the database migration artifact to `.migration.md`.
- Include the generated SQL diff, index changes, and query plan analysis.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Migration Approved | Artifact status is `APPROVED` |
| Prisma Schema Updated | `schema.prisma` reflects all new models and fields |
| Migration SQL Generated | Migration file exists and is reviewable |
| Indexes Defined | All foreign keys and query-filtered columns are indexed |
| No Breaking Changes | Migration is backward-compatible or phased plan exists |
| Query Plan Verified | No full table scans on large tables (>100k rows) |

## Artifact Template

```markdown
# Database Migration: <Feature Title>

**Architecture Spec**: `ARCH-<ID>`
**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Schema Changes
### New Models
- `OrderItem`: fields (id, orderId, productId, quantity, price)

### Modified Models
- `Order`: added field `shippingAddress` (String, optional)

### New Relations
- Order → OrderItem (one-to-many)

## Prisma Schema Diff
```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Decimal
  order     Order   @relation(fields: [orderId], references: [id])
}
```

## Migration SQL
```sql
CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  ...
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
```

## Index Changes
| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| OrderItem | orderId_idx | B-tree | Foreign key lookup |

## Query Plan Analysis
- `findMany({ where: { orderId } })` — uses `orderId_idx` (Index Scan)
- `findMany({ where: { order: { status: "PENDING" } } })` — needs composite index

## Rollback Plan
```bash
prisma migrate resolve --rolled-back <migration_name>
```

## Risk Flags
- [x] Backward compatible
- [ ] Breaking change — phased migration plan attached
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Missing indexes | Add indexes for each foreign key and query filter |
| Destructive migration on production | Split into phased backward-compatible migrations |
| N+1 query risk | Add eager loading (`include`/`select`) or batch queries |
| Large table without index | Analyze query patterns and add targeted indexes |

## Cross-References

- [03-Architecture.md](./03-Architecture.md)
- [Standards: Database Standards](../05-STANDARDS/Database-Standards.md)
