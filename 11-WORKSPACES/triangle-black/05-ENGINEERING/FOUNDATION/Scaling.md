# Scaling Strategy

## Overview

This document describes the practical scaling path from a single VPS ($25-40/month) to a distributed architecture. Each stage is incremental — no rewrites, no migrations, no downtime if executed correctly.

This operationalizes the architectural scalability decisions documented in [09-Architecture/Scalability.md](../09-Architecture/Scalability.md).

## Stage 0: Single VPS (V1 Launch)

```
┌───────────────────────────────────────┐
│           Single VPS ($35/mo)          │
│  ┌──────────┐  ┌──────────┐           │
│  │  nginx    │  │ frontend │           │
│  │  certbot  │  │ (Next.js)│           │
│  └────┬─────┘  └────┬─────┘           │
│       │              │                 │
│  ┌────┴──────────────┴─────┐          │
│  │        backend           │          │
│  │      (NestJS)            │          │
│  └────┬──────────────┬─────┘          │
│       │              │                 │
│  ┌────┴────┐   ┌─────┴─────┐         │
│  │postgres │   │   redis   │         │
│  │ :5432   │   │  :6379    │         │
│  └─────────┘   └───────────┘         │
└───────────────────────────────────────┘
```

**Capacity:** 50-100 tenants, 500-1000 daily operations.
**Cost:** ~$30-40/month.
**Trigger to next stage:** DB CPU > 70% sustained, or response time degradation.

## Stage 1: Separate Database Server

When the database becomes the bottleneck (usually first):

```
┌──────────────┐          ┌──────────────┐
│  App Server   │          │  DB Server    │
│  ($25/mo)     │          │  ($25/mo)     │
│               │          │               │
│  nginx        │          │  postgres     │
│  frontend     │─────────►│  (config      │
│  backend      │          │   tuned)      │
│  redis        │          │               │
│               │          │  100 GB SSD   │
│  (stateless)  │          │               │
└──────────────┘          └──────────────┘
```

**Changes required:**
1. Provision second VPS with PostgreSQL pre-installed
2. Run `pg_dump` from app server, restore to new DB server
3. Update `DATABASE_URL` in `.env` to point to DB server's private IP
4. Configure `pg_hba.conf` to allow connections only from app server IP
5. Point app DNS to DB server (or use private network)
6. Deploy app server without PostgreSQL container

**Total cost:** ~$50-65/month.
**Trigger to next stage:** Read queries > 80% of DB workload.

## Stage 2: Read Replicas

```
┌──────────────┐     ┌──────────────────┐
│  App Server   │     │   DB Primary     │
│  (writes)     │────►│  (writes)        │
│               │     │  $35/mo          │
│  backend      │     └────────┬─────────┘
│  ──► writes  │              │ streaming
│  ──► reads   │     ┌────────▼─────────┐
│               │     │   DB Replica     │
│               │     │  (reads)         │
│               │────►│  $25/mo          │
│               │     └──────────────────┘
```

**Changes required:**
1. Configure PostgreSQL streaming replication on replica
2. Add `DATABASE_REPLICA_URL` to environment
3. Update Prisma config to route read queries to replica:

```typescript
// prisma.ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,  // primary for writes
    },
  },
});

// For reads, use a separate read-only client
export const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_REPLICA_URL,  // replica for reads
    },
  },
});
```

**Total cost:** ~$75-90/month.
**Trigger to next stage:** App server CPU > 70% sustained.

## Stage 3: Application Horizontal Scaling

```
┌──────────────┐
│    nginx      │ (load balancer)
│  (round-robin)│
└──────┬───────┘
       │
  ┌────┴────┐  ┌────┴────┐
  │ backend  │  │ backend  │  (2-3 instances)
  │ (NestJS) │  │ (NestJS) │
  └────┬────┘  └────┬────┘
       │            │
       │    ┌───────┴───────┐
       │    │    Redis       │
       │    │  (shared)      │
       │    └───────────────┘
       │
  ┌────┴────┐  ┌────┴────┐
  │ DB Prim │  │ DB Repl │
  └─────────┘  └─────────┘
```

**Changes required:**
1. Nginx already configured as upstream load balancer
2. Ensure all instances share the same Redis for cache/sessions
3. Move file uploads from local disk to S3-compatible storage
4. Scale frontend independently if needed (Next.js is stateless)

## Stage 4: Object Storage & Separation

```
┌──────────────┐     ┌──────────────────┐
│  App Tier     │     │  Object Storage  │
│  (nginx +     │     │  (DigitalOcean   │
│   backend x3  │────►│   Spaces / S3)   │
│   frontend x2)│     │  $5/mo           │
└──────┬───────┘     └──────────────────┘
       │
  ┌────┴────┐  ┌────┴────┐
  │ DB Prim │  │ DB Repl │
  └─────────┘  └─────────┘
```

**Changes required:**
1. Replace local file storage with S3-compatible API
2. Use Prisma's `enum` for storage provider (configurable)
3. Migrate existing uploads to object storage
4. Update Nginx to serve static files from CDN instead of local

## Stage 5: Container Orchestration (Future)

```
┌──────────────────────────────────────┐
│           Docker Swarm / Nomad        │
│                                       │
│  ┌──────────┐  ┌──────────┐         │
│  │  Node 1   │  │  Node 2   │         │
│  │  backend  │  │  backend  │         │
│  │  frontend │  │  frontend │         │
│  └──────────┘  └──────────┘         │
│                                       │
│  ┌──────────┐  ┌──────────┐         │
│  │  Node 3   │  │  Node 4   │         │
│  │  redis    │  │  worker   │         │
│  └──────────┘  └──────────┘         │
└──────────────────────────────────────┘
```

**When to consider:** This is a post-V2 consideration. Move to orchestration only when:
- Running > 5 VPS instances
- Deploying > 1x per week
- Manual server management is causing errors or delays

**Not Kubernetes.** Prefer Docker Swarm (simpler) or Nomad (flexible). Kubernetes is only justified at very large scale (>20 nodes) or when specific K8s features are needed.

## What Does NOT Change

| Component | Stays Same Across All Stages |
|-----------|------------------------------|
| Application code | No changes needed (stateless by design) |
| API contracts | No breaking changes |
| Database schema | No migrations required for scaling |
| Docker images | Same images, just run on more hosts |
| CI/CD pipeline | Same pipeline, target changes |
| Monitoring approach | Scales with infrastructure |

## Cost Projection

| Stage | Monthly Cost | Tenants | Description |
|-------|-------------|---------|-------------|
| 0 | $30-40 | 0-100 | Single VPS, all-in-one |
| 1 | $50-65 | 100-300 | Dedicated DB server |
| 2 | $75-90 | 300-800 | Read replicas |
| 3 | $100-150 | 800-2000 | Horizontal app servers |
| 4 | $150-250 | 2000-5000 | Object storage, CDN |

## Anti-Patterns

- **Premature separation** — Don't split DB until you measure it's the bottleneck
- **Kubernetes on day one** — Docker Compose on a single VPS is more reliable with less overhead
- **Microservices before modular monolith** — Well-defined NestJS modules can be extracted later
- **Async everywhere** — Sync is simpler. Make async only what needs to be async.
- **Over-provisioning** — Start small, scale on actual metrics, not speculation
