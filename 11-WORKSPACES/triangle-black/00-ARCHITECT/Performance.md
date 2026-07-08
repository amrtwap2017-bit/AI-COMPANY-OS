# Performance

## Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API P95 response time | < 200ms | Application performance monitoring |
| API P99 response time | < 500ms | Application performance monitoring |
| First Contentful Paint (FCP) | < 1.5s | Lighthouse / Web Vitals |
| Time to Interactive (TTI) | < 2.5s | Lighthouse / Web Vitals |
| Database query P95 | < 50ms | PostgreSQL slow query log |
| Availability | 99.5% uptime | Uptime monitoring |
| Concurrent users per tenant | < 50 simultaneous users | Session monitoring |

## Frontend Performance

### Server-Side Rendering (Next.js)

- **Default SSR** for authenticated pages (dashboard, reservations)
- **Static Generation (SSG)** for landing, marketing, public content
- **Incremental Static Regeneration (ISR)** for semi-static content (rate plans, property pages)
- **Streaming SSR** (Next.js App Router) for data-heavy pages

### Bundle Optimization

| Technique | Implementation |
|-----------|---------------|
| Code splitting | Automatic with Next.js App Router (per route) |
| Dynamic imports | `next/dynamic` for heavy components (charts, calendars) |
| Image optimization | `next/image` with WebP, lazy loading |
| Font optimization | `next/font` with Google Fonts self-hosting |
| Tree shaking | Configure `sideEffects: false` in package.json |
| Bundle analysis | `@next/bundle-analyzer` in CI |

### Caching Strategy

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Browser      │─────►│  CDN/Next.js │─────►│  API Cache   │
│  Cache        │      │  Cache       │      │  (Redis)     │
│  (Cache-      │      │  (stale-     │      │  (60-300s    │
│   Control)    │      │  while-      │      │   TTL)       │
│               │      │  revalidate) │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Backend Performance

### NestJS Optimization

| Technique | Implementation |
|-----------|---------------|
| Compression | `compression` middleware (gzip/brotli) |
| JSON serialization | `class-transformer` with `@Exclude()` for response DTOs |
| Async logging | Structured JSON logging with `pino` (not console.log) |
| Connection pooling | Prisma with tuned pool size |
| Request validation | Zod/class-validator at controller level (fail fast) |
| Fastify adapter | Switch from Express to Fastify for 2-3× throughput when needed |

### Query Performance

| Pattern | Implementation |
|---------|---------------|
| **Prisma query optimization** | Use `select` to fetch only needed columns |
| **N+1 prevention** | Use `include` with relations, or batch queries |
| **Pagination** | Cursor-based pagination for lists (no `skip`/`take` on large tables) |
| **JSON fields** | Use `Jsonb` with GIN indexes for flexible property data |
| **Materialized views** | Analytics aggregations refreshed periodically |
| **Prepared statements** | Prisma uses prepared statements by default |

### Caching

```
┌────────────────────┬──────────────────┬──────────────────┐
│    Cache Layer      │   Data Type       │   TTL            │
├────────────────────┼──────────────────┼──────────────────┤
│ Next.js Full Route │ Public pages      │ 60-300s          │
│ Next.js Data Cache │ fetch() results   │ 60s              │
│ Redis (API)        │ Computed data     │ 60-300s          │
│ Redis (Session)    │ JWT blacklist     │ Until token expiry│
│ Redis (Rate Limit) │ IP/token counters │ Rolling window   │
│ Browser Cache      │ Static assets     │ 1 year (fingerprinted)│
│ CDN                │ Public images     │ 1 year           │
└────────────────────┴──────────────────┴──────────────────┘
```

## Database Performance

Detailed in [10-Database/Performance.md](../10-Database/Performance.md).

### Key Points

- **Index everything used in WHERE, ORDER BY, JOIN, and GROUP BY**
- **Vacuum aggressively** (auto-vacuum tuned for OLTP workload)
- **Connection pooling** via PgBouncer (sidecar or built-in) when connections exceed 50
- **Partition large tables** (reservations, audit_log) by date
- **Monitor slow queries** via `pg_stat_statements`

## Background Processing

Heavy or slow operations run asynchronously via Bull queues:

| Queue | Work | Priority | Retry |
|-------|------|----------|-------|
| `email` | Send transactional emails | High | 3 |
| `ota-sync` | Sync availability/pricing to OTAs | Medium | 5 |
| `analytics` | Compute dashboard metrics | Low | 2 |
| `file-processing` | Resize images, process uploads | Low | 2 |
| `audit-archive` | Archive old audit log entries | Low | 1 |

## Monitoring

Tools to be configured in [14-Infrastructure/](../../14-Infrastructure/):

- **Application monitoring:** OpenTelemetry + Sentry (error tracking)
- **Database monitoring:** pg_stat_statements, pg_top
- **Server monitoring:** Prometheus + Node Exporter + Grafana
- **Uptime monitoring:** Health check endpoint (`/api/health`)
- **Alerting:** Email alerts on performance threshold breaches

## Performance Regression Prevention

- PRs must include `@PerformanceTest` annotation for critical paths
- CI runs load tests on critical endpoints (k6 or autocannon)
- Database migration reviews include query plan analysis
- Weekly slow query log review
