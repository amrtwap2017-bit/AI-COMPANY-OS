# ADR-009: Deployment

**Status:** Accepted

**Context:** Triangle Black needs a deployment strategy that is cost-effective at launch scale (single VPS, $25-40/mo), reproducible across environments, easy to set up for new developers, and supports zero-downtime deployments. The deployment must include the frontend (Next.js), backend (NestJS), PostgreSQL, Redis, and Nginx.

**Decision:**

We will use **Docker Compose on a single VPS** for V1 deployment.

Deployment architecture:
```
┌─────────────────────────────────────────────────────────┐
│                    VPS (Ubuntu 24.04)                     │
│                                                          │
│  Docker Compose stack:                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ nginx       │  │ nextjs      │  │ nestjs      │     │
│  │ :443 -> :80 │  │ :3000       │  │ :4000       │     │
│  │ certbot     │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ postgres    │  │ redis       │  │ minio (V2)  │     │
│  │ :5432       │  │ :6379       │  │ :9000       │     │
│  │ volume: pg  │  │ volume: rd  │  │ volume: s3  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  Volumes:                                                │
│  - postgres_data (database files)                        │
│  - redis_data (cache persistence)                        │
│  - uploads (local file storage)                          │
│  - certbot (TLS certificates)                            │
│                                                          │
│  Networks:                                               │
│  - frontend (nginx, nextjs)                              │
│  - backend (nextjs, nestjs, redis)                       │
│  - database (nestjs, postgres)                           │
└─────────────────────────────────────────────────────────┘
```

Deployment process:
```
1. Build: GitHub Actions builds Docker images
2. Push: Images pushed to Docker Hub or GitHub Container Registry
3. Deploy: SSH into VPS, pull images, docker compose up -d
4. Health check: Verify /api/health returns 200
```

**Consequences:**

*Positive:*
- Single VPS is cost-effective ($25-40/mo) for launch scale
- Docker Compose is simple to understand and operate
- Compose file is the single source of truth for the infrastructure
- Easy local development (`docker compose up` works on any machine)
- Services are isolated but can communicate over Docker networks
- Health checks and restart policies provide basic resilience

*Negative:*
- Single VPS is a single point of failure (no redundancy)
- Scaling is limited to vertical scaling on one machine
- Docker Compose has no built-in orchestration (no auto-scaling, no service discovery)
- Manual or CI-based deployment; no gitops
- VPS needs regular maintenance (OS updates, Docker updates, PostgreSQL vacuum)
- No built-in disaster recovery across regions

**Alternatives:**
- **Kubernetes (K3s / K8s)** — rejected: overkill for V1; adds significant complexity; deferred until 10+ app instances
- **PaaS (Heroku, Railway, Render)** — rejected: expensive at scale; limited control over infrastructure
- **AWS ECS / Fargate** — rejected: over-engineered for V1; cost and complexity not justified
- **Bare metal** — rejected: more ops overhead than VPS
- **VMware / Hyper-V** — rejected: over-engineered; Docker Compose is simpler
- **Coolify / CapRover** — considered: nice UI but adds abstraction layer; prefer raw Docker Compose for control

**Related ADRs:** ADR-001 (Tech Stack), ADR-005 (Multi-tenancy), ADR-008 (File Storage)
