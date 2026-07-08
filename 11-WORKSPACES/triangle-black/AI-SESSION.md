# AI-SESSION.md — Triangle Black Project State
# Single entry point for every new AI session
# Usage: cat AI-SESSION.md

---

## PROJECT IDENTITY
Name:     Triangle Black
Type:     Enterprise Hotel Engineering Platform
Version:  v1.3.0 (API) — Sprint 12 active
Owner:    Amr Mostafa
Started:  July 2026

---

## SYSTEM ARCHITECTURE

### Five Services (all must be running)
| Port | Service                    | Start Command                          |
|------|----------------------------|----------------------------------------|
| 8000 | AICOS API (frozen)         | cd ~/AI/projects/ai-company-os/apps/api && source .venv/bin/activate && uvicorn app.models.main:app --host 0.0.0.0 --port 8000 --reload |
| 8010 | AI Engineering Hub         | cd ~/AI/projects/AI-ENGINEERING-HUB && ./start-hub.sh |
| 8020 | Enterprise Orchestrator    | cd ~/AI/projects/AI-ENGINEERING-HUB/PROGRAM-06-ENTERPRISE-AI-ORCHESTRATION && ./start-orchestrator.sh |
| 8030 | Triangle Black API         | cd ~/AI-COMPANY-OS/11-WORKSPACES/triangle-black && ./start-api.sh |
| 3100 | AI Hub Portal              | cd ~/AI/projects/AI-ENGINEERING-HUB/09-DEVELOPER-PORTAL/portal && npm run dev -- --port 3100 |
| 3200 | TB Operations Portal       | cd ~/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal && npm run dev -- --port 3200 |
| 3300 | TB Admin Portal            | cd ~/AI-COMPANY-OS/11-WORKSPACES/triangle-black/admin-portal && npm run dev -- --port 3300 |

### Health Check (run this first every session)
curl -s http://127.0.0.1:8000/api/v1/health/live && echo " AICOS" &&
curl -s http://127.0.0.1:8010/health && echo " Hub" &&
curl -s http://127.0.0.1:8020/orchestrator/health && echo " Orchestrator" &&
curl -s http://127.0.0.1:8030/health && echo " Triangle Black API"

---

## DATABASES

| Container              | Port  | DB Name          | User           | Password | Used By       |
|------------------------|-------|------------------|----------------|----------|---------------|
| triangle-black-db-1    | 5434  | triangle_black   | triangleblack  | tb123    | TB API        |
| infra-postgres-1       | 55432 | ai_hub           | postgres       | postgres | Hub + Orch    |
| ai-postgres            | 5432  | ai_company_os    | ai             | ai123    | AICOS         |

TB API DB URL: postgresql+psycopg2://triangleblack:tb123@127.0.0.1:5432/triangle_black
Hub DB URL:    postgresql+psycopg://postgres:postgres@127.0.0.1:55432/ai_hub

NOTE: TB API connects to ai-postgres container (port 5432) NOT triangle-black-db-1 (port 5434)
The .env file uses port 5432 which maps to the ai-postgres pgvector container.

---

## TRIANGLE BLACK CODEBASE

### Location
/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/

### Key Files
src/main.py              — FastAPI app, 13 routers, v1.3.0
src/core/auth.py         — JWT: bcrypt + python-jose, 8h access token, 30d refresh
src/core/database.py     — SQLAlchemy engine, get_db dependency
src/core/base.py         — SQLAlchemy declarative_base()
src/core/seed.py         — Demo data: 4 users, 3 agents, 15 leads, 6 quotes
src/commercial/auth/     — User model + login/register/refresh/me endpoints
admin-portal/lib/api.ts  — Axios client → port 8030 (FIXED from 8020)
portal/lib/api.ts        — Axios client → port 8030 (FIXED from 8020)

### Domains Implemented
commercial/
  lead_management/       — Lead CRUD + status workflow
  agent_management/      — Agent CRUD + capacity
  pipeline_dashboard/    — Pipeline view
  activity_tracking/     — Activity timeline
  search_filters/        — Lead search
  webhook_notifications/ — Webhooks
  quotation/             — Quote generation + approval workflow
  auth/                  — JWT authentication
  reporting/             — Dashboard reports
  contracts/             — Contract lifecycle
  notifications/         — Bell notifications
  invoices/              — Invoice management

### API Prefix
All endpoints: /api/v1/
Auth: OAuth2PasswordRequestForm (form-encoded, username=email)

---

## AUTHENTICATION

### Credentials (seeded in DB)
Email                      Password      Role
amr@triangleblack.com      Admin123!     admin
sara@triangleblack.com     Manager123!   manager
hassan@triangleblack.com   Agent123!     agent
mona@triangleblack.com     Agent123!     agent
admin@triangleblack.com    (unknown)     manager

### Login Command
curl -s -X POST http://127.0.0.1:8030/api/v1/auth/login \
  -H "content-type: application/x-www-form-urlencoded" \
  -d "username=amr%40triangleblack.com&password=Admin123%21"

### Role Hierarchy
require_admin   = admin only
require_manager = admin + manager
require_agent   = admin + manager + agent
require_any     = all roles including client

---

## GIT STATE

Branch:   main
Ahead:    35 commits ahead of origin
Tags:     v0.9.0 v1.1.0 v1.2.0 v1.3.0 v1.4.0 v1.5.0 v1.6.0 v1.7.0 v1.8.0 v1.9.0 v2.0.0-sprint1-complete
Latest:   fix: correct API base URL from port 8020 to 8030

Git push needed: YES (35 commits not pushed)

---

## AI ENGINEERING HUB STATE

Workspace ID: 0d22ba37-30b0-46d9-844f-312ec5f9abc8
Name:         Triangle Black

DB Stats (as of last check):
  Tasks:          113 (105 done, 8 pending)
  Memories:        70
  Execution runs: 309
  Sprint:         92.9% complete

Next recommended task: MT-002 Multi-hotel Data Isolation (high priority)

---

## ORCHESTRATOR STATE

Location: ~/AI/projects/AI-ENGINEERING-HUB/PROGRAM-06-ENTERPRISE-AI-ORCHESTRATION/
Port:     8020
DB:       ai_hub (same as Hub, adds 6 tables)

Tables added by orchestrator:
  pipeline_runs          — Stage-by-stage execution tracking
  pipeline_artifacts     — Generated files per run
  project_snapshots      — Morning briefings + daily reports
  sprint_metrics         — Velocity tracking
  prompt_templates       — Self-improving prompts
  sprint_retrospectives  — Post-sprint AI analysis

Key endpoints:
  GET  /orchestrator/briefing/{workspace_id}  — Morning briefing
  GET  /orchestrator/state/{workspace_id}     — Live project state
  POST /orchestrator/run/{workspace_id}       — Full pipeline execution
  GET  /orchestrator/memory/{workspace_id}    — Institutional knowledge

---

## KNOWN ISSUES & FIXED BUGS

### FIXED
- admin-portal/lib/api.ts pointed to port 8020 (orchestrator) instead of 8030 (TB API)
  Fix: Changed BASE URL to http://localhost:8030/api/v1
  Date: 2026-07-08

### KNOWN LIMITATIONS
- AI briefing via Ollama times out (non-blocking, falls back to static briefing)
- Git push to origin pending (35 commits local only)
- start.sh references port 8020 for TB API (now conflicts with orchestrator on 8020)
  Action needed: Update start.sh to use port 8030 for TB API

### ARCHITECTURAL RULES (NEVER VIOLATE)
- AICOS is FROZEN — never modify, only consume its APIs
- Triangle Black is a CLIENT of AICOS — never couple them
- Hub DB (ai_hub) is shared by Hub + Orchestrator — no separate DB for orchestrator
- TB API has its own DB (triangle_black) — completely separate
- All models import Base from src.core.base — never create own Base
- Never use scalar_one_or_none() on queries that may return multiple rows
- Never name columns 'metadata' (SQLAlchemy reserved) — use extra_meta
- Always quote brackets in zsh: mkdir -p 'src/[bracket]'

---

## NEXT ACTIONS (Sprint 12 backlog)

Priority  Task
HIGH      Fix start.sh — TB API port conflict (8020 vs 8030)
HIGH      Git push to origin (35 commits pending)
HIGH      MT-002: Multi-hotel data isolation
MEDIUM    Streaming progress via WebSocket in portal
MEDIUM    Real token tracking in pipeline_runs
MEDIUM    Grafana dashboards for Prometheus metrics
LOW       Docker Compose for full TB stack
LOW       Load testing

---

## ENVIRONMENT VARIABLES

### Hub + Orchestrator (needed in every terminal)
export POSTGRES_DSN="postgresql+psycopg://postgres:postgres@127.0.0.1:55432/ai_hub"
export AI_COMPANY_OS_BASE_URL="http://127.0.0.1:8000"
export HUB_BASE_URL="http://127.0.0.1:8010"
export OLLAMA_BASE_URL="http://127.0.0.1:11434"
export REDIS_URL="redis://127.0.0.1:56379"

### Triangle Black API
export TRIANGLE_BLACK_DB_URL="postgresql+psycopg2://triangleblack:tb123@127.0.0.1:5432/triangle_black"
export TB_SECRET_KEY="triangle-black-secret-key-change-in-production"

---

## QUICK REFERENCE — MOST USED COMMANDS

# Check all services
curl -s http://127.0.0.1:8030/health | python3 -m json.tool

# Get auth token
TOKEN=$(curl -s -X POST http://127.0.0.1:8030/api/v1/auth/login \
  -H "content-type: application/x-www-form-urlencoded" \
  -d "username=amr%40triangleblack.com&password=Admin123%21" | \
  python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")

# List leads
curl -s http://127.0.0.1:8030/api/v1/leads/?limit=10 -H "Authorization: Bearer $TOKEN"

# Morning briefing
curl -s http://127.0.0.1:8020/orchestrator/briefing/0d22ba37-30b0-46d9-844f-312ec5f9abc8

# Run TB tests
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
.venv/bin/python -m pytest tests/ --tb=short -q

# Git log
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black && git log --oneline -10

---

Last Updated: 2026-07-08
Updated By: AI Architect Session
