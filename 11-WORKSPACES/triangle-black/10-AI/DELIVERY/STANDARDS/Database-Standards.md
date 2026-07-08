# Database Standards

## Technology

- **ORM**: Prisma (primary data access layer).
- **Database**: PostgreSQL 15+.
- **Migration Tool**: Prisma Migrate.

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Tables | `snake_case`, plural | `order_items` |
| Columns | `snake_case` | `created_at` |
| Primary Keys | `id` (UUID, `String` type) | `id String @id @default(cuid())` |
| Foreign Keys | `<referenced_table_singular>_id` | `order_id` |
| Indexes | `<table>_<column>_idx` | `order_items_order_id_idx` |
| Unique Constraints | `<table>_<columns>_key` | `users_email_key` |
| Enums | PascalCase | `OrderStatus` |
| Junction Tables | `table1_table2` (alphabetical) | `orders_products` |
| Views | `v_<descriptive_name>` | `v_active_orders` |

## Migration Practices

### Creating Migrations

```bash
prisma migrate dev --create-only --name <descriptive_name>
```

- Always review the generated SQL before applying.
- Name migrations descriptively: `add_order_item_model`.
- One migration per logical change — do not combine unrelated schema changes.

### Migration Structure

Each migration should:
1. Be backward-compatible for at least one release cycle.
2. Not drop columns or tables without a phased migration plan.
3. Include a rollback script comment in the migration file.

### Phased Migrations for Breaking Changes

**Phase 1**: Add new column/table, dual-write to old and new.
**Phase 2**: Backfill data, verify consistency, switch reads to new.
**Phase 3**: Remove old column/table, cleanup.

```prisma
// Phase 1: Add new column
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  emailNew  String?  @unique  // new column, nullable initially
}
```

## Indexing Strategy

### When to Index
- All foreign key columns — **always**.
- Columns used in `WHERE`, `ORDER BY`, `GROUP BY`, or `JOIN` clauses.
- Columns with high cardinality (many unique values).
- Date/time columns used for range queries or sorting.

### Index Types

| Index Type | When to Use |
|-----------|-------------|
| B-tree (default) | Most queries: equality, range, sorting |
| Composite B-tree | Multi-column filters (order by selectivity) |
| Partial index | Filtered subset of data (`WHERE status = 'ACTIVE'`) |
| Covering index | Queries that need only indexed columns |
| GIN | Array/jsonb columns with `@>` or `?` operators |
| GiST | Full-text search, geospatial data |

### Composite Indexes
- Order by **selectivity** (most selective column first).
- Example: `INDEX ON orders (tenant_id, status, created_at)`.

### Index Maintenance
- Monitor unused indexes with `pg_stat_user_indexes`.
- Remove indexes that are never used.
- Reindex periodically for heavily updated tables.

## Query Optimization

### Rules
- Always use `SELECT` specific columns, never `SELECT *`.
- Use pagination (`LIMIT`/`OFFSET` or cursor-based) for list queries.
- Avoid N+1 queries — use Prisma `include` with batching.
- Use `EXPLAIN ANALYZE` to verify query plans before deploying.
- Keep transactions short — never hold transactions across HTTP requests.

### N+1 Prevention
```typescript
// ❌ Bad — N+1
for (const order of orders) {
  await prisma.orderItem.findMany({ where: { orderId: order.id } });
}

// ✅ Good — batch with include
const orders = await prisma.order.findMany({
  include: { items: true },
});
```

### Pagination
```typescript
// Cursor-based pagination (preferred)
const page = await prisma.order.findMany({
  take: 20,
  skip: 0,
  cursor: lastCursor ? { id: lastCursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

## Schema-per-Tenant Conventions

For multi-tenant features:

- Every tenant-scoped table must have a `tenant_id` column.
- Index on `(tenant_id, ...other_filters)` for tenant queries.
- Use Prisma middleware or row-level security to enforce tenant isolation.
- Application layer must pass `tenantId` for all scoped queries.

```prisma
model Order {
  id        String   @id @default(cuid())
  tenantId  String
  status    OrderStatus
  createdAt DateTime @default(now())

  @@index([tenantId, status, createdAt])
}
```

## Data Types

| Concept | Prisma Type | Notes |
|---------|------------|-------|
| IDs | `String` (CUID) | UUID preference |
| Monetary | `Decimal` | Avoid `Float` for currency |
| Dates | `DateTime` | Always store in UTC |
| JSON | `Json` | Use `JsonValue` type |
| Enums | `enum` in Prisma | Prefer DB enums over strings |
| Large text | `String` with no `@db.Text` limit | For unlimited text fields |
| Boolean | `Boolean` | Default to `false` |

## Backup & Recovery

- Automated daily backups with point-in-time recovery (PITR) enabled.
- Test restore procedure quarterly.
- Migration rollback scripts are required for every migration that changes existing data.
