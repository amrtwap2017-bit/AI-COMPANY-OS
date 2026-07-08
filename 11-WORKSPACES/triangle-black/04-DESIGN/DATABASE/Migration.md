# Migration Strategy

## Prisma Migrations

Prisma manages schema migrations declaratively. The workflow is:

```
Edit schema.prisma  ──►  Generate migration  ──►  Apply to database
```

## Workflow

### Development

```bash
# After editing schema.prisma:
npx prisma migrate dev --name add-payment-status

# This:
# 1. Compares schema.prisma with current database state
# 2. Generates a migration SQL file in prisma/migrations/
# 3. Applies it to the local development database
# 4. Regenerates Prisma Client
```

### Staging / Production

```bash
# Generate migration (without applying)
npx prisma migrate dev --create-only --name add-payment-status

# Review the generated SQL in prisma/migrations/{timestamp}_add_payment_status/
# Then apply:
npx prisma migrate deploy
```

## Multi-Tenant Migration Strategy

Schema-per-tenant adds complexity: migrations must be applied to **every** tenant schema.

### Migration Flow

```
1. Generate Prisma migration (standard)
2. Custom migration script:
   a. Apply to public schema first
   b. Iterate over all tenant schemas
   c. Apply the same migration to each tenant schema
   d. Record which tenant schemas have which migrations
```

### Migration Script (Pseudo-code)

```typescript
async function runMultiTenantMigration(): Promise<void> {
  // 1. Run Prisma migrate on public schema
  execSync('npx prisma migrate deploy');

  // 2. Get list of pending migrations
  const pendingMigrations = getPendingMigrations('public');

  // 3. Get all active tenant schemas
  const tenants = await prisma.public.tenant.findMany({
    where: { status: 'active', deletedAt: null },
  });

  // 4. For each tenant schema:
  for (const tenant of tenants) {
    const schemaName = `tenant_${tenant.id}`;

    // 4a. Apply each pending migration
    for (const migration of pendingMigrations) {
      const sql = readMigrationSql(migration);
      const tenantSql = sql.replace(/public\./g, `${schemaName}.`);
      await executeRaw(tenantSql);

      // 4b. Record migration in tenant's tracking table
      await recordMigration(tenant, migration);
    }
  }
}
```

### Tenant Schema Tracking

Each tenant schema tracks its migration state:

```sql
TABLE schema_migrations (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID          NOT NULL REFERENCES tenants(id),
  migration_name VARCHAR(255) NOT NULL,
  applied_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  duration_ms   INTEGER       NOT NULL,
  success       BOOLEAN       NOT NULL DEFAULT true,
  error_message TEXT          NULL
);

CREATE UNIQUE INDEX uq_schema_migration
  ON schema_migrations (tenant_id, migration_name);
```

## Creating a New Tenant Schema

When a new tenant signs up:

```typescript
async function createTenantSchema(tenantId: string): Promise<void> {
  const schemaName = `tenant_${tenantId}`;

  // 1. Create the schema
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

  // 2. Apply all existing migrations
  const allMigrations = getAllMigrations();
  for (const migration of allMigrations) {
    const sql = readMigrationSql(migration);
    const tenantSql = sql.replace(/public\./g, `${schemaName}.`);
    await prisma.$executeRawUnsafe(tenantSql);
    await recordMigration({ tenantId, migrationName: migration });
  }
}
```

### Optimization: Schema Template

For faster tenant creation, maintain a template schema:

```bash
# After migrations are applied to the template:
pg_dump --schema-only --schema=tenant_template triangle_black > tenant_template.sql

# New tenant:
psql -d triangle_black -c "CREATE SCHEMA tenant_abc123;"
psql -d triangle_black -c "SET search_path TO tenant_abc123;"
psql -d triangle_black < tenant_template.sql
```

## Migration Guidelines

### Safe Migrations

| Operation | Safe (zero-downtime) | Notes |
|-----------|---------------------|-------|
| `CREATE TABLE` | Yes | New table, no impact |
| `ADD COLUMN NULL` | Yes | Existing rows store NULL |
| `ADD COLUMN DEFAULT` | Yes (with `NOT NULL`) | Use `DEFAULT` + `NOT NULL` |
| `ADD INDEX CONCURRENTLY` | Yes | No table lock |
| `DROP INDEX CONCURRENTLY` | Yes | No table lock |
| `ALTER COLUMN TYPE` | Maybe | Requires `USING` clause; may lock |
| `ADD FOREIGN KEY` | Yes (if `NOT VALID`) | Validate later with `VALIDATE CONSTRAINT` |
| `DROP COLUMN` | No | Mark as unused, drop in next release |
| `RENAME COLUMN` | No | Add new column, dual-write, drop old |
| `ADD PRIMARY KEY` | No | Requires exclusive lock; do in maintenance window |
| `CREATE UNIQUE INDEX CONCURRENTLY` | Yes | No table lock |

### Deployment Pattern

```
Release N:
  - Migration adds new_column (nullable)
  - Application code updates to dual-write
  - Old code ignores new_column

Release N+1:
  - Migration makes new_column NOT NULL
  - Application code uses new_column as primary
  - Remove old column references

Release N+2:
  - Migration drops old column
```

### Migration Checklist

Before deploying any migration:

1. **Review generated SQL** — does it match expectations?
2. **Check for locks** — does it need `CONCURRENTLY`?
3. **Test on staging** — apply to a copy of production data
4. **Plan rollback** — what's the revert strategy?
5. **Time it** — estimate duration, especially for large tables

## Rollback Strategy

### Prisma Migration Rollback

```bash
# Rollback the last migration
npx prisma migrate resolve --rolled-back {migration_name}

# Apply a down migration manually (if written)
psql -d triangle_black -f migrations/{name}/down.sql
```

### Multi-Tenant Rollback

```typescript
async function rollbackMigration(migrationName: string): Promise<void> {
  const tenants = await getActiveTenants();

  for (const tenant of tenants) {
    const schemaName = `tenant_${tenant.id}`;
    const downSql = readDownMigrationSql(migrationName);
    const tenantSql = downSql.replace(/public\./g, `${schemaName}.`);
    await executeRaw(tenantSql);
    await removeMigrationRecord(tenant, migrationName);
  }

  // Roll back public schema
  execSync(`npx prisma migrate resolve --rolled-back ${migrationName}`);
}
```

**Always write a down migration** for every migration that is not trivially reversible.
