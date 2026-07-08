# 02 — Architecture Decision Records

> Complete index of all ADRs. Each ADR documents a significant architectural choice, its context, alternatives considered, and consequences.

## ADR Index

| ID | Title | Phase | Status | Date |
|----|-------|-------|--------|------|
| ADR-001 | Schema-Per-Tenant PostgreSQL Isolation | 02 | Accepted | — |
| ADR-002 | Next.js 15 + NestJS 11 Monorepo | 02 | Accepted | — |
| ADR-003 | Revenue-First Build Order | 00 | Accepted | — |
| ADR-004 | DDD Bounded Contexts for Phase 6 | 01 | Accepted | — |
| ADR-005 | Single VPS Infrastructure Budget ($6-40/mo) | 04 | Accepted | — |
| ADR-006 | JWT Authentication, No SSO in V1 | 04 | Accepted | — |
| ADR-007 | Rule-Based AI Agents, No ML Pipelines in V1 | 04 | Accepted | — |
| ADR-008 | Phase 7 Integration Boundaries Only | 07 | Accepted | — |
| ADR-009 | Design Freeze After Phase 4 | 03 | Accepted | — |
| ADR-010 | 20-File Module Template for Business Domains | 06 | Accepted | — |

## ADR Format

Each ADR is stored in the phase directory where the decision was made. Use the template:

```markdown
# ADR-NNN: Title

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Date:** YYYY-MM-DD
**Phase:** [00-07]

## Context
What is the issue motivating this decision?

## Decision
What is the change being proposed?

## Alternatives Considered
- Alternative A: [pros/cons]
- Alternative B: [pros/cons]

## Consequences
- Positive: [list]
- Negative: [list]
- Neutral: [list]
```

## Key Decisions Summary

### ADR-001: Schema-Per-Tenant
**Decision:** Each tenant isolated in its own PostgreSQL schema.
**Alternatives:** Row-level tenant_id column, separate database per tenant, shared schema.
**Why:** Schema isolation provides strong data segregation without the operational overhead of separate databases. Allows per-tenant schema migrations for future customization.

### ADR-002: Next.js 15 + NestJS 11
**Decision:** Next.js App Router for frontend, NestJS for backend API, Prisma 6 for ORM.
**Alternatives:** Remix, Express.js, Fastify, direct SQL.
**Why:** TypeScript throughout, strong ecosystem, NestJS enterprise patterns (modules/guards/interceptors), Next.js SSR/SSG flexibility.

### ADR-005: VPS Budget
**Decision:** Single DigitalOcean VPS ($6-40/mo) with Docker Compose.
**Alternatives:** AWS ECS, Kubernetes, serverless.
**Why:** $6-40/mo vs $200+/mo for managed services. Suitable for V1 traffic levels. Can scale vertically before needing to re-architect.

### ADR-009: Design Freeze
**Decision:** Phases 0-4 are frozen after Phase 5 start. No redesign during implementation.
**Alternatives:** Continuous design refinement alongside implementation.
**Why:** Prevents analysis paralysis. Ensures implementation teams have a stable target. ADR process handles necessary changes.

## Deprecated ADRs

None to date.
