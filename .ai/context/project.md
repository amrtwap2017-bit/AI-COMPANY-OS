# PROJECT MASTER CONTEXT
# Source: PROJECT-IDENTITY.md v6.0 + AGENT_HANDOFF.md (Aug 2026) + AGENT-BOOTSTRAP.md
# Last verified: 2026-08-25
# Classification: CONFIDENT (all from direct file inspection)

## What is this project?
Triangle Black Enterprise Operations OS — a multi-tenant SaaS platform for
hospitality engineering organizations. Not a CMMS, not an ERP — an Enterprise
Operations OS that transforms hotel engineering data into controlled workflows,
asset intelligence, and operational decisions.

## Why does it exist?
Hotel engineering organizations collect large amounts of operational data but
fail to convert it into controlled workflows, measurable performance, transparent
decisions, and long-term asset intelligence. Triangle Black solves this.

## Who uses it?
Primary customer: Engineering, maintenance, asset-management, procurement,
contracting, or technical-services companies operating hotel engineering services.
Primary market: Egypt — Sharm El-Sheikh.
Portals: Ops (3200/3000), Client (3201), Admin (3202).

## Core capabilities?
- Asset lifecycle management and digital twin
- Preventive / predictive maintenance
- Work order management with SLA tracking
- Procurement and inventory (purchase request → PO → goods receipt)
- Contractor management
- Operational intelligence (4 AI directors: Maintenance, Procurement, Operations, Executive)
- Multi-tenant enterprise governance
- Financial transparency and audit trails

## Architecture?
Modular Monolith / Multi-tenant Enterprise SaaS
Presentation → API/Controllers → Application Services → Domain →
Repository Ports → Infrastructure → Database (PostgreSQL)
Tenancy: hotel_id field, extracted from JWT via get_hotel_id()

## Technologies?
Backend: FastAPI + SQLAlchemy 2.0 + Alembic + Python 3.12 (uv managed)
Frontend: Next.js App Router + Tailwind + React Query
Database: PostgreSQL (pgvector) + Redis + ChromaDB (RAG live)
AI: Ollama/Qwen locally, 4 governed AI directors
Testing: pytest (158+ passing) + Playwright E2E
Port: API=8030, Portal=3000/3200, Client=3201, Admin=3202

## Major domains?
Commercial (leads, quotes, contracts, billing)
Operations (work orders, service requests, SLA)
Assets (asset registry, maintenance plans, digital twin)
Procurement (purchase requests, POs, inventory, suppliers)
Finance (GL, invoicing, ETA e-invoicing)
HR (employees, timesheets)
AI (4 directors + governed gateway + ChromaDB RAG)

## Important constraints?
- hotel_id from JWT ONLY — never from request params
- Never use pip — always uv
- Never redesign architecture — extend existing patterns
- Never duplicate existing logic
- All DB queries must filter by hotel_id
- Security / tenancy / authorization must never be weakened
- MAX_REPAIR_ATTEMPTS = 3 then stop

## Rules that must never be violated?
See: .ai/constitution/engineering-rules.md
See: .ai/constitution/security-rules.md

## Currently complete?
- Architecture: certified (DDD, repository pattern, auth, tenancy)
- Security: certified (OWASP/ASVS hardened)
- Operations workflow: certified vertical slice
- 158+ backend tests passing
- 75+ commercial backend modules
- ~302 API routes
- ~276 portal pages
- AI governance + ChromaDB RAG live

## Currently incomplete?
- Employee timesheet module
- Financial GL chart of accounts
- ETA credentials (register at invoicing.eta.gov.eg)
- ~68 redirect portal pages
- Alembic migrations for employees/gl/eta (created directly via SQL — needs repair)
- TypeScript bugs: GlobalSearch.tsx + icons.tsx (portal)
- Test coverage: 158 → target 200+

## Currently in progress?
See: .ai/state/agent-state.json

## What is next?
Priority: N-FIX → N-014 Commercial Pilot
See: .ai/state/project-state.json → next_actions
See: 11-WORKSPACES/triangle-black/AGENT_HANDOFF.md

---
Note: Keep this file under 200 lines. Update after each sprint close.
