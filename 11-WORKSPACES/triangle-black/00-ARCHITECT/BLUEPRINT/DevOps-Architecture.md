# Phase 02 — DevOps Architecture

> Infrastructure and operations architecture for Triangle Black.

## Infrastructure Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Host | DigitalOcean Droplet ($6/mo starter) | Single VPS for all services |
| OS | Ubuntu LTS 24.04 | Server operating system |
| Container | Docker Compose v2 | Service orchestration |
| Web server | Nginx 1.26 | Reverse proxy, SSL termination |
| Database | PostgreSQL 16 | Primary data store |
| CI/CD | GitHub Actions | Automated build, test, deploy |
| Monitoring | Health endpoint + Docker logs | Basic observability (V1) |

## Service Architecture

```
docker-compose.yml
├── nginx           # Port 80/443, SSL, reverse proxy
├── api             # NestJS API (Node.js 22)
├── web             # Next.js app (Node.js 22)
├── worker          # Background job processor
└── postgres        # PostgreSQL 16
```

## Deployment Pipeline

```
Push → GitHub → Lint → Test → Build → Docker Image → Push to Registry → Deploy to VPS
  │       │        │       │       │         │               │                 │
  │       │        │       │       │         │               │                 ▼
  │       │        │       │       │         │               │          docker compose pull && up
  │       │        │       │       │         │               │
  │       │        │       │       │         └─── ghcr.io/   │
  │       │        │       │       │             triangle-black/api:{sha}      │
  │       └────────┴───────┴───────┴────────────────────────────────────┘
```

## Environments

| Environment | URL | Purpose | Deploy Trigger |
|-------------|-----|---------|----------------|
| Development | localhost | Local development | Manual |
| Staging | staging.triangleblack.com | Integration testing | PR merged to main |
| Production | app.triangleblack.com | Live customer usage | Release tag |

## CI/CD Pipeline (GitHub Actions)

```
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  release: { types: [published] }

jobs:
  quality:     # Lint + typecheck + test
  build:       # Build Docker images
  deploy-stg:  # Deploy to staging (on main push)
  deploy-prod: # Deploy to production (on release)
```

## Backup Strategy

| Schedule | Type | Retention | Automation |
|----------|------|-----------|------------|
| Daily | Full pg_dump | 30 days | GitHub Actions cron |
| Continuous | WAL archive | 7 days | PostgreSQL config |
| Pre-deploy | Schema dump | Permanent | CI/CD pipeline step |

## Scaling Path

| Bottleneck | V1 Solution | V2 Scale |
|------------|-------------|----------|
| CPU/Memory | Vertical (up to $40/mo droplet) | Horizontal (multiple droplets) |
| Database | Connection pooling (PgBouncer) | Read replicas |
| Storage | Volume resize (up to 200GB) | DO Spaces for file storage |
| Sessions | Same VPS | Redis (separate droplet) |

## Related Documents

- `01-INFRASTRUCTURE/` in Phase 5 — Docker Compose config
- `12-DEVOPS/` in Phase 5 — CI/CD workflows
- `10-DEVOPS/` in Phase 4 — DevOps standards
