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

## SESSION UPDATE — August 2026

### SPRINTS COMPLETED THIS SESSION

Sprint-013: Employee Timesheets
  - src/commercial/employee_timesheets/ (models, schemas, repository, router)
  - Table: employee_timesheets (hotel_id NOT NULL, 4 indexes)
  - API: GET/POST /api/v1/timesheets/, GET/PATCH/{id}, approve, reject, summary
  - Portal: /employees/[id] — detail + timesheets tab
  - Tests: 8 passing

Sprint-014: Employee Edit Portal
  - portal/app/(app)/employees/[id]/edit/page.tsx
  - Full PATCH form — name, email, phone, dept, position, status, hire_date
  - Redirects to /employees/[id] on success

Sprint-015: Alembic Migration Repair
  - alembic/versions/c4f8a2b1e9d7_add_sprint_tables.py
  - Tracks: employees, journal_entries, eta_invoices, employee_timesheets
  - Safe: CREATE TABLE IF NOT EXISTS — zero data loss
  - downgrade() = no-op (backward compat)
  - Alembic head: c4f8a2b1e9d7

Sprint-016: Financial GL Chart of Accounts
  - Extended src/commercial/financial_gl/ (all 4 files)
  - Table: chart_of_accounts (hotel_id NOT NULL, 3 indexes)
  - API: GET/POST /api/v1/financial/gl/accounts/
  - API: GET/PATCH /api/v1/financial/gl/accounts/{id}
  - Filter by account_type, is_active

Sprint-017: Test Coverage 160 -> 180
  - tests/commercial/test_financial_gl.py (8 tests)
  - tests/commercial/test_quotation.py (6 tests)
  - tests/commercial/test_purchase_orders.py (6 tests)

### CURRENT PLATFORM STATE
  Tests:         180 passing, 23 skipped
  Portal pages:  247
  DB tables:     165
  Alembic head:  c4f8a2b1e9d7
  Backend port:  8030
  Portal port:   3000

### CRITICAL LESSONS LEARNED THIS SESSION
  1. Server must be RESTARTED after main.py changes — tests hit live HTTP
  2. Use src.core.base import Base (NOT src.core.database)
  3. Appending to router.py: use direct function imports not repo.xxx
  4. Never patch main.py with string replace — use surgical line replacement

### REMAINING SPRINT BACKLOG
  Sprint-018: Mobile technician portal (/technician-portal/)
  Sprint-019: ETA e-invoicing credentials + test (invoicing.eta.gov.eg)
  Sprint-020: Test coverage 180 -> 200+
  Sprint-021: Executive dashboard real API connections
  Sprint-022: Alembic migration for chart_of_accounts table

### KNOWN ISSUE
  chart_of_accounts table exists in DB but NOT yet in Alembic migration
  (c4f8a2b1e9d7 covers employees/journal_entries/eta_invoices/employee_timesheets)
  Next session: add chart_of_accounts to Alembic


## SESSION UPDATE — Sprint-018+019 — August 2026

### SPRINTS COMPLETED

Sprint-018: Mobile Technician Portal
  - /technician-portal/ (entry + redirect)
  - /technician-portal/dashboard (stats + active WOs)
  - /technician-portal/work-orders (list + search + filter)
  - /technician-portal/work-orders/[id] (detail + status update)
  - /technician-portal/profile (user info + logout)
  - Mobile-first dark UI, bottom nav, real API data
  - Auth: reuses tb_access_token → redirects to /login if missing ✅

Sprint-019: Alembic chart_of_accounts
  - alembic/versions/d7e9f3a2b8c1_add_chart_of_accounts.py
  - Alembic head: d7e9f3a2b8c1
  - ALL sprint tables now fully Alembic-managed

### PLATFORM STATE END OF SESSION
  Tests:         203 collected, 180 passing, 23 skipped
  Portal pages:  251
  DB tables:     165
  Alembic head:  d7e9f3a2b8c1
  Commits:       757+

### PORTALS
  Main:       http://localhost:3000
  Technician: http://localhost:3000/technician-portal
  Supplier:   http://localhost:3000/supplier-portal
  Client:     http://localhost:3000/client-portal

### NEXT SPRINT BACKLOG (priority order)
  Sprint-020: Executive dashboard real API connections
  Sprint-021: Test coverage 180 -> 200 passing (203 collected, 23 skipped)
  Sprint-022: Work order -> Invoice auto-link when WO completed
  Sprint-023: ETA e-invoicing sandbox (needs invoicing.eta.gov.eg creds)
  Sprint-024: Technician portal QR code scanner for assets

### CRITICAL RULES REMINDER
  1. Always restart server after main.py changes
  2. Base import: from src.core.base import Base (NOT src.core.database)
  3. Router appends: use direct function imports not repo.xxx
  4. Tests use REAL HTTP to localhost:8030 — server must be running
  5. hotel_id NOT NULL on every table — non-negotiable

### CRITICAL RULE — SERVER RESTART (learned Aug 2026)
  ALWAYS restart server with DISABLE_RATE_LIMIT=1:
    DISABLE_RATE_LIMIT=1 .venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8030 > /tmp/tb_server.log 2>&1 &
  OR use:
    bash START.sh   (already has DISABLE_RATE_LIMIT=1)
  NEVER use raw uvicorn without the env var — causes 429 on test suite.
  Alias available: tb-restart


