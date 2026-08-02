## 1. Introduction

Welcome to the Triangle Black Enterprise SaaS platform! Our mission is to s[1D[K
streamline and automate operations in hospitality engineering companies, wi[2D[K
with a primary focus on Sharm El-Sheikh hotels. This document serves as our[3D[K
our technical blueprint, outlining our architecture, technology stack, and [K
governance structure.

### Key Objectives
- **Digitize and Automate**: Replace manual processes with digital tools.
- **Enhance Collaboration**: Streamline communication and workflows among e[1D[K
engineering staff and clients.
- **Improve Efficiency**: Reduce time spent on administrative tasks through[7D[K
through automation.
- **Drive Growth**: Expand the platform to new markets, including hotels ac[2D[K
across Egypt and the Middle East hospitality sector.

### Structure
This document is organized into several sections:

1. **What Is Triangle Black** - Overview of the business problem solved and[3D[K
and target market.
2. **Tech Stack** - Detailed breakdown of our technology architecture.
3. **Repository Structure** - Directory structure for code organization.
4. **Active Portals** - List of operational portals.
5. **Implemented Backend Modules** - Summary of key backend capabilities.
6. **Registered Workflows** - Overview of business workflows.
7. **Sprint Map** - Current sprint plan and progress.
8. **The 10 Rules Every AI Agent Must Follow** - Governance rules for AI ag[2D[K
agents.
9. **Where to Find Things** - Quick reference guide to various resources.

## 2. Tech Stack

### Backend
- **Language**: Python 3.11 + FastAPI
- **Location**: `src/commercial/`
- **Modules**: Over 70 modules covering various functionalities.

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Portals**:
  - Main Operations Portal
  - Client Portal
  - Supplier Portal

### Database
- **Type**: PostgreSQL via SQLAlchemy
- **Location**: `alembic/versions/`
- **Migrations**: Alembic migrations for database schema changes.

### Vector DB
- **Tool**: ChromaDB
- **Location**: `agent/.chromadb/`
- **Feature**: RAG (Retrieval-Augmented Generation) system

### Embeddings
- **Library**: nomic-embed-text (Ollama)
- **Location**: Local

### Design System
- **Components**: shadcn/ui + Storybook
- **Location**: `packages/ui/`

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Isolation**: Per-tenant isolation.

### Containerization
- **Tool**: Docker Compose
- **Configuration File**: `docker-compose.yml`

## 3. Repository Structure

| Directory | Description | Used By |
|-----------|-------------|---------|
| `src/commercial/` | All backend Python code | Backend agents |
| `portal/` | Main Next.js portal (3 portals) | Frontend agents |
| `admin-portal/` | Separate admin Next.js app | Frontend agents |
| `client-portal/` | Separate client Next.js app | Frontend agents |
| `alembic/` | Database migrations | Database agents |
| `agent/` | ChromaDB RAG system | AI Platform agents |
| `workflow-registry/` | Business workflow definitions | Workflow agents |
| `00-ARCHITECT/` | Architecture docs and ADRs | All agents |
| `01-EXECUTIVE/` | Vision and strategy | CEO/COO agents |
| `02-GOVERNANCE/` | Quality gates and risk | QA agents |
| `03-BUSINESS/` | Domain knowledge + hospitality | Domain agents |
| `04-DESIGN/` | Technical design specs | All agents |
| `05-ENGINEERING/` | Engineering standards | Backend/Frontend agents |
| `06-DOMAINS/` | 15 domain specifications | Domain agents |
| `07-INTEGRATION/` | Integration specs | Backend agents |
| `08-OPERATIONS/` | Ops runbooks | DevOps agents |
| `09-EVOLUTION/` | Future roadmap | Strategic agents |
| `10-AI/` | AI delivery system | All AI agents |
| `11-KNOWLEDGE/` | Knowledge base | Knowledge agents |
| `12-SHARED/` | Templates and checklists | All agents |
| `docs/` | Enterprise blueprint v4 + program mgmt | All agents |
| `AI_MEMORY/` | THIS directory — AI agent memory | All agents |
| `TASKS/` | Backlogs and sprint management | COO/Project agents |
| `agents/` | Agent specifications | All agents |

## 4. Active Portals

| Portal | Code Location | Users | Auth | Status |
|--------|--------------|-------|------|--------|
| Main Operations Portal | `portal/app/(app)/` | Engineering staff, manager[7D[K
managers | JWT | ✅ Live |
| Client Portal | `portal/app/client-portal/` | Hotel management clients | [K
JWT | ✅ Live |
| Supplier Portal | `portal/app/supplier-portal/` | Vendors/suppliers | JWT[3D[K
JWT | ✅ Live |
| Admin Portal | `admin-portal/` | System admins | JWT | 🟡 Partial |

## 5. Implemented Backend Modules (src/commercial/)

Key capabilities already built:
- **Full CRM**: lead_management, contracts, quotation, sales_pipeline
- **Procurement**: purchase_requests, purchase_orders, rfqs, goods_receipts[14D[K
goods_receipts
- **Maintenance**: work_orders, maintenance_enterprise, predi[5D[K
predictive_maintenance
- **Inventory**: inventory_items, warehouses, stock_movements, stock_balanc[12D[K
stock_balances
- **Suppliers**: suppliers, vendor_scorecards, supplier_portal
- **Finance**: invoices, payment_tracking, supplier_invoices
- **AI**: ai_assistant, ai_signals, knowledge_graph, digital_twin
- **Executive**: executive_intelligence, executive_kpi, executive_dashboard[19D[K
executive_dashboard
- **Infrastructure**: auth, cache, pagination, notificat[9D[K
notifications, global_search

## 6. Registered Workflows

Full workflow specs in: `workflow-registry/`

### Workflow Examples
- AI Review
- Approval
- Contract to Project
- Incident Management
- Inspection
- Inventory Control
- Lead to Contract
- Procurement to Payment
- Project Execution
- Renewal
- Service to Resolution
- Warranty

## 7. Sprint Map

Sprints 000-021 are fully planned in `10-AI/MAPPING/SPRINTS/`.

Current status: See `AI_MEMORY/CURRENT_PROGRESS.md`

## 8. The 10 Rules Every AI Agent Must Follow

1. **READ FIRST**: Always read this file + 10-AI/DELIVERY/FOUNDATION/AI-CON[32D[K
10-AI/DELIVERY/FOUNDATION/AI-CONSTITUTION.md before any work
2. **TENANT_ID**: Every DB query MUST filter by tenant_id — no exceptions
3. **NO DELETION**: Never delete code, files, or data. Only add and extend.[7D[K
extend.
4. **ADR FIRST**: Any architecture change needs an ADR in `00-ARCHIT[10D[K
`00-ARCHITECT/DECISIONS/`
5. **UPDATE DOCS**: When code changes, update the corresponding docs/ entry[5D[K
entry
6. **HANDOFF**: End every session with an AGENT_HANDOFF.md update
7. **LOG DECISIONS**: Write all decisions to `AI_MEMORY/DECISIONS.md`
8. **ESCALATE SECURITY**: Security issues go to Security Agent + Amr immedi[6D[K
immediately
9. **NO ASSUMPTIONS**: If unclear, check existing code patterns in `src/com[8D[K
`src/commercial/`
10. **BACKWARD COMPATIBLE**: Never break existing API contracts

## 9. Where to Find Things

| I need to... | Location |
|-------------|---------|
| Understand a business domain | `06-DOMAINS/{DOMAIN}/` |
| Find API specifications | `04-DESIGN/API/` |
| Check DB schema | `04-DESIGN/DATABASE/ + alembic/versions/` |
| See sprint plan | `10-AI/MAPPING/SPRINTS/` |
| Check architecture decisions | `00-ARCHITECT/DECISIONS/` |
| Find engineering standards | `05-ENGINEERING/ + ENGINEERING-STANDARDS.md`[25D[K
ENGINEERING-STANDARDS.md` |
| See what's built | `src/commercial/` (code) |
| Check quality gates | `QUALITY_GATES.md` |
| Find agent specs | `agents/ + 10-AI/DELIVERY/ORGANIZATION/` |
| See known problems | `AI_MEMORY/KNOWN_PROBLEMS.md` |
| Check progress | `AI_MEMORY/CURRENT_PROGRESS.md` |

## 10. Multi-Tenant Architecture (Critical)

**Pattern**: Row-level isolation — every tenant's data is in shared tables,[7D[K
tables, separated by tenant_id

**Tenant ID format**: tb-{hotel-slug}-{uuid}
**Example**: tb-hilton-sharm-000000000001

**Enforcement points**:
1. JWT token contains `tenant_id`
2. Every FastAPI endpoint: `tenant_id = Depends(get_current_tenant_id)`
3. Every SQLAlchemy query: `.filter(Model.tenant_id == tenant_id)`
4. ChromaDB: collection name includes `tenant_id`
5. File uploads: `uploads/{tenant_id}/{category}/`

**VIOLATION = CRITICAL SECURITY BUG → escalate to Amr immediately**

---

*Cross-references: ARCHITECTURE_MEMORY.md | REPOSITORY-INDEX.md | AI-GOVERN[9D[K
AI-GOVERNANCE.md | MASTER_EXECUTION_PLAN.md*

