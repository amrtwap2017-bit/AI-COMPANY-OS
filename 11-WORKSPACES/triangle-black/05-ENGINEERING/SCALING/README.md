# 24 — Future Scaling

## Principle

Scale only when a specific bottleneck is measured and proven. Document the trigger metric for each scaling decision.

## Scaling Triggers

### VPS Upgrade
```
Trigger: CPU > 80% for 7 consecutive days OR RAM > 80%
Action: Upgrade DigitalOcean droplet (e.g., $6 → $12 → $24)
Cost Impact: +$6/mo per upgrade
```

### Separate Database Server
```
Trigger: PostgreSQL > 5GB OR > 100 concurrent connections
Action: Provision a separate DigitalOcean managed database
Architecture Impact:
  - Update DATABASE_URL in Docker Compose
  - No application code changes (Prisma handles connection)
Cost Impact: $15/mo minimum
```

### Read Replica
```
Trigger: Read queries > 80% of total AND latency > 50ms p95
Action: Add PostgreSQL read replica
Architecture Impact:
  - Prisma reads go to replica, writes to primary
  - Requires Prisma config change only
Cost Impact: $15/mo per replica
```

### Redis Cache
```
Trigger: Same query executing > 100 times/second AND cache hit ratio < 40%
Action: Add Redis to stack
Architecture Impact:
  - Add Redis service to Docker Compose
  - Add @nestjs/cache-manager
  - Cache frequent query results
Cost Impact: Redis on same VPS ($0), separate $12/mo
```

### Message Broker (RabbitMQ/Redis Pub-Sub)
```
Trigger: Event processing > 100/minute AND some handlers take > 5 seconds
Action: Add in-process queue → Bull (Redis) → RabbitMQ (when truly needed)
Architecture Impact:
  - Extract event handlers to apps/worker
  - Events publish to queue instead of in-process
  - Worker processes asynchronously
Cost Impact: Same VPS ($0), separate $12/mo
```

### Microservices Extraction
```
Trigger: Teams > 5 developers AND deployment conflicts > 3/week
Action: Extract most-changed module to standalone service
Architecture Impact:
  - Extract domain (e.g., projects) to new NestJS app
  - Add API gateway or service-to-service communication
  - Shared packages remain in monorepo
Cost Impact: Additional VPS per service $6/mo
```

### Search Engine (Elasticsearch/MeiliSearch)
```
Trigger: Full-text search > 1,000 queries/day AND PostgreSQL FTS latency > 500ms
Action: Add MeiliSearch (simpler, cheaper alternative to Elasticsearch)
Cost Impact: Same VPS ($0), separate $6/mo
```

### CDN Upgrade
```
Trigger: Bandwidth > 100GB/month OR > 50% traffic from outside MENA
Action: Upgrade Cloudflare Free → Pro ($20/mo)
```

### Kubernetes
```
Trigger: Services > 5 AND deployment orchestration complexity justifies it
Action: Evaluate K3s (lightweight K8s) on same VPS cluster
Cost Impact: 3x VPS nodes minimum ($18/mo minimum)
Note: Unlikely needed before 200+ tenants
```

## Non-Goals (V1)

| Technology | Why Not | When |
|-----------|---------|------|
| Kubernetes | Overkill for single VPS | 5+ services, multi-team |
| Kafka | No streaming use case | Event volume > 10K/min |
| Elasticsearch | PostgreSQL FTS sufficient | Search volume > 1K/day |
| Redis Cache | Not needed at current scale | Latency metrics justify it |
| WebSockets | No real-time requirement | Live notifications needed |
| Microservices | Modular monolith sufficient | Team size > 5 |

## Upgrade Path Summary

```
$6/mo ($25-40 budget)
└── Single VPS + Docker Compose + PostgreSQL
    │
    ├── $12/mo: VPS upgrade (CPU/RAM)
    ├── $15/mo: Managed PostgreSQL (DB size)
    ├── $27/mo: Managed DB + VPS upgrade
    ├── $30/mo: Add Redis cache
    ├── $36/mo: Add read replica
    └── $42/mo: Add worker VPS + message queue
```
