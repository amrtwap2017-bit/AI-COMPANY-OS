# 06 — Performance Optimization

> Performance optimization strategy for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Scaling-Strategy.md | Scaling approach |
| Phase 7 — Performance monitoring | Current baselines |

## Performance Targets

| Metric | Current | H1 Target | H2 Target |
|--------|---------|-----------|-----------|
| Page load (p95) | — | < 2s | < 1s |
| API response (p95) | — | < 200ms | < 100ms |
| Time to interactive | — | < 3s | < 1.5s |
| API error rate | — | < 0.1% | < 0.05% |
| Lighthouse score | — | > 85 | > 95 |
| Database query (p95) | — | < 50ms | < 20ms |

## Optimization Areas

| Area | Current State | Optimization | Impact |
|------|--------------|--------------|--------|
| Frontend bundle | — | Code splitting, lazy loading, tree shaking | High |
| Images | — | WebP, responsive, lazy load | High |
| API responses | — | Pagination, field selection, compression | High |
| Database queries | — | Indexes, query optimization, N+1 fixes | High |
| Caching | — | HTTP caching, Redis, CDN | High |
| Server rendering | — | Static generation where possible | Medium |
| Background jobs | — | Queue offloading | Medium |

## Performance Monitoring

| Tool | Purpose | Configuration |
|------|---------|--------------|
| Lighthouse CI | Frontend perf | Per-PR audit, score threshold: 85 |
| Prometheus + Grafana | Server metrics | CPU, memory, request latency, error rate |
| Sentry | Error tracking | All errors, performance traces |
| PostgreSQL monitoring | Query performance | Slow query log (> 100ms), index usage |
| Web Vitals | Real user monitoring | LCP, FID, CLS |

## Performance Budget

| Resource | Budget | Enforcement |
|----------|--------|-------------|
| JavaScript bundle | < 200KB gzipped | CI check |
| CSS bundle | < 50KB gzipped | CI check |
| Page weight | < 500KB | CI check |
| Images per page | < 300KB | CI check |
| API payload | < 100KB default | API gateway |
| Database queries per page | < 20 | Monitoring |
