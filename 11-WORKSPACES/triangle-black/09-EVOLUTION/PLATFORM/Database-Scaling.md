# 06 — Database Scaling

> Database scaling strategy for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 3 — Physical-Database.md | Database architecture |
| Phase 10 — Scaling-Strategy.md | Scaling approach |

## Scaling Evolution

```
Single DB ──► Read Replicas ──► Connection Pooling ──► Sharding ──► Distributed
   │               │                  │                    │              │
 1-10           10-100            50-500              500-2,000      2,000+
hotels          hotels            hotels              hotels          hotels
```

## Read Replicas

| Aspect | Configuration |
|--------|---------------|
| Replicas | 1-3 per primary |
| Replication | Streaming (synchronous) |
| Fallback | Auto-failover to replica |
| Read load | Analytics, reports, dashboards → replicas |
| Write load | Primary only |

## Connection Pooling

| Pooler | Configuration | Benefits |
|--------|--------------|----------|
| PgBouncer | Transaction pooling | Reduce connection overhead, support more connections |
| Max connections | 100 | Application side |
| Pool size | 20-50 | PgBouncer side |

## Database Sharding (H2)

| Strategy | Tenants per Shard | Shard Key |
|----------|------------------|-----------|
| Tenant-based sharding | 50-100 hotels | tenant_id |
| Shard allocation | On tenant creation | Based on hash ring |
| Cross-shard queries | Avoid | Analytics use warehouse |
| Resharding | Planned, with migration | Manual process |

## Performance Optimization

| Optimization | Impact | Effort | Timeline |
|-------------|--------|--------|----------|
| Index optimization | High | Medium | Current |
| Query optimization | High | Medium | Continuous |
| Materialized views | Medium | Low | H1 |
| Table partitioning | Medium | Medium | H1 |
| Archive old data | Medium | Low | H1 |
| Upgrade PostgreSQL | High | Low | H2 (v16+) |
