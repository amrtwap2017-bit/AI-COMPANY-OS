# Caching Strategy

> Redis-based caching for API performance and session management.

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Browser    │───►│   Next.js    │───►│  NestJS API  │───►│  PostgreSQL  │
│   CDN cache  │    │  ISR cache   │    │  Redis cache │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                         ┌────▼────┐
                                         │  Redis   │
                                         │          │
                                         │ • Session│
                                         │ • Cache  │
                                         │ • Queue  │
                                         │ • Rate   │
                                         └─────────┘
```

## Redis Resource Estimation (VPS Budget)

| Plan | RAM | Max Memory | Use Case |
|------|-----|-----------|----------|
| $6 VPS | 1GB | 128MB Redis | Development / 1-2 hotels |
| $20 VPS | 2GB | 256MB Redis | Production / 3-10 hotels |
| $40 VPS | 4GB | 512MB Redis | Production / 10-20 hotels |

## Caching Layers

### Layer 1: Browser Cache (CDN)

| Resource | Cache-Control | Strategy |
|----------|---------------|----------|
| Static assets (JS, CSS, images) | `public, max-age=31536000, immutable` | Hash-based filenames |
| Fonts, icons | `public, max-age=31536000, immutable` | Hash-based filenames |
| API responses (GET only) | `private, no-cache` | Handled at API layer |

### Layer 2: Next.js ISR

| Page | Revalidation | Strategy |
|------|-------------|----------|
| Static marketing pages | 1 hour | `revalidate: 3600` |
| Dashboard widgets | 5 minutes | `revalidate: 300` |
| List views (leads, projects, etc.) | 30 seconds | `revalidate: 30` |
| Detail views | On demand | `revalidate: false` + `revalidatePath()` on mutation |

### Layer 3: API Response Cache (Redis)

#### Cacheable Endpoints

Only `GET` endpoints that are read-heavy and infrequently mutated:

| Endpoint Group | TTL | Cache Key Pattern | Invalidation Trigger |
|---------------|-----|-------------------|---------------------|
| Reference data (enums, lookup tables) | 1 hour | `ref:{tenant}:{type}` | Admin update |
| Dashboard/aggregate data | 5 minutes | `dash:{tenant}:{dashboard}` | Data mutation |
| List views (paginated) | 1 minute | `list:{tenant}:{entity}:{page}:{filters}` | CRUD on entity |
| Entity details | 2 minutes | `entity:{tenant}:{type}:{id}` | Update/delete on entity |
| User profile | 5 minutes | `user:{userId}:profile` | Profile update |
| Permission/role data | 10 minutes | `perm:{userId}` | Role/permission change |

#### Cache-Aside Pattern

```
GET /api/v1/leads (page 1)
    │
    ├── Check Redis: list:tenant_abc:leads:1:status=active
    │   ├── HIT → Return cached data
    │   └── MISS → Query PostgreSQL
    │               ├── Cache result in Redis (TTL: 60s)
    │               └── Return data
    │
On Lead Mutation (POST/PATCH/DELETE):
    └── Delete cache key: list:tenant_abc:leads:*
```

#### Cache Invalidation

| Strategy | Mechanism | When |
|----------|-----------|------|
| TTL expiration | Automatic Redis expiry | After configured TTL |
| Key deletion | Delete by pattern on mutation | On entity CRUD |
| Tag-based | Store entity IDs in Redis set, flush on mutation | Complex queries |

### Layer 4: Session Store (Redis)

| Session Data | TTL | Notes |
|-------------|-----|-------|
| JWT refresh token | 7 days | Auto-renewed on use |
| User session metadata | 24 hours | Tenant, permissions, preferences |
| Rate limit counters | Varies | Per-endpoint, per-user |
| CSRF tokens | 1 hour | Per-form |

## Cache Performance Targets

| Metric | Target |
|--------|--------|
| API response cache hit ratio | ≥ 70% (after warmup) |
| P95 API response time (cached) | < 50ms |
| P95 API response time (uncached) | < 500ms |
| Session read latency | < 5ms |
| Cache invalidation propagation | < 100ms |

## Implementation Notes

- Redis runs as a Docker container alongside the application
- Use `ioredis` for NestJS Redis client
- Use `@nestjs/bull` BullMQ for Redis-backed job queues (workflow engine)
- Cache keys namespaced by tenant for multi-tenant isolation
- All cache entries include `tenant_id` in the key
- Monitoring: Redis `INFO` stats exported to Prometheus
- Fallback: If Redis is unavailable, queries bypass cache and hit PostgreSQL directly
