# Architecture Reality — August 2026

## IMPORTANT: This document supersedes ADR-001 through ADR-010

The original ADRs describe NestJS plus Prisma plus schema-per-tenant.
The actual implementation uses Python FastAPI plus SQLAlchemy plus row-level hotel_id.

## Current Stack (Verified)

| Layer | Planned ADRs | Actual |
|-------|-------------|--------|
| Backend | NestJS 11 | Python FastAPI |
| ORM | Prisma 6 | SQLAlchemy + Alembic |
| Multi-tenancy | Schema-per-tenant | Row-level hotel_id |
| Auth | JWT RS256 + refresh | JWT HS256 + form login |
| Frontend | Next.js 15 | Next.js 14 |
| Database | PostgreSQL | PostgreSQL |
| Deployment | Docker Compose | Docker Compose |

## Current Architecture

Browser → Next.js 14 App Router → FastAPI src/main.py 8265 lines → SQLAlchemy → PostgreSQL

## What Is Working

- 398 API endpoints across 99 backend modules
- 272 portal pages
- JWT authentication with TB_SECRET_KEY
- row-level hotel_id tenant isolation
- Alembic migrations head a7b8c9d0e1f2
- Event outbox platform_events table
- AI Gateway src/commercial/ai_gateway/
- Digital Twin graph twin_nodes and twin_edges tables
- 1982 passing tests

## Known Architectural Debt

1. main.py is 8265 lines with no bounded context separation
2. 458 raw SQL calls in routers with no repository layer
3. 238 ts-nocheck directives in portal
4. Notification system has 7 competing modules
5. Approval system has 3 competing modules

See docs/upgrade-analysis/23_SPRINT_ROADMAP.md for the remediation plan.
