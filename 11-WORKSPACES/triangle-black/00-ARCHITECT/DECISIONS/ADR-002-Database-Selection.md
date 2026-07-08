# ADR-002: Database Selection

**Status:** Accepted

**Context:** Triangle Black requires a database that supports multi-tenant isolation, handles structured and semi-structured hospitality data, provides excellent query performance for OLTP workloads, and can scale from a single instance to a distributed setup. The database will store properties, reservations, guests, billing, housekeeping, and audit data.

**Decision:**

We will use **PostgreSQL 16+** as the primary database.

Key factors:
- **Schema-per-tenant** — PostgreSQL's schema isolation is mature and well-supported
- **JSONB** — flexible storage for amenity lists, rate plans, and extensible property attributes
- **GIN indexes** — efficient indexing on JSONB and array columns
- **ACID compliance** — critical for booking and billing transactions
- **PgBouncer compatibility** — connection pooling for many schemas
- **pg_stat_statements** — built-in query performance monitoring
- **Maturity** — 30+ years of production use, massive community
- **Hosting flexibility** — runs on any VPS, fully open source

**Consequences:**

*Positive:*
- Schema-per-tenant provides strong data isolation without separate databases
- JSONB allows flexible property configurations without schema migrations
- Excellent tooling (pgAdmin, pg_dump, pg_restore) for backup and administration
- Row-level security (RLS) can be an additional isolation layer if needed
- Extensions (PostGIS, pg_cron, pg_partman) support future requirements

*Negative:*
- Connection management becomes more complex with many schemas
- Schema-per-tenant means migrations must run per-schema
- PostgreSQL does not auto-shard; horizontal scaling requires manual partitioning or Citus
- Backup granularity is per-database, not per-schema; tenant-level restore requires scripting
- JSONB queries are less performant than normalized columns for high-traffic paths

**Alternatives:**
- **MySQL 8** — rejected: schema-per-tenant equivalent (database-per-tenant) is heavier; weaker JSONB support
- **SQLite** — rejected: no multi-tenant isolation, no network access, write contention
- **MongoDB** — rejected: weaker ACID compliance; document model less suitable for relational booking data
- **CockroachDB** — rejected: over-engineered for launch, expensive hosted options
- **PlanetScale (Vitess)** — rejected: schema-per-tenant not well supported; MySQL-compatible limitations
- **Supabase** — considered for future managed hosting but not for self-hosted V1

**Related ADRs:** ADR-001 (Tech Stack), ADR-005 (Multi-tenancy), ADR-009 (Deployment)
