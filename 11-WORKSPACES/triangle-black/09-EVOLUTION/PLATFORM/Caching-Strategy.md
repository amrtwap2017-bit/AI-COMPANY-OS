# 06 — Caching Strategy

> Multi-layer caching strategy for performance.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Performance-Optimization.md | Performance goals |
| Phase 10 — CDN-Strategy.md | Global CDN |

## Cache Layers

```
┌───────────────────────────────────────────────────┐
│                CDN (Cloudflare)                    │
│  ● Static assets (JS, CSS, images, fonts)         │
│  ● API responses (cacheable GET)                  │
│  ● HTML pages                                     │
└───────────────────────────────────────────────────┘
         │
┌───────────────────────────────────────────────────┐
│         Application Cache (Redis)                  │
│  ● Session data                                    │
│  ● Frequent DB query results                       │
│  ● Rate limiting counters                          │
│  ● Job queue                                       │
└───────────────────────────────────────────────────┘
         │
┌───────────────────────────────────────────────────┐
│          Database Caching                           │
│  ● PostgreSQL shared buffers                       │
│  ● Query result caching                            │
│  ● Materialized views                              │
└───────────────────────────────────────────────────┘
```

## Cache Strategy by Data Type

| Data Type | Cache Layer | TTL | Invalidation |
|-----------|------------|-----|--------------|
| User session | Redis | Session duration | On logout |
| Tenant config | Redis | 1 hour | On config change |
| Hotel data | Redis | 5 minutes | On data change |
| Lookup tables | Application | 1 day | On change |
| API responses | CDN + Redis | 5 minutes | On mutation |
| Static assets | CDN | 1 year (content hash) | On build |
| Search results | Redis | 1 minute | On new data |
| Dashboard data | Redis | 1 minute | On data refresh |

## Cache Invalidation

| Method | Layers | Trigger | Latency |
|--------|--------|---------|---------|
| Key-based invalidation | Redis | On data mutation | Immediate |
| Tag-based purge | CDN | On content update | < 30s |
| Time-based expiry | All | TTL expiry | Automatic |
| Pattern-based | Redis | Bulk operations | Immediate |
| Full purge | CDN | Deployment | < 30s |

## Cache Metrics

| Metric | Target | Monitoring |
|--------|--------|-----------|
| Redis cache hit rate | > 90% | Redis metrics |
| CDN cache hit rate | > 80% | CDN analytics |
| Average cache latency | < 1ms | Redis monitoring |
| Cache invalidation latency | < 100ms | Custom metrics |
| Memory usage (Redis) | < 70% | Redis monitoring |
