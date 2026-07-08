# 06 — Scaling Strategy

> Platform scaling strategy for growth.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — DevOps-Architecture.md | Infrastructure baseline |
| Phase 5 — Platform-Foundation.md | Platform architecture |

## Scaling Dimensions

```
1. CUSTOMERS: 3 → 30 → 300 → 3,000+ hotels
2. USERS: 50 → 500 → 5,000 → 50,000+ daily active
3. DATA: 10GB → 100GB → 1TB → 10TB+
4. REQUESTS: 1K → 10K → 100K → 1M+ per day
5. REGIONS: Egypt → GCC → Africa → Global
6. TEAMS: 2 → 5 → 15 → 50+ engineers
```

## Scaling Approach

| Scale Level | Hotels | Architecture | Infrastructure | Budget |
|-------------|--------|-------------|---------------|--------|
| Bootstrap | 1-10 | Single VPS, single DB | 2 VPS | $40/mo |
| Growth | 10-100 | Horizontally scaled app, read replicas | 5-10 VPS | $500/mo |
| Scale | 100-1,000 | Microservices, sharded DB, CDN | 20-50 VPS + managed services | $5K/mo |
| Enterprise | 1,000-10,000 | Full HA, multi-region, global CDN | Cloud managed (Kubernetes) | $50K+/mo |

## Scaling Principles

1. **Vertical first, horizontal second** — Optimize single instance before distributing
2. **Database is the bottleneck** — Optimize queries, add indexes, then scale
3. **Cache aggressively** — Cache everything that can be cached
4. **Async by default** — Offload non-critical work to queues
5. **Schema-per-tenant** — Multi-tenant isolation without shared tables
6. **Read replicas** — Offload reads from primary database
7. **Stateless application** — Scale horizontally with load balancer

## Capacity Planning

| Resource | Current | 6-month | 12-month | 24-month |
|----------|---------|---------|----------|----------|
| App instances | 1 | 2 | 5 | 20 |
| Database storage | 10 GB | 50 GB | 200 GB | 1 TB |
| Requests/sec | 10 | 100 | 500 | 5,000 |
| Bandwidth | 10 Mbps | 50 Mbps | 200 Mbps | 1 Gbps |
| Concurrent users | 20 | 200 | 1,000 | 10,000 |
