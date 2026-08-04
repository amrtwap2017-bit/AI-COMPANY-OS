# AGENT HANDOFF — Triangle Black
# Date: August 2026
# Read this BEFORE touching any file

## QUICK START
bash START.sh          # start backend (8030) + portal (3000)
Login: amr@triangleblack.com / admin123

## WHAT THIS IS
Enterprise SaaS for hotel engineering in Egypt (Sharm El-Sheikh focus)
Multi-tenant: each hotel = one tenant, identified by hotel_id field

## CRITICAL RULES
1. Never delete code - only extend
2. Every DB query MUST filter by hotel_id (NOT tenant_id)
3. get_hotel_id in src/core/tenant.py extracts from JWT
4. RATE_LIMIT_MAX = 10000 in src/main.py (do not lower)
5. Use tbFetch from portal/lib/api/tb-client.ts for all portal API calls
6. Add mounted state before API calls in portal pages
7. Never create new login fixtures in tests - use auth_headers from conftest

## TECH STACK
- Backend: Python FastAPI in src/commercial/ (75+ modules)
- Frontend: Next.js 14 App Router in portal/
- Database: PostgreSQL + SQLAlchemy + Alembic (stamped to head)
- Vector DB: ChromaDB in agent/.chromadb/ (RAG live)
- Token key: tb_access_token in localStorage

## TESTS
Run: .venv/bin/python -m pytest tests/ -q --tb=no | tail -3
Current: 158+ passing, 0 failing
Config: pytest.ini (excludes broken legacy tests)

## NEW BACKEND MODULES (built this session)
- /api/v1/employees/     HR employees CRUD
- /api/v1/financial/gl/  Journal entries + summary
- /api/v1/eta/           ETA e-invoicing (needs ETA_CLIENT_ID + ETA_CLIENT_SECRET)

## PORTAL PAGES BUILT THIS SESSION
/leads, /leads/{id}, /leads/new, /leads/{id}/edit
/quotes, /quotes/{id}, /quotes/new
/contracts, /contracts/{id}
/employees, /employees/new
/financial/gl, /financial/gl/new
/operations/work-orders/new
/supply-chain/purchase-requests/new

## API ENDPOINTS
GET  /api/v1/leads/?limit=100          -> {count, results:[...]}
GET  /api/v1/leads/{id}                -> lead object (name, email, company, status)
POST /api/v1/actions/leads/{id}/qualify -> {ok, score, grade}
GET  /api/v1/quotes/?limit=100         -> array
POST /api/v1/actions/quotes/{id}/approve -> {ok, status, contract_id}
GET  /api/v1/contracts/?limit=100      -> array
GET  /api/v1/employees/?limit=100      -> array
GET  /api/v1/financial/gl/summary      -> {total_entries, balance}
GET  /api/v1/eta/status                -> {configured, sandbox}

## WHAT IS MISSING (priority order)
1. Employee timesheet module (POST /api/v1/timesheets/)
2. Financial GL chart of accounts
3. ETA credentials (register at invoicing.eta.gov.eg)
4. 68 redirect portal pages (low priority - analytics/secondary)
5. Alembic migrations for employees/gl/eta (created directly via SQL)
6. Mobile technician portal
7. Test coverage: 158 -> target 200+
8. HR domain portal: employees/{id} detail + edit page

## SPRINT BACKLOG (ordered by value)
Sprint-013: Employee Timesheets backend + portal
Sprint-014: Employee detail/edit portal page
Sprint-015: Alembic migration repair
Sprint-016: Financial GL chart of accounts
Sprint-017: Test coverage to 200+
Sprint-018: Mobile technician portal

## COMMITS THIS SESSION: 115+
## BUILD GUARD: All passing
## TOTAL REPO COMMITS: 750+
