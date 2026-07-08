# ADR-005: Multi-Tenancy

**Status:** Accepted

**Context:** Triangle Black serves multiple hotel/lodging clients from a single application instance. Each tenant's data must be isolated from others to prevent data leaks, comply with data protection regulations, and allow granular backup/restore per tenant. We need a multi-tenancy strategy that works at launch scale (10-100 tenants) and can evolve as the platform grows.

**Decision:**

We will use **schema-per-tenant** as the primary multi-tenancy strategy for V1.

Architecture:
```
Database: triangle_black
├── public schema (platform-wide data)
│   ├── tenants         (tenant registry)
│   ├── users           (platform users, auth)
│   └── migrations      (Prisma migrations)
├── tenant_abc1 schema
│   ├── properties, units, rate_plans
│   ├── reservations, guests
│   ├── folios, payments, invoices
│   ├── housekeeping_tasks
│   └── ... (all per-tenant tables)
├── tenant_xyz2 schema
│   └── ... (same structure)
└── tenant_* (N more schemas)
```

Tenant resolution flow:
1. Request arrives with tenant identifier (subdomain or header)
2. TenantResolver middleware extracts and validates tenant
3. Prisma connection switches to the appropriate schema via `SET search_path`
4. All subsequent queries in that request are isolated to the tenant schema

**Consequences:**

*Positive:*
- Strong data isolation — no way to accidentally query another tenant's data
- Backup/restore per tenant — script that dumps/restores individual schemas
- Easy tenant deletion — `DROP SCHEMA tenant_xxx CASCADE`
- Schema-per-tenant allows future per-tenant configuration (custom fields as columns)
- Works naturally with PostgreSQL's schema support

*Negative:*
- Prisma does not natively support schema-per-tenant; requires custom connection management
- Each tenant schema requires migration (N schemas × M migrations)
- Connection pooling becomes challenging with many schemas (PgBouncer workaround needed)
- `search_path` switching has overhead; connection-per-tenant pools may be needed at scale
- No tenant-level replication; all schemas live in one database

**Future Evolution:**
- **V2:** Add tenant-granularity connection pools for larger tenants
- **V3:** Shard by tenant group (multiple PostgreSQL instances, each with a subset of schemas)
- **V4:** Dedicated database instances for enterprise tenants

**Alternatives:**
- **Database-per-tenant** — rejected: too heavy; each tenant creates a full database; backup/connection management overhead
- **Row-level (discriminator column)** — rejected: weaker isolation; risk of data leaks; harder to delete tenants
- **Shared schema with RLS** — rejected: PostgreSQL RLS adds query overhead; harder to reason about security
- **Hybrid (schema for large tenants, shared for small)** — considered for V2 but too complex for V1
- **No multi-tenancy (single tenant per instance)** — rejected: doesn't match the business model

**Related ADRs:** ADR-001 (Tech Stack), ADR-002 (Database), ADR-009 (Deployment)
