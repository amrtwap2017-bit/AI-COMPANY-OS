# Soft Delete Strategy

## Philosophy

Application code never executes `DELETE FROM table WHERE ...`. Instead, records are marked as deleted by setting the `deleted_at` timestamp.

This preserves referential integrity, enables data recovery, and maintains audit history.

## Implementation

### deleted_at Column

Every table includes:

```sql
deleted_at TIMESTAMPTZ NULL
```

- `NULL` = record is active
- `NOT NULL` = record is soft-deleted

### Application-Level Filtering

**Prisma middleware** or a **NestJS interceptor** automatically filters out soft-deleted records:

```typescript
// Prisma middleware example
prisma.$use(async (params, next) => {
  const modelHasDeletedAt = ['property', 'reservation', 'guest', /* ... */].includes(params.model);

  if (modelHasDeletedAt) {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, deletedAt: null };
    }
    if (params.action === 'findMany') {
      if (!params.args.where) {
        params.args.where = {};
      }
      params.args.where.deletedAt = null;
    }
  }

  return next(params);
});
```

### Soft Delete Operation

```typescript
async softDelete(id: string, userId: string): Promise<void> {
  await this.prisma.reservation.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
      status: 'CANCELLED',  // if applicable
    },
  });

  // Log audit entry
  await this.auditService.log({
    action: 'DELETE',
    tableName: 'reservations',
    recordId: id,
    // ...
  });
}
```

### Hard Delete Exception

Hard deletes are only performed in these scenarios:

1. **Tenant deletion** — `DROP SCHEMA tenant_xxx CASCADE` when a tenant is fully removed
2. **Data cleanup** — admin tool (audit-logged) to purge orphaned test data
3. **GDPR fulfillment** — permanent deletion after retention period expires
4. **Bulk archival** — remove archived records older than retention policy

Each hard delete must be:
- Logged in the audit trail
- Approved by an admin (two-person rule for > 100 records)
- Run during maintenance window

## Query Behavior

### Default Queries (Active Only)

```sql
-- Prisma generates: WHERE deleted_at IS NULL
SELECT * FROM reservations WHERE deleted_at IS NULL;
```

### Including Deleted Records

```typescript
// Explicitly include soft-deleted records
await prisma.reservation.findMany({
  where: { deletedAt: { not: null } },
});
```

### Recovering Deleted Records

```typescript
async restore(id: string, userId: string): Promise<void> {
  await this.prisma.reservation.update({
    where: { id },
    data: {
      deletedAt: null,
      updatedBy: userId,
    },
  });
}
```

## Unique Constraints with Soft Deletion

Unique constraints conflict with soft deletion — if a record is "deleted," a new record with the same unique slug/email/etc. cannot be created.

### Solution: Partial Unique Indexes

```sql
-- Instead of UNIQUE constraint on email
CREATE UNIQUE INDEX uq_user_email_active
  ON users (email)
  WHERE deleted_at IS NULL;

-- Instead of UNIQUE constraint on slug
CREATE UNIQUE INDEX uq_property_slug_active
  ON properties (slug)
  WHERE deleted_at IS NULL;

-- Instead of UNIQUE constraint on confirmation_code
CREATE UNIQUE INDEX uq_reservation_confirmation_code_active
  ON reservations (confirmation_code)
  WHERE deleted_at IS NULL;
```

This ensures uniqueness only among active records. "Deleted" records can have duplicate values.

## Cascade Behavior with Soft Deletes

When a parent is soft-deleted:
- Children remain visible (orphaned records are queryable)
- Application code handles "parent is deleted" state
- No cascade of `deleted_at`

```typescript
// When fetching a reservation, check if property is deleted
const reservation = await prisma.reservation.findUnique({ where: { id } });
if (reservation.property.deletedAt) {
  // Handle gracefully — show "Property no longer available"
}
```

## Reporting and Analytics

All reports must explicitly decide how to handle soft-deleted records:

| Scenario | Include Deleted? | Rationale |
|----------|-----------------|-----------|
| Financial reports | Yes | Deleted records still have financial impact |
| Occupancy reports | No | Deleted reservations never occupied |
| Guest history | Yes | Guest's past stays remain visible |
| Current operations | No | Only active records in daily workflow |
| Audit/compliance | Yes | Full record of all activity |

## Data Retention Policy

| Data Type | Retention | Action After |
|-----------|-----------|-------------|
| Soft-deleted reservations | 3 years | Permanent deletion |
| Soft-deleted guests | 5 years | Anonymization (GDPR) |
| Soft-deleted properties | 1 year | Permanent deletion |
| Audit log | 2 years | Export and truncate |
| Soft-deleted users | 90 days | Permanent deletion |
| Payment records | 7 years (legal) | Never delete (soft-delete only) |

## Monitoring

```sql
-- Count soft-deleted records per table
SELECT 'properties' as table_name, COUNT(*) FROM properties WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'guests', COUNT(*) FROM guests WHERE deleted_at IS NOT NULL;

-- Soft-deleted records older than retention policy
SELECT 'reservations' as table_name, id, deleted_at FROM reservations
WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '3 years';
```
