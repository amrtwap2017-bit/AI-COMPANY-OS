# Triangle Black — Enterprise Architecture Documentation

> Hospitality Engineering Platform — Business Operating System
> Egypt Market — USD 21.54B (2026), 7.12% CAGR

## Project Overview

Triangle Black is an enterprise hospitality engineering platform designed to manage the complete client lifecycle — from lead capture and quotation through project delivery, procurement, financial control, and ongoing maintenance. Built for the Egypt hospitality market with a startup budget ($6-40/mo VPS).

## Documentation Structure

| Path | Phase | Focus | Files |
|------|-------|-------|-------|
| `PHASE-00/` | Strategic Foundation | Vision, business model, revenue architecture, roadmap | 5 |
| `PHASE-01/` | Enterprise Documentation | Business architecture, DDD, workflows, hospitality knowledge, domain, operations | 281 |
| `PHASE-02/` | Implementation Blueprint | Enterprise/backend/frontend/database/API/AI/DevOps architecture | 1+ |
| `PHASE-03/` | Digital Twin Design | Product decomposition, screens, design system, events, security, database, API specs | 65 |
| `PHASE-04/` | Enterprise Engineering | Engineering handbook, monorepo, CI/CD, testing, security, observability, AI engineering | 30 |
| `PHASE-05/` | Product Implementation | Platform foundation, identity, services, data, API, security, DevOps, MVP | 25 |
| `PHASE-06/` | Business Domains | 13 domain modules (commercial → release), 20 files each | 285 |
| `PHASE-07/` | Enterprise Integration | External systems, context map, API gateway, contracts, events, sync | 12 |
| `PHASE-08/` | Operational Readiness | 12-section readiness validation across business, product, engineering, QA, security, infra, ops, customer, commercial, finance, AI, go-live | 102 |
| `PHASE-09/` | Enterprise Transition & Go-Live | 12-section transition program: governance, deployment, business transition, onboarding, support, monitoring, security, commercial, hypercare, knowledge transfer, review, closure | 102 |
| `SHARED/` | Cross-Cutting | Naming conventions, templates, policies, review checklists | 11 |
| `archive/` | Superseded | Historical documents superseded by later phases | — |

## Governance Files

| File | Purpose |
|------|---------|
| `00-ENTERPRISE-ARCHITECTURE.md` | Enterprise architecture overview, all phases |
| `01-ARCHITECTURE-PRINCIPLES.md` | Immutable architecture principles |
| `02-DECISION-RECORDS.md` | Architecture Decision Record index |
| `03-TRACEABILITY-MATRIX.md` | Cross-phase requirements traceability |
| `04-IMPLEMENTATION-ROADMAP.md` | Phased delivery timeline |
| `05-MASTER-DEPENDENCIES.md` | Complete dependency graph across all phases |
| `06-RISK-REGISTER.md` | Project and architecture risks |
| `07-QUALITY-GATES.md` | Phase completion criteria |

## Architecture Invariants

1. **Design freeze**: Phases 0-4 frozen. Changes require ADR.
2. **Revenue-first build**: Commercial → Delivery → Procurement → Financial
3. **Startup budget**: Single VPS, self-hosted PostgreSQL, no paid middleware
4. **Technology stack**: Ubuntu, Docker Compose, Nginx, PostgreSQL, Prisma 6, Next.js 15, NestJS 11, shadcn/ui, JWT, GitHub Actions
5. **Tenant isolation**: Schema-per-tenant PostgreSQL
6. **Domain-driven**: All modules organized by business capability, not technical layer
7. **Integration boundary**: External systems never touch internal domain logic directly

## Quick Start

```
PHASE-00/    → Vision & business case
PHASE-01/    → Business architecture & DDD
PHASE-02/    → Implementation blueprint
PHASE-03/    → Digital twin design
PHASE-04/    → Engineering standards
PHASE-05/    → Running platform code
PHASE-06/    → Business capability specs
PHASE-07/    → Integration architecture
PHASE-08/    → Operational readiness validation
PHASE-09/    → Enterprise transition & go-live
```
