# Database Performance

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query P95 latency | < 50ms | pg_stat_statements |
| Query P99 latency | < 200ms | pg_stat_statements |
| Connection utilization | < 70% of max_connections | pg_stat_activity |
| Cache hit ratio | > 99% | pg_stat_database (blks_hit / blks_read) |
| Index hit ratio | > 95% | pg_stat_user_tables (idx_scan / seq_scan) |
| Autovacuum lag | Last vacuum < 24 hours | pg_stat_user_tables |
| Replication lag | < 1 second (when replicas added) | pg_stat_replication |

## PostgreSQL Configuration

### Memory Settings (8 GB VPS)

```conf
shared_buffers = 2GB              # 25% of RAM
effective_cache_size = 6GB        # 75% of RAM
work_mem = 32MB                   # Per-operation sort memory
maintenance_work_mem = 512MB      # VACUUM, CREATE INDEX
wal_buffers = 16MB                # WAL write buffer
```

### Connection Settings

```conf
max_connections = 100             # Adjusted based on PgBouncer presence
superuser_reserved_connections = 5
```

With PgBouncer:
- PgBouncer: `default_pool_size = 50` (transaction mode)
- PostgreSQL: `max_connections = 60` (50 for app + 10 for maintenance/admin)

### Query Planner

```conf
random_page_cost = 1.1            # SSD storage
effective_io_concurrency = 200    # SSD can handle concurrent I/O
default_statistics_target = 100   # More detailed statistics
```

### Write-Ahead Log (WAL)

```conf
wal_level = replica               # Required for replication and backup
min_wal_size = 1GB                # Prevent too-frequent checkpoints
max_wal_size = 4GB                # Allow larger checkpoints on busy systems
checkpoint_completion_target = 0.9
```

### Autovacuum

```conf
autovacuum = on
autovacuum_max_workers = 3         # 1 per ~4GB shared_buffers
autovacuum_naptime = 60s           # Check every minute
autovacuum_vacuum_threshold = 1000 # Default
autovacuum_analyze_threshold = 500 # Default
autovacuum_vacuum_scale_factor = 0.01  # More aggressive (default 0.2)
autovacuum_analyze_scale_factor = 0.005 # More aggressive (default 0.1)
autovacuum_vacuum_cost_limit = 2000    # Higher limit = faster vacuum
```

## Connection Pooling

### Prisma Connection Pool

```typescript
const client = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Pool configuration
  connectionLimit: 10,  // Per schema
  poolTimeout: 30,      // Seconds
});
```

### PgBouncer (When Needed)

Deploy PgBouncer as a sidecar or companion container when `max_connections > 50`:

```ini
[databases]
triangle_black = host=postgres port=5432 dbname=triangle_black

[pgbouncer]
pool_mode = transaction
default_pool_size = 50
max_client_conn = 200
listen_addr = 0.0.0.0
listen_port = 6432
```

## Query Optimization

### Prisma Query Best Practices

**DO: Select only needed columns**
```typescript
// Bad — fetches all columns
await prisma.reservation.findMany({ where: { propertyId } });

// Good — fetches only displayed columns
await prisma.reservation.findMany({
  where: { propertyId },
  select: { id: true, guest: true, checkIn: true, status: true, totalAmount: true },
});
```

**DO: Use include sparingly**
```typescript
// Bad — includes all relations (potentially N+1)
await prisma.reservation.findMany({ include: { guest: true, units: true } });

// Good — batch load or use select with nested select
await prisma.reservation.findMany({
  select: {
    id: true,
    guest: { select: { id: true, firstName: true, lastName: true } },
  },
});
```

**DO: Use cursor-based pagination for large lists**
```typescript
// Bad — skip/scan (OFFSET performs poorly on large tables)
await prisma.reservation.findMany({ skip: 10000, take: 20 });

// Good — cursor-based
await prisma.reservation.findMany({
  take: 20,
  cursor: { id: 'last_id_from_previous_page' },
  orderBy: { createdAt: 'desc' },
});
```

### Raw SQL for Complex Queries

When Prisma cannot generate optimal SQL, use raw queries:

- **Aggregation queries** (OLAP-style)
- **Full-text search**
- **Date range overlap checks**
- **Window functions** (running totals, ranking)
- **Recursive CTEs** (hierarchical data)

## Autovacuum Tuning

### Monitoring Autovacuum

```sql
-- How dead tuples have accumulated
SELECT relname, n_live_tup, n_dead_tup,
       last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Autovacuum worker activity
SELECT query, state, wait_event
FROM pg_stat_activity
WHERE query LIKE 'autovacuum%';
```

### Aggressive Vacuum for Write-Heavy Tables

For tables with high write throughput (reservations, audit_log):

```sql
ALTER TABLE reservations SET (
  autovacuum_vacuum_scale_factor = 0.005,
  autovacuum_analyze_scale_factor = 0.0025,
  autovacuum_vacuum_threshold = 100
);

ALTER TABLE audit_log SET (
  autovacuum_vacuum_scale_factor = 0.001,
  autovacuum_vacuum_threshold = 100
);
```

### Manual Vacuum (Maintenance Window)

```bash
# Weekly maintenance (low-traffic period)
vacuumdb --all --analyze --verbose
vacuumdb --table reservations --full --verbose   # Monthly
```

## Partitioning

Large tables should be partitioned by date.

### reservation Partitioning

```sql
CREATE TABLE reservations (
  id UUID NOT NULL,
  property_id UUID NOT NULL,
  -- ... other columns ...
  created_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (created_at);

-- Create quarterly partitions
CREATE TABLE reservations_2026_q1
  PARTITION OF reservations
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE reservations_2026_q2
  PARTITION OF reservations
  FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
```

### audit_log Partitioning

```sql
CREATE TABLE audit_log (
  -- ...
  changed_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (changed_at);

CREATE TABLE audit_log_2026_01
  PARTITION OF audit_log
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

## Query Performance Monitoring

### pg_stat_statements

Enable by default:

```conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
```

```sql
-- Top 10 queries by total time
SELECT queryid, query, calls, total_time,
       mean_time, rows, shared_blks_hit, shared_blks_read
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Top 10 queries by mean time (slowest)
SELECT queryid, query, calls, mean_time, rows
FROM pg_stat_statements
WHERE calls > 100  -- Filter out one-off queries
ORDER BY mean_time DESC
LIMIT 10;
```

### Slow Query Log

```conf
log_min_duration_statement = 200   # Log queries > 200ms
log_connections = on
log_disconnections = on
log_checkpoints = on
log_lock_waits = on
```

## Health Check Queries

```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Cache hit ratio
SELECT 'cache_hit_ratio' as metric,
       ROUND(sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2)
FROM pg_stat_database;

-- Long-running queries (> 5 seconds)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE now() - pg_stat_activity.query_start > interval '5 seconds';

-- Table bloat estimate (simplified)
SELECT schemaname, tablename, n_dead_tup,
       n_live_tup, ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup, 0), 2) as dead_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 10;
```

## Anti-Patterns to Avoid

| Anti-pattern | Why | Fix |
|-------------|-----|-----|
| SELECT * in production | Returns unnecessary columns, increases I/O | Select only needed columns |
| N+1 queries in loops | One query per loop iteration | Batch with IN clause or Prisma include |
| Missing indexes on FKs | Sequential scan on every join | Index every FK column |
| UPDATE/DELETE without WHERE | Updates entire table | Always scope with WHERE |
| NOT IN subqueries | Slower than NOT EXISTS | Use NOT EXISTS or LEFT JOIN |
| Implicit type casting | Prevents index usage | Explicitly match column type |
| Long-running transactions | Blocks autovacuum, holds locks | Keep transactions short |
| SERIALIZABLE isolation | High overhead | Use READ COMMITTED (default) |
