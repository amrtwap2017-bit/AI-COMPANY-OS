# 00 — Enterprise Architecture Overview

> Complete architecture map across all phases.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS & VISION LAYER                            │
│  PHASE-00: Vision, Business Model, Value Proposition, Revenue           │
│  PHASE-01: Business Architecture, Capability Map, DDD, Workflows        │
├─────────────────────────────────────────────────────────────────────────┤
│                      DESIGN & BLUEPRINT LAYER                           │
│  PHASE-02: Enterprise, Backend, Frontend, Database, API, AI, DevOps    │
│  PHASE-03: Product Decomposition, UX, Screens, Events, Security        │
├─────────────────────────────────────────────────────────────────────────┤
│                      ENGINEERING LAYER                                  │
│  PHASE-04: Engineering Handbook, Standards, CI/CD, Testing             │
├─────────────────────────────────────────────────────────────────────────┤
│                      IMPLEMENTATION LAYER                               │
│  PHASE-05: Platform Foundation, Identity, Services, Data, Security     │
│  PHASE-06: 13 Business Domains (Commercial → Release)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                      INTEGRATION LAYER                                  │
│  PHASE-07: External Systems, API Gateway, Contracts, Events, Sync      │
├─────────────────────────────────────────────────────────────────────────┤
│                      SHARED / GOVERNANCE                                │
│  SHARED/: Conventions, Templates, Policies                              │
│  00-07 Root: Enterprise Architecture, Principles, Decisions            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Phase Relationships

```
PHASE-00 ──► PHASE-01 ──► PHASE-02 ──► PHASE-03 ──► PHASE-04 ──► PHASE-05 ──► PHASE-06 ──► PHASE-07
  │            │             │             │             │             │             │             │
  ▼            ▼             ▼             ▼             ▼             ▼             ▼             ▼
 Vision    Business      Technical     Product       Engineer-    Working       Domain       Integration
 & Model   Architecture  Blueprint     Design        ing Std      Code          Specs        Boundaries

 Each phase builds on the previous. No phase redesigns an earlier phase.
```

## File Count by Phase

| Phase | Purpose | Files |
|-------|---------|-------|
| 00 | Strategic Foundation | 5 |
| 01 | Enterprise Documentation | 281 |
| 02 | Implementation Blueprint | 1+ |
| 03 | Digital Twin Design | 65 |
| 04 | Enterprise Engineering | 30 |
| 05 | Product Implementation | 25 |
| 06 | Business Domains | 285 |
| 07 | Enterprise Integration | 12 |
| SHARED | Cross-cutting | 11 |
| Root | Governance | 9 |
| **Total** | | **~724** |

## Key Architecture Decisions (Index)

| ADR | Title | Phase |
|-----|-------|-------|
| 001 | Schema-per-tenant PostgreSQL | 02 |
| 002 | Next.js 15 + NestJS 11 monorepo | 02 |
| 003 | Revenue-first build order | 00 |
| 004 | DDD bounded contexts for Phase 6 | 01 |
| 005 | Startup VPS budget ($6-40/mo) | 04 |
| 006 | JWT auth, no SSO in V1 | 04 |
| 007 | Rule-based AI agents, no ML in V1 | 04 |
| 008 | Phase 7 — integration boundaries only | 07 |

See `02-DECISION-RECORDS.md` for full ADR details.

## Traceability

See `03-TRACEABILITY-MATRIX.md` for cross-phase requirement mapping.
