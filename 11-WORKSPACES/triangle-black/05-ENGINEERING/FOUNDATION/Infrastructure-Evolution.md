# Infrastructure Evolution

| Field | Value |
|---|---|
| Document ID | 14-Infrastructure-12 |
| Document Purpose | Define the staged evolution of infrastructure from startup to enterprise scale |
| Version | 1.0 |
| Status | Review |
| Dependencies | 14-Infrastructure/, 09-Architecture/Scalability.md |

---

## Philosophy

Do not build infrastructure for 500 hotels when you serve 5. But design the architecture so that migrating from 5 to 500 does not require a rewrite.

Each stage is triggered by a specific growth threshold, not a calendar date.

---

## Stage 1: Single VPS ($25-40/mo)

### Trigger
First 5-15 hotels. 1-5 users. Low traffic.

### Architecture
```
[Cloudflare Free (DNS + CDN + WAF)]
              │
         [VPS: Ubuntu LTS]
         ┌──────────────────┐
         │  Docker Compose  │
         │                   │
         │  ┌─────────────┐  │
         │  │   Nginx     │  │
         │  │ (SSL term)  │  │
         │  └──────┬──────┘  │
         │         │         │
         │    ┌────┴────┐    │
         │    │         │    │
         │ ┌──▼──┐  ┌───▼──┐ │
         │ │Next │  │NestJS│ │
         │ │ .js │  │      │ │
         │ └─────┘  └──┬───┘ │
         │             │     │
         │      ┌──────▼──┐  │
         │      │PostgreSQL│  │
         │      └─────────┘  │
         │                   │
         │  Local disk       │
         │  (file storage)   │
         └──────────────────┘
```

### Components
| Component | Configuration |
|---|---|
| VPS | 2-4 CPU, 4-8GB RAM, 80-160GB SSD |
| PostgreSQL | Single instance, schema-per-tenant |
| Nginx | Reverse proxy, SSL termination, static files |
| Next.js | Self-hosted, SSR |
| NestJS | Modular monolith |
| File Storage | Local disk (`/data/uploads`) |
| SSL | Let's Encrypt (auto-renewal with Certbot) |
| CDN/DNS | Cloudflare Free (DNS, CDN, WAF, DDoS) |
| CI/CD | GitHub Actions Free |
| Backup | Manual pg_dump to local disk + offsite copy |
| Monitoring | Uptime monitoring (free tier), manual log review |
| Email | Basic SMTP (transactional) |

### Limitations
- No horizontal scaling (single point of failure)
- No automatic failover (downtime during maintenance)
- No separate media storage (disk fills up)
- No background job queue (blocking tasks block the server)
- No caching tier (every request hits the database)
- Manual backups (requires human discipline)

### When to leave Stage 1
- More than 15 hotels
- Database exceeds 10GB
- Disk usage exceeds 70% regularly
- Uptime requirement exceeds 99%
- Need for background job processing

---

## Stage 2: Enhanced Single Server ($60-150/mo)

### Trigger
15-50 hotels. Growing data volume. Need for async processing.

### Architecture
```
[Cloudflare Free/Pro (DNS + CDN + WAF)]
              │
         [VPS: Ubuntu LTS]
         ┌────────────────────────────┐
         │  Docker Compose            │
         │                             │
         │  ┌─────────────┐            │
         │  │   Nginx     │            │
         │  └──────┬──────┘            │
         │         │                   │
         │    ┌────┴──────────┐        │
         │    │               │        │
         │ ┌──▼──┐  ┌────▼────┐       │
         │ │Next │  │ NestJS  │       │
         │ │ .js │  │ + Queue │       │
         │ └─────┘  │ Handler │       │
         │          └────┬────┘       │
         │               │            │
         │          ┌────┴────┐       │
         │          │  Redis  │       │
         │          │(cache+  │       │
         │          │ queue)  │       │
         │          └─────────┘       │
         │                            │
         │  ┌──────────┐ ┌──────────┐ │
         │  │PostgreSQL│ │  MinIO   │ │
         │  │ (tuned)  │ │ (S3 API) │ │
         │  └──────────┘ └──────────┘ │
         │                            │
         │  ┌──────────┐              │
         │  │ pg_dump  │              │
         │  │(daily)   │              │
         │  └──────────┘              │
         └────────────────────────────┘
```

### Additions vs Stage 1
| Component | Purpose |
|---|---|
| Redis | Cache (reduce DB load), BullMQ queue backend, session store |
| MinIO | S3-compatible object storage for files (decouples from local disk) |
| BullMQ | Background job queue (report generation, email, data export) |
| PgBouncer | Connection pooling for PostgreSQL |
| Automated backup | Scheduled pg_dump + MinIO upload |
| Enhanced monitoring | Health check endpoint, basic metrics |
| Cloudflare Pro (optional) | Enhanced WAF, image optimization, Argo tunnel |

### When to leave Stage 2
- More than 50 hotels
- Need for zero-downtime deployments
- Need for horizontal scaling (multiple app instances)
- Database is approaching performance limits
- Team size requires isolated environments

---

## Stage 3: Kubernetes Cluster ($300-2000+/mo)

### Trigger
50-500+ hotels. High availability requirement. Multi-region.

### Architecture
```
[Cloudflare Pro/Business]
         │
    [Kubernetes Cluster]
    ┌─────────────────────────┐
    │  ┌───────────────────┐  │
    │  │  Ingress (Nginx)  │  │
    │  └────────┬──────────┘  │
    │           │             │
    │    ┌──────┴──────┐      │
    │    │             │      │
    │ ┌──▼──┐    ┌────▼────┐  │
    │ │Next │    │ NestJS  │  │
    │ │ .js │    │(3+ pods)│  │
    │ └─────┘    │ + Queue │  │
    │           │ + Worker│  │
    │           └────┬────┘  │
    │                │       │
    │  ┌─────────────┴─────┐ │
    │  │                   │ │
    │  │  Service Mesh     │ │
    │  │  (Istio/Linkerd)  │ │
    │  └───────────────────┘ │
    │                        │
    │  ┌──────────┐ ┌──────┐ │
    │  │PostgreSQL│ │Redis │ │
    │  │(patroni  │ │Cluster│ │
    │  │ HA pair) │ └──────┘ │
    │  └──────────┘          │
    │                        │
    │  ┌──────────┐ ┌──────┐ │
    │  │  MinIO   │ │Kafka │ │
    │  │ (HA)     │ │     │ │
    │  └──────────┘ └──────┘ │
    │                        │
    │  ┌──────────────────┐  │
    │  │Prometheus+Grafana│  │
    │  │  + Loki + Tempo  │  │
    │  └──────────────────┘  │
    │                        │
    │  ┌──────────────────┐  │
    │  │  GitOps (ArgoCD) │  │
    │  └──────────────────┘  │
    └────────────────────────┘
```

### Additions vs Stage 2
| Component | Purpose |
|---|---|
| Kubernetes | Container orchestration, auto-scaling, self-healing |
| Patroni (PostgreSQL HA) | Automatic failover, high availability database |
| Redis Cluster | Distributed caching, high-availability queue |
| Kafka | Event streaming for cross-service communication |
| Prometheus + Grafana | Metrics collection and visualization |
| Loki + Tempo | Log aggregation and distributed tracing |
| ArgoCD | GitOps deployment, automated rollback |
| Service Mesh | Traffic management, observability, security |
| Horizontal Pod Autoscaling | Scale services based on load |

### When to use Stage 3
- Need for 99.95%+ uptime SLA
- Multi-region deployment
- 50+ concurrent users
- Need for auto-scaling based on demand
- Team of 10+ engineers working on the platform

---

## Decision Rules

| Question | Stage 1 | Stage 2 | Stage 3 |
|---|---|---|---|
| Monthly cost | $25-40 | $60-150 | $300-2000+ |
| Hotels supported | 1-15 | 15-50 | 50-500+ |
| Uptime | 99% | 99.5% | 99.95%+ |
| Deployment downtime | Yes (minutes) | Yes (seconds) | Zero |
| Auto-scaling | No | Manual | Automatic |
| DB failover | Manual | Manual | Automatic |
| Backups | Manual | Automated | Automated + tested |
| Monitoring | Basic | Good | Comprehensive |
| Team size | 1-3 | 3-8 | 8+ |

## Golden Rule

**Stage 1 infrastructure must be deployable from a single `docker-compose up` on a fresh Ubuntu VPS.**

No stage 2 or 3 component should require changes to application code — only configuration changes and additional service definitions.
