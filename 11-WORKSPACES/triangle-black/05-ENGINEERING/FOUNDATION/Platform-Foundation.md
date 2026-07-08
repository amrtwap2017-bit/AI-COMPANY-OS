# Phase 05 — Platform Foundation

> Platform foundation layer — the base upon which all business domains run.

## Platform Components

| Component | Description | Status |
|-----------|-------------|--------|
| NestJS framework | Enterprise Node.js framework | Built |
| Prisma ORM | Type-safe database access | Built |
| JWT Authentication | Access + Refresh tokens | Built |
| RBAC | Roles + Permissions + Tenants | Built |
| Audit Service | Event-sourced audit trail | Built |
| Notification Service | In-app + event-driven | Built |
| File Service | Upload + storage | Built |
| Health Checks | Liveness + Readiness | Built |

## Architecture Invariants

1. All platform services are domain-agnostic
2. Business logic lives in domain modules, never in platform
3. Platform provides the skeleton — domains provide the meat
4. Platform must be deployable without any domain module
5. Platform version compatible with all domain versions

## Startup Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Port (API) | 3000 | NestJS |
| Port (Web) | 3001 | Next.js |
| Database URL | `postgresql://user:pass@postgres:5432/triangle_black` | Container |
| JWT Secret | Environment variable | Rotated per deploy |
| JWT Expiry (Access) | 15 minutes | Short-lived |
| JWT Expiry (Refresh) | 7 days | Rotated on use |

## Sub-Systems

- [Identity](Identity.md) — Auth, users, roles, permissions
- [Platform Services](Platform-Services.md) — Notifications, files, audit, health
- [Workflow Foundation](Workflow-Foundation.md) — Workflow engine
- [Data Foundation](Data-Foundation.md) — Prisma schema, migrations
- [API Foundation](API-Foundation.md) — API framework, interceptors
- [Application Foundation](Application-Foundation.md) — Next.js setup
- [Security Foundation](Security-Foundation.md) — Guards, rate limiting
- [DevOps Foundation](DevOps-Foundation.md) — Docker, CI/CD
- [MVP Validation](MVP-Validation.md) — Validation criteria
