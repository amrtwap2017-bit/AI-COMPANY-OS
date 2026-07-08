# Schema Architecture

## Overview

Triangle Black uses a **schema-per-tenant** database architecture. All tenants share a single PostgreSQL database, but each tenant's data lives in its own PostgreSQL schema.

```
Database: triangle_black
│
├── public (platform schema)
│   ├── tenants
│   ├── users
│   ├── refresh_tokens
│   ├── _prisma_migrations
│   └── schema_migrations (custom, tenant-tracking)
│
├── tenant_{id_hash_1}
│   ├── properties
│   ├── units
│   ├── rate_plans
│   ├── reservations
│   ├── reservation_units
│   ├── reservation_guests
│   ├── guests
│   ├── folios
│   ├── folio_entries
│   ├── payments
│   ├── housekeeping_tasks
│   └── audit_log
│
├── tenant_{id_hash_2}
│   └── ... (same structure)
│
├── tenant_{id_hash_N}
│   └── ... (same structure)
│
└── platform_audit_log (global audit)
```

## Schema Resolution

### How Prisma Connects to the Correct Schema

Prisma does not natively support schema-per-tenant switching. We implement a custom connection strategy:

```typescript
// shared/prisma/prisma.service.ts
@Injectable()
export class PrismaService {
  private clients = new Map<string, PrismaClient>();

  async getClient(tenantId?: string): Promise<PrismaClient> {
    const key = tenantId ?? 'public';

    if (!this.clients.has(key)) {
      const schema = tenantId
        ? `tenant_${tenantId}`
        : 'public';

      const client = new PrismaClient({
        datasources: {
          db: {
            url: `${DATABASE_URL}?schema=${schema}`,
          },
        },
      });

      await client.$connect();
      this.clients.set(key, client);
    }

    return this.clients.get(key)!;
  }
}
```

### Connection Pool Strategy

```
Single pool per schema (cached):

┌────────────┐
│ Request 1  │──┐
└────────────┘  │  ┌──────────────────┐  ┌────────────┐
                ├──│ PrismaClient     │──│ PostgreSQL  │
┌────────────┐  │  │ (tenant_abc)     │  │ schema     │
│ Request 2  │──┘  │ pool: 10 conns   │  │ tenant_abc │
└────────────┘     └──────────────────┘  └────────────┘

┌────────────┐     ┌──────────────────┐  ┌────────────┐
│ Request 3  │─────│ PrismaClient     │──│ PostgreSQL  │
└────────────┘     │ (tenant_xyz)     │  │ schema     │
                   │ pool: 10 conns   │  │ tenant_xyz │
                   └──────────────────┘  └────────────┘
```

### PgBouncer Consideration

At scale (> 50 concurrent connections across all schemas), add PgBouncer:

```
App ──► PgBouncer (transaction mode) ──► PostgreSQL
         Pool: 50-100 connections
         Each PrismaClient connects via PgBouncer
         PgBouncer routes by database/schema in connection string
```

## Platform Schema (public)

Contains tables that are **shared across all tenants**:

| Table | Purpose |
|-------|---------|
| `tenants` | Tenant registry — one row per tenant |
| `users` | Platform users (staff, admins) — linked to tenants |
| `refresh_tokens` | Auth refresh tokens — shared for single sign-on |
| `_prisma_migrations` | Prisma migration tracking |
| `schema_migrations` | Tracks which migrations have been applied to which tenant schemas |

## Tenant Schema

Each tenant schema contains all per-tenant tables. Every tenant schema is **identical in structure** — the same tables, columns, indexes, and constraints.

### Tenant Id Format

```
Tenant schema name: tenant_{id_hash}

Where id_hash = LOWER(LEFT(MD5(tenant.id::text), 8))

Examples:
  tenant.id = '550e8400-e29b-41d4-a716-446655440000'
  id_hash = '550e8400'
  schema name = 'tenant_550e8400'
```

Uses first 8 hex chars of MD5 of the UUID to create a unique, URL-safe schema name.

### Tenant Schema Contents

Standard tables in every tenant schema:
- `properties`
- `units`
- `rate_plans`
- `reservations`
- `reservation_units`
- `reservation_guests`
- `guests`
- `folios`
- `folio_entries`
- `payments`
- `housekeeping_tasks`
- `audit_log`

## Migration Strategy

See [Migration.md](./Migration.md) for details.

Summary:
1. Prisma generates standard migration SQL
2. Migration script applies DDL to all existing tenant schemas
3. New tenant schemas are created from a template (snapshot of clean structure)

## Schema Evolution

### Adding a New Table

1. Add to Prisma schema
2. Generate migration
3. Migration script applies `CREATE TABLE` to public schema + all tenant schemas
4. Update the tenant template for future tenants

### Adding a Column

1. Add to Prisma schema
2. Generate migration with `ALTER TABLE ... ADD COLUMN`
3. Migration script applies to all schemas
4. New column has a default value or is nullable (existing rows unaffected)

### Renaming a Column

1. Add new column
2. Dual-write to both columns during deployment
3. Backfill data
4. Remove old column in next release

## Safety

| Concern | Safeguard |
|---------|-----------|
| Querying wrong schema | `search_path` is set per connection |
| Missing a tenant schema | Migration script iterates all schemas from `tenants` table |
| Creating duplicate schemas | Check existence before `CREATE SCHEMA IF NOT EXISTS` |
| Dropping in-use schema | Application health check must fail if schema missing |
| Connection leak | PrismaClient is cached and reused; disconnected on app shutdown |
