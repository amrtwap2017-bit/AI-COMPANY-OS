# Triangle Black — Enterprise Upgrade Analysis
# Executive Summary
# Date: August 18, 2026

## Platform Identity
Enterprise AI Operations Platform for hotel engineering, maintenance, procurement and asset management.
Target customer: Companies managing engineering operations for hotels and resorts.

## Repository Facts (Verified)

| Metric | Value |
|--------|-------|
| Backend modules | 99 in src/commercial/ |
| Core modules | 17 in src/core/ |
| API endpoints | 398 across routers |
| main.py | 8,265 lines |
| Router registrations | 76 |
| Raw SQL in routers | 458 locations |
| Frontend pages | 272 page.tsx files |
| E2E test specs | 19 Playwright specs |
| Backend test files | 227 |
| Alembic migrations | 18 files |
| hotel_id references | 1,532 |
| organization_id references | 0 in src/ |
| Inline styles in portal | 1,223 |
| Hardcoded colors in portal | 732 |
| ts-nocheck directives | 238 |
| Direct localhost fetch | 0 (fixed) |
| Total passing tests | 1,982 |
| Alembic head | a7b8c9d0e1f2 |

## Architecture Reality vs Documentation

| Aspect | Documentation Says | Reality |
|--------|-------------------|---------|
| Backend framework | NestJS + Prisma | FastAPI + SQLAlchemy |
| Multi-tenancy | Schema-per-tenant | Row-level hotel_id |
| Auth | JWT with RS256 + refresh tokens | JWT HS256, form login, no refresh |
| Database ORM | Prisma | SQLAlchemy + raw SQL (458 locations) |
| Frontend | Next.js 15 | Next.js 14 |
| Service architecture | NestJS modules | 8265-line main.py monolith |
| Event system | Transactional outbox | platform_events table (T-006) |
| AI | Governed agent registry | AIGateway (T-010) + scattered Ollama calls |

CRITICAL: The original architecture documents describe a NestJS + Prisma + schema-per-tenant system.
The actual implementation is Python FastAPI + SQLAlchemy + row-level hotel_id.
This is not an error — it reflects a technology pivot.
The enterprise-blueprint-v4 documents correctly describe the target for the CURRENT stack.

## Current Maturity Scores

| Capability | Score | Evidence |
|-----------|-------|----------|
| Architecture | 40/100 | 8265-line main.py, 458 raw SQL in routers, no bounded context separation |
| Backend | 50/100 | 99 modules but most are router-only with inline SQL |
| Frontend | 45/100 | 272 pages, 1223 inline styles, 238 ts-nocheck, TBEDS 7.1 partial |
| UX | 40/100 | Many pages but no unified page contract, no command center |
| Design System | 35/100 | TBEDS 7.1 CSS exists but not a token-based component system |
| Security | 45/100 | JWT works, 37 security tests, no RBAC enforcement, no OWASP scan |
| Performance | 40/100 | X-DB-Query-Count headers exist, no SLO enforcement, no budget |
| Testing | 65/100 | 1982 passing but mostly HTTP smoke tests, few unit/domain tests |
| DevOps | 35/100 | Docker exists, no CI/CD pipeline, no staging, no release gates |
| AI | 45/100 | AIGateway built, ai_assistant migrated, no agent registry, no eval |
| SaaS | 25/100 | hotel_id only, org_id compat column added, no provisioning |
| Data | 45/100 | 165+ tables, event outbox, twin tables, but 458 raw SQL locations |
| Overall | 42/100 | Substantial capability but architecture debt limits enterprise readiness |

## Top 10 Gaps

| Rank | Gap | Risk | Impact |
|------|-----|------|--------|
| 1 | main.py 8265 lines — no bounded context separation | P1 | Every change risks breaking the monolith |
| 2 | 458 raw SQL in routers — no repository/service layer | P1 | Business logic scattered, untestable |
| 3 | 238 ts-nocheck — TypeScript safety disabled | P1 | Frontend bugs undetectable |
| 4 | No CI/CD pipeline — no automated quality gates | P0 | Regressions undetected |
| 5 | hotel_id only — no real multi-tenancy | P1 | Cannot onboard multiple organizations |
| 6 | 7 notification/email modules — competing implementations | P2 | Inconsistent user experience |
| 7 | 3 approval modules — competing process concepts | P2 | No unified approval workflow |
| 8 | No RBAC enforcement — authorization is decorative | P1 | Security vulnerability |
| 9 | 1223 inline styles — no design token system | P2 | UX inconsistency |
| 10 | Documentation describes NestJS but implementation is FastAPI | P2 | New developers confused |
