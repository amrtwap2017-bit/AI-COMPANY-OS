# Triangle Black — Master Repository Index

> Single entry point for all Triangle Black programs, phases, and documentation.
> Every AI agent reads this file first to navigate the entire project.

## Quick Navigation

| What | Where | Files |
|------|-------|-------|
| **Implementation code** | `PROGRAM-04-TRIANGLE-BLACK/00-REPOSITORY-FOUNDATION/` | 41,822 |
| **Enterprise Knowledge System** | `PROGRAM-04/00-REPOSITORY-FOUNDATION/ENTERPRISE-KNOWLEDGE-SYSTEM/` | 97 |
| **Identity implementation docs** | `PROGRAM-06-IMPLEMENTATION/` | 149 |
| **Enterprise RAG Platform code** | `PROGRAM-04/00-REPOSITORY-FOUNDATION/packages/knowledge-*/` + `apps/knowledge-*/` | 225 |
| **Digital Twin docs** | `PROGRAM-05-ENTERPRISE-DIGITAL-TWIN/` | 102 |
| **Business domain docs** | `PHASE-06-BUSINESS-DOMAINS/` | 317 |
| **Enterprise blueprint** | `PHASE-01-ENTERPRISE-DOCUMENTATION/` | 288 |
| **Go-live / operations** | `PHASE-08-09-10/` | 300 |
| **AI delivery framework** | `PROGRAM-02-ENTERPRISE-AI-DELIVERY/` | 120 |
| **AI execution system** | `PROGRAM-03-ENTERPRISE-AI-EXECUTION/` | 120 |
| **Shared cross-program templates** | `SHARED/` | 11 |

---

## Naming Convention

This repository uses **two directory naming systems** that coexist at the root:

### PHASE System (Original Enterprise Blueprint)

The PHASE directories represent the **original waterfall-style planning** — a complete enterprise blueprint divided into sequential phases. These are mostly **reference documentation** describing what *should* be built.

| Directory | Content | Status |
|-----------|---------|--------|
| `PHASE-00` | Planning initiation | Reference |
| `PHASE-01-ENTERPRISE-DOCUMENTATION` | Full enterprise blueprint (25 sections: governance, business, market, domain, architecture, database, backend, frontend, API, infrastructure, security, AI, testing, deployment, operations, knowledge base, roadmaps) | Reference |
| `PHASE-02-IMPLEMENTATION-BLUEPRINT` | Implementation strategy | Reference |
| `PHASE-03-DIGITAL-TWIN-DESIGN` | Digital Twin product design, UX, screens, design system, database, API, backend, events, security, reporting, AI agents | Reference |
| `PHASE-04-ENTERPRISE-ENGINEERING` | Engineering standards (monorepo, git, coding, database, API, frontend, backend, CI/CD, testing, security, observability, AI coding, releases, quality gates) | Reference |
| `PHASE-05-PRODUCT-IMPLEMENTATION` | Product implementation plan (infrastructure, identity, platform services, UX, workflows, data, API, application, observability, security, quality, DevOps, AI, MVP validation) | Reference |
| `PHASE-06-BUSINESS-DOMAINS` | Business domain specifications (commercial, projects, procurement, suppliers, inventory, finance, maintenance, documents, executive, AI copilots, integrations, mobile, HR) | Reference |
| `PHASE-07-ENTERPRISE-INTEGRATION` | Integration specifications | Reference |
| `PHASE-08-ENTERPRISE-OPERATIONAL-READINESS` | Operations readiness (business, product, engineering, QA, security, infrastructure, operations, customer success, commercial, finance, AI governance, go-live) | Reference |
| `PHASE-09-ENTERPRISE-TRANSITION` | Go-live execution (governance, deployment, business transition, customer onboarding, support, monitoring, security operations, commercial roll-out, hypercare, knowledge transfer, post-launch) | Reference |
| `PHASE-10-ENTERPRISE-EVOLUTION` | Long-term evolution (strategy, product, AI, data intelligence, automation, platform scaling, enterprise ecosystem, customer success, engineering, business growth, research, governance) | Reference |

### PROGRAM System (AI Delivery Reframe)

The PROGRAM directories represent the **AI-delivery-focused reframe** — these are the active programs that map to the Implementation Baseline v1.0. They overlap with PHASE content but are organized for AI agent execution.

| Directory | Content | Status |
|-----------|---------|--------|
| `PROGRAM-02-ENTERPRISE-AI-DELIVERY` | AI Delivery Framework (foundation, organization, governance, communication, delivery pipeline, standards, templates, prompts, quality, automation, metrics, execution, knowledge) | Reference |
| `PROGRAM-02.5-DELIVERY-MAPPING` | Delivery Mapping (capability mapping, consumption matrix, traceability, module maps, sprint maps, context packs, dependency graphs, implementation sequences, deliverable mapping, validation) | Reference |
| `PROGRAM-03-ENTERPRISE-AI-EXECUTION` | AI Execution System (portfolio, program management, epics, features, user stories, task decomposition, sprints, deliverables, quality gates, release management, configuration, observability, continuous execution) | Reference |
| `PROGRAM-04-TRIANGLE-BLACK` | **Implementation monorepo** — the actual code, Docker, CI/CD, and EKS v1.0 | **Active** |
| `PROGRAM-05-ENTERPRISE-DIGITAL-TWIN` | Digital Twin design (core, hotel hierarchy, equipment, maintenance, inventory, supplier, procurement, finance, projects, executive, relationships, enterprise model) | Reference |
| `PROGRAM-06-IMPLEMENTATION` | Identity Domain implementation docs (domain, authentication, sessions, authorization, RBAC, organizations, users, teams, departments, invitations, MFA, password, profile, audit, API, UI, infrastructure, testing, documentation, deliverables) | Reference |
| `PROGRAM-07-ENTERPRISE-RAG` | **Knowledge Intelligence Platform** — RAG system with pgvector, hybrid search, knowledge graph, NestJS API, Next.js dashboard, BullMQ worker | **Active** |

### PHASE ↔ PROGRAM Cross-Reference

| Topic | PHASE Docs | PROGRAM Docs | Implementation |
|-------|-----------|-------------|----------------|
| **Enterprise Blueprint** | PHASE-01 (25 sections) | PROGRAM-02, PROGRAM-03 | — |
| **Digital Twin** | PHASE-03 (13 sections) | PROGRAM-05 (12 sections) | — |
| **Engineering Standards** | PHASE-04 (25 sections) | — | PROGRAM-04/00-REPOSITORY-FOUNDATION |
| **Identity Platform** | PHASE-05 section 02 | PROGRAM-06 (19 sections) | `packages/identity/` + `apps/api` |
| **Business Domains** | PHASE-06 (13 domains) | — | — |
| **Knowledge System** | PHASE-01 section 21 | — | `ENTERPRISE-KNOWLEDGE-SYSTEM/` |
| **RAG Platform** | — | PROGRAM-07 | `packages/knowledge-*` + `apps/knowledge-*` |
| **Go-Live** | PHASE-08, 09 | — | — |
| **Evolution** | PHASE-10 | — | — |

### How to Read This Repository

1. **Looking for code?** → `PROGRAM-04-TRIANGLE-BLACK/00-REPOSITORY-FOUNDATION/`
2. **Looking for architecture docs?** → `PHASE-01-ENTERPRISE-DOCUMENTATION/` (broad) or individual `PROGRAM-*/` (focused)
3. **Looking for knowledge system?** → `ENTERPRISE-KNOWLEDGE-SYSTEM/` inside the monorepo
4. **Looking for business domain specs?** → `PHASE-06-BUSINESS-DOMAINS/`
5. **Looking for AI context?** → `PROGRAM-02/03` + `ENTERPRISE-KNOWLEDGE-SYSTEM/AI/`
6. **Looking for deployment/operations?** → `PHASE-08-09-10/`
7. **Looking for cross-program standards?** → `SHARED/`

---

## Directory Inventory

### Root Level — 20 Directories

```
C:\PM\Triangle black/
├── PHASE-00/                             5 files    Planning initiation
├── PHASE-01-ENTERPRISE-DOCUMENTATION/  288 files    Enterprise blueprint (25 sections)
├── PHASE-02-IMPLEMENTATION-BLUEPRINT/    9 files    Implementation strategy
├── PHASE-03-DIGITAL-TWIN-DESIGN/        76 files    Digital Twin product design
├── PHASE-04-ENTERPRISE-ENGINEERING/     41 files    Engineering standards
├── PHASE-05-PRODUCT-IMPLEMENTATION/     40 files    Product implementation plan
├── PHASE-06-BUSINESS-DOMAINS/          317 files    Business domain specifications
├── PHASE-07-ENTERPRISE-INTEGRATION/     13 files    Integration specifications
├── PHASE-08-ENTERPRISE-OPERATIONAL-READINESS/  81 files    Operations readiness
├── PHASE-09-ENTERPRISE-TRANSITION/     104 files    Go-live transition
├── PHASE-10-ENTERPRISE-EVOLUTION/      115 files    Long-term evolution
├── PROGRAM-02-ENTERPRISE-AI-DELIVERY/  120 files    AI Delivery Framework
├── PROGRAM-02.5-DELIVERY-MAPPING/      115 files    Delivery Mapping
├── PROGRAM-03-ENTERPRISE-AI-EXECUTION/ 120 files    AI Execution System
├── PROGRAM-04-TRIANGLE-BLACK/        41,906 files    ★ Implementation monorepo (code)
├── PROGRAM-05-ENTERPRISE-DIGITAL-TWIN/ 102 files    Digital Twin design
├── PROGRAM-06-IMPLEMENTATION/          149 files    Identity domain implementation docs
├── PROGRAM-07-ENTERPRISE-RAG/            5 files    RAG Platform docs + deployment guide
├── SHARED/                               11 files    Cross-program templates and standards
└── archive/                               1 file     Archived materials

Total: ~43,000+ files
```

### PROGRAM-04 Monorepo Structure (Code)

```
PROGRAM-04-TRIANGLE-BLACK/
├── 00-REPOSITORY-FOUNDATION/          41,822 files   ★ Git repository (all code)
│   ├── apps/                                        Application code
│   │   ├── web/                        Next.js 15 frontend
│   │   ├── api/                        NestJS 11 backend
│   │   ├── worker/                     BullMQ worker
│   │   ├── knowledge-api/              NestJS 11 RAG API
│   │   ├── knowledge-worker/           BullMQ knowledge worker
│   │   └── knowledge-dashboard/        Next.js 15 dashboard
│   ├── packages/                                    Shared packages
│   │   ├── shared/                     Types, utils, errors
│   │   ├── database/                   Prisma + migrations
│   │   ├── config/                     Environment config
│   │   ├── auth/                       Auth services
│   │   ├── identity/                   Full DDD identity module
│   │   ├── ui/                         UI components
│   │   ├── knowledge-core/             RAG shared kernel
│   │   ├── knowledge-parser/           Document parsers
│   │   ├── knowledge-chunker/          Semantic chunking
│   │   ├── knowledge-embeddings/       Embedding providers
│   │   ├── knowledge-vector/           pgvector store
│   │   ├── knowledge-graph/            Knowledge graph
│   │   ├── knowledge-indexer/          Indexing pipeline
│   │   ├── knowledge-retriever/        Hybrid retrieval
│   │   ├── knowledge-ranking/          Reranking
│   │   ├── knowledge-context/          Context builder
│   │   ├── knowledge-observability/    OpenTelemetry
│   │   ├── knowledge-testing/          Test mocks + fixtures
│   │   └── knowledge-sdk/              Public SDK
│   ├── docker-compose.yml              Full stack orchestration
│   ├── docker-compose.knowledge.yml    Knowledge platform extension
│   ├── ENTERPRISE-KNOWLEDGE-SYSTEM/    ★ EKS v1.0 (97 files)
│   └── ...                             Config, CI/CD, docs, scripts
├── 01-PLATFORM-FOUNDATION/             Platform architecture docs
└── 01.5-PLATFORM-CERTIFICATION/        Certification docs
```

---

## Version Control

| Repository | Location | Scope |
|-----------|----------|-------|
| **Root (this repo)** | `C:\PM\Triangle black\` | All PHASE, PROGRAM, and SHARED documentation |
| **Code monorepo** | `PROGRAM-04/00-REPOSITORY-FOUNDATION/` | All implementation code (separate git repo) |

Tags in the code monorepo: `foundation-v1.0`, `program-07-v1.0`

---

## Tags

| Tag | Location | Description |
|-----|----------|-------------|
| `foundation-v1.0` | Code monorepo | Baseline: Architecture + Identity + EKS + Digital Twin |
| `program-07-v1.0` | Code monorepo | Enterprise Knowledge Intelligence Platform |

---

## Total Project

| Metric | Value |
|--------|-------|
| Total files | ~43,000+ |
| Documentation files | ~1,700 (all PHASE + PROGRAM dirs excluding code) |
| Source code files | ~41,300 (PROGRAM-04 monorepo) |
| Git repositories | 2 (root docs + code monorepo) |
| Programs | 6 (PROGRAM-02 through PROGRAM-07) |
| Phases | 11 (PHASE-00 through PHASE-10) |
| Knowledge docs | 97 (EKS v1.0) |
| RAG packages | 13 |
| Applications | 6 (web, api, worker, knowledge-api, knowledge-worker, knowledge-dashboard) |
