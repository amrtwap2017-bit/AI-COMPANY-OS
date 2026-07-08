# Scalability Strategy

## Philosophy

**Vertical first, horizontal later.** At launch scale (single VPS, < 100 tenants), vertical scaling is simpler, cheaper, and more reliable. Horizontal scaling adds complexity that we defer until proven necessary.

## Scaling Stages

### Stage 1: Vertical Scaling ($25-40/mo VPS)

| Resource | Initial | Upgrade Path |
|----------|---------|-------------|
| CPU | 2-4 vCPUs | 8-16 vCPUs |
| RAM | 4-8 GB | 16-32 GB |
| Storage | 100 GB SSD | 500 GB SSD |
| PostgreSQL | Single instance | Tune shared_buffers, work_mem |
| Connections | < 100 concurrent | Increase max_connections |

**Target capacity:** 50-100 tenants, 500-1000 daily reservations.

### Stage 2: Read Replicas (Database Scaling)

When reads become the bottleneck (> 80% read queries):

```
┌──────────┐     ┌──────────┐
│ Primary   │────►│ Replica  │
│ (writes)  │     │ (reads)  │
└──────────┘     └──────────┘
                       │
               ┌───────┴───────┐
               │  Analytics    │
               │  Reporting    │
               └───────────────┘
```

**Changes:** Configure Prisma to route read queries to replica. Analytics module connects directly to replica.

### Stage 3: Application Horizontal Scaling

When the NestJS process reaches CPU/memory limits:

```
┌──────────┐     ┌──────────┐
│  Nginx    │────►│ NestJS 1 │
│ (round-   │     ├──────────┤
│  robin)   │────►│ NestJS 2 │
└──────────┘     ├──────────┤
                  │ NestJS N │
                  └──────────┘
```

**Prerequisites:**
- Stateless application (JWT handles session state)
- Redis for distributed cache (shared across instances)
- Nginx upstream configuration with `ip_hash` if needed

### Stage 4: Full Horizontal Scaling

```
┌──────────┐     ┌──────────┐
│  CDN     │────►│  Nginx   │
│ (assets) │     │ (LB)     │
└──────────┘     └────┬─────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
     ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
     │ Next.js │ │ NestJS  │ │ NestJS  │
     │ (x2)   │ │ (x3)    │ │ Worker  │
     └─────────┘ └─────────┘ └─────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
     ┌────┴────┐ ┌────┴────┐     │
     │ Primary │ │ Replica │ ┌───┴────┐
     │ PG      │ │ PG      │ │ Redis  │
     └─────────┘ └─────────┘ │ Cluster│
                              └────────┘
```

## Vertical Scaling Guide

### PostgreSQL Tuning (per VPS spec)

| Setting | 4 GB RAM | 8 GB RAM | 16 GB RAM |
|---------|----------|----------|-----------|
| `shared_buffers` | 1 GB | 2 GB | 4 GB |
| `effective_cache_size` | 3 GB | 6 GB | 12 GB |
| `work_mem` | 16 MB | 32 MB | 64 MB |
| `maintenance_work_mem` | 256 MB | 512 MB | 1 GB |
| `random_page_cost` | 1.1 (SSD) | 1.1 | 1.1 |
| `max_connections` | 50 | 100 | 200 |

### Application Tuning

| Parameter | Recommendation |
|-----------|--------------|
| Node.js `--max-old-space-size` | 75% of available RAM |
| NestJS compression | Enable gzip/brotli for responses |
| Prisma connection pool | `connection_limit: 10-20` (depends on `max_connections`) |
| Redis caching TTL | 60s for API responses, 300s for reference data |
| Nginx `worker_processes` | `auto` (one per CPU core) |

## Horizontal Scaling Readiness

Built-in from day one to avoid rewrites:

| Aspect | Readiness |
|--------|-----------|
| **Session state** | JWT (no server-side sessions) |
| **File storage** | Local disk now, S3-compatible interface (MinIO in V2) |
| **Cache** | Redis (externalizable) |
| **Queues** | Bull with Redis (distributed by default) |
| **Logging** | Structured JSON (ready for centralized logging) |
| **Database** | Prisma supports connection pooling and read replicas |

## Capacity Planning

### Formula

```
Monthly Active Tenants × Reservations/tenant/month × API calls/reservation
= Total Requests Per Month (RPM)
= Peak Requests Per Second (RPS)
```

### Example Estimate

| Metric | Value |
|--------|-------|
| Tenants | 50 |
| Reservations/tenant/month | 500 |
| API calls per reservation | 20 (CRUD + side effects) |
| Total RPM | 50 × 500 × 20 = 500,000 |
| Peak RPS (5× average) | ~57 RPS |

A single NestJS instance handles ~500-1000 RPS comfortably, so Stage 1 is sufficient for launch.

## Anti-Patterns to Avoid

- ❌ Premature microservices ("split before it hurts")
- ❌ Database sharding before trying vertical scale + read replicas
- ❌ Kubernetes on day one (start with Docker Compose)
- ❌ Async everywhere (sync is simpler and sufficient initially)
- ❌ Over-caching (cache only data that is expensive to compute)
