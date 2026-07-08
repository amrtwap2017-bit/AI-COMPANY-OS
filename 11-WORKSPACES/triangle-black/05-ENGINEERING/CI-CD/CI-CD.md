# Phase 04 — CI/CD

> Automated build, test, and deployment pipeline.

## Pipeline Overview

```
GitHub Actions
├── CI (Push to any branch)
│   ├── Lint (ESLint)
│   ├── Typecheck (tsc --noEmit)
│   ├── Test (Jest/Vitest)
│   └── Build (Next.js + NestJS)
├── CD-Staging (Push to main)
│   ├── CI steps
│   ├── Docker build + push
│   └── Deploy to staging VPS
└── CD-Production (Release tag)
    ├── CI steps
    ├── Docker build + push
    ├── Run migrations
    └── Deploy to production VPS
```

## Workflow Files

| Workflow | Trigger | Jobs | Environment |
|----------|---------|------|-------------|
| `ci.yml` | Any push | Lint, typecheck, test, build | — |
| `cd-staging.yml` | Push to main | CI + deploy | Staging VPS |
| `cd-production.yml` | Release published | CI + migrate + deploy | Production VPS |
| `backup.yml` | Daily (cron) | pg_dump → DO Spaces | — |

## Deployment Strategy

- **Staging**: Blue-green on same VPS (different port)
- **Production**: Rolling update with zero-downtime (Nginx upstream)
- **Rollback**: `docker compose up -d` with previous tag

See `12-CI-CD/` and `12-DEVOPS/` for complete workflow configurations.
