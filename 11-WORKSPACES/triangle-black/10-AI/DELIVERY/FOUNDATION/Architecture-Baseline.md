# Architecture Baseline

> Frozen architecture decisions that all AI agents must respect.

## Technology Stack (Frozen)

| Layer | Technology | Version | Constraint |
|-------|-----------|---------|------------|
| Frontend | Next.js | 15 (App Router) | Server components by default |
| Backend | NestJS | 11 | Modular monolith |
| Database | PostgreSQL | 16 | Schema-per-tenant |
| ORM | Prisma | 6 | Single source of truth for schema |
| Language | TypeScript | 5.x | Strict mode |
| Containerization | Docker | Latest | Multi-stage builds |
| VPS Budget | $6-40/mo | — | Drives all infrastructure decisions |
| Cache | Redis | 7 | Session store, response cache |
| Search | PostgreSQL FTS | In-database | V1; Meilisearch V2 |

## Architecture Invariants

1. **Clean Architecture:** Dependency direction flows inward. Domain layer has zero external dependencies.
2. **Modular Monolith:** Domains are separate NestJS modules. Extraction to microservices must be via ADR.
3. **Schema-per-Tenant:** Each tenant gets its own PostgreSQL schema. Isolation at the database level.
4. **Event-Driven:** Domain events for cross-module communication. No direct module-to-module calls.
5. **CQRS:** Read models are separate from write models. Queries bypass the domain layer.
6. **API-First:** OpenAPI 3.x contracts are the source of truth for API design.
7. **RBAC:** Role-based access control at the API gateway level.
8. **Audit Trail:** All mutations are captured in the immutable audit log.

## Repository Layout

```
triangle-black/
├── apps/
│   ├── api/          — NestJS application
│   └── web/          — Next.js application
├── packages/
│   ├── ui/           — Shared UI components
│   ├── shared/       — Shared types, utilities
│   ├── database/     — Prisma schema, migrations, seeds
│   └── config/       — Shared configuration
├── docs/             — Documentation
├── agents/           — AI agent specifications
├── deliverables/     — Sprint deliverables
├── .github/          — CI/CD workflows
├── docker/           — Docker configurations
└── scripts/          — Utility scripts
```

## API Conventions

- Base path: `/api/v1/`
- Authentication: Bearer JWT
- Error format: RFC 7807 Problem Details
- Pagination: Cursor-based for lists, offset for admin
- Versioning: URL path versioning

## Deployment

- **V1:** Single VPS, Docker Compose
- **V2:** Docker Swarm or Kubernetes (when > 20 tenants)
- **Database:** Managed PostgreSQL or self-hosted
- **CDN:** DigitalOcean Spaces or Cloudflare R2
