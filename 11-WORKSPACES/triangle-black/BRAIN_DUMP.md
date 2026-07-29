
================================================================================
TRIANGLE BLACK — COMPLETE BRAIN DUMP FROM CONVERSATION
"Everything We Faced Together"
For the Next Agent + Production Readiness Guide
Generated: 29/07/2026 03:20
================================================================================

╔══════════════════════════════════════════════════════════════════════════════╗
║  PART 1: THE FULL STORY — WHAT HAPPENED IN THIS CONVERSATION               ║
╚══════════════════════════════════════════════════════════════════════════════╝

HOW THIS PROJECT STARTED:
The user came with an existing codebase (sprints 1-244) that already had:
- A FastAPI backend with many old routers (works orders, leads, commercial CRM)
- A Next.js portal with old pages
- PostgreSQL running in Docker (ai-postgres)
- An old design system with tb-* classes
The PROBLEM: the old system was disconnected, broken, and incomplete.
We built 20 new sprints ON TOP of the existing system.

THE CORE ARCHITECTURAL DECISION WE MADE:
Instead of rewriting, we APPENDED to main.py.
This means main.py is now ~6000 lines with BOTH old routes AND new routes.
This causes EVERY route conflict we encountered.
The next agent should consider: is it time to refactor into separate routers?

PATTERN WE DISCOVERED (critical):
Old routers registered at startup INTERCEPT new endpoint paths.
We found this pattern 8+ times:
- /notifications/ → old notification router
- /reports/ → old reporting router
- /maintenance/schedule → old maintenance router
- /documents/upload → old documents router
- /vendors/{id} → old inventory vendors router
- /invoices/dashboard → old invoices router
Solution: always rename new endpoints with /v2/ or different prefix.
The next agent MUST check for conflicts before every new endpoint.

TWO DATABASES PROBLEM:
We spent 4+ hours debugging "relation does not exist" errors.
Root cause: Docker container (ai-postgres) and local PostgreSQL are separate.
Backend connects to LOCAL postgres. We kept running CREATE TABLE against Docker.
This is the #1 time waster in this project.
ALWAYS verify: PGPASSWORD=ai123 psql -h localhost -p 5432 ...

OLD SCHEMA VS NEW SCHEMA ASSUMPTIONS:
Every time we assumed a column name, we were wrong.
Examples we hit:
- Assumed "specialization" → actual: "specializations"
- Assumed "type" for assets → actual: "category"
- Assumed "name" for projects → actual: "title"
- Assumed "priority" for service_requests → actual: "urgency"
- Assumed "assigned_technician_id" → actual: "technician_id"
- Assumed "supplier_invoices" had payment_status → it didn't (added via ALTER)
- Assumed sites had site_type → it didn't
LESSON: ALWAYS run SELECT column_name FROM information_schema.columns first.

FASTAPI ROUTE ORDER IS CRITICAL:
GET /vendors/{vendor_id} registered BEFORE GET /vendors/
Result: /vendors/ treated as vendor_id="" returning 404/405
This happened with vendors, scope-of-work, invoices, maintenance.
RULE: List routes MUST come before detail routes.
RULE: Static paths (/dashboard) before parameterized (/{ }) at same level.

PYDANTIC V2 BROKE FILE UPLOAD:
Spent significant time debugging 422 errors on document upload.
Root cause: Pydantic v2 cannot parse Form() parameters in multipart.
Fix: Use Request.form() to read form data manually.
Also: "File" is INSIDE "UploadFile" string — not independently present.
Must import: from fastapi import File, UploadFile separately.

THE __FUTURE__ IMPORT DISASTER:
When we prepended "from pathlib import Path" to main.py,
it pushed "from __future__ import annotations" off line 1.
Python requires __future__ imports to be FIRST.
The fix: collect all __future__ lines, put first, remove duplicates.
We had to do this twice because the second fix introduced a Path duplicate.

EPOCH DATE BUG (31/12/1969):
NULL timestamps displayed as Unix epoch (Jan 1, 1970 in local time = Dec 31, 1969).
JavaScript new Date(null) = 1970-01-01 00:00:00 UTC = displayed as 1969 in EET.
Fix: if (!d || new Date(d).getFullYear() < 1990) return "—"
This affected work order dates, maintenance dates, invoice dates.

PDF TEST BUG:
Our test script called .json() on PDF binary response → JSONDecodeError.
PDF was actually working (verified 2-5KB sizes).
The PDF "failures" in audit were test script bugs, not actual failures.
Fix: Test PDFs with: 'pdf' in r.headers.get('content-type','')

DELETE RETURNS 204 NO CONTENT:
Old work_orders router returns 204 No Content (standard REST).
Our test called .json() → JSONDecodeError.
We thought delete was broken — it wasn't.
Fix: if r.status_code == 204: # success (never call .json() on 204)

NAVIGATION WAS COMPLETELY DISCONNECTED:
After building 16 sprints, the sidebar still had OLD links from sprints 1-244.
None of our new pages were accessible from the sidebar.
The nav.ts file was comprehensive but pointing to old/wrong paths.
Sprint 262 was entirely dedicated to connecting the navigation.
Lesson: Update nav.ts with EVERY new sprint, not at the end.

PARALLEL PAGE CONFLICTS:
Next.js routes: (app)/X and (app)/(enterprise)/X cannot both exist.
We hit this with /reports, /notifications, /approvals, /client-portal.
Fix: Remove (app)/X stub OR redirect it to (app)/(enterprise)/X.

USEMUTATION DUPLICATE IMPORT:
Our "add delete button" script replaced 'import { useQuery' with
'import { useQuery, useMutation' — but if useMutation was already there,
result: 'import { useQuery, useMutation, useMutation'
Turbopack rejects duplicate named exports.
Fix: Always deduplicate: list(dict.fromkeys(imports))

F-STRING BRACES IN HANDOFF:
The final handoff generation failed because triple-quoted f-strings
cannot contain bare { } characters used in code examples.
Fix: Use lines.append() list pattern instead of triple-quoted f-strings.
Lesson: never put code examples inside f-strings.

QWEN TIMEOUT PATTERNS:
- Simple analysis: 30-60 seconds
- Complex design: 60-120 seconds  
- Code generation: 2-3 minutes
- Full audit synthesis of 437 packs: TIMED OUT at 240s
Always use timeout=180, never less than 60.
Qwen 7b cannot process large contexts — keep prompts under 14KB.

QWEN FALSE POSITIVES:
When asked "did you find the File import?", Qwen said "YES APPROVED"
but it was detecting "File" inside "UploadFile" string.
Always verify Qwen's answers against actual code — don't trust blindly.

╔══════════════════════════════════════════════════════════════════════════════╗
║  PART 2: WHAT THE NEXT AGENT MUST BE CAREFUL ABOUT                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

DANGER ZONE 1: main.py SIZE
main.py is now ~6000+ lines.
Adding more endpoints will eventually cause:
- Startup slowness
- Harder debugging
- More route conflicts
RECOMMENDATION: After 3 more sprints, refactor into separate router files.
Pattern: from src.commercial.procurement.router import router as procurement_router

DANGER ZONE 2: ROUTE CONFLICT TIME BOMB
There are still duplicate route registrations:
- /api/v1/maintenance/pm-plans/{plan_id} registered TWICE (line 879 + line 2135)
- /api/v1/automation/run registered for both POST and GET
- /api/v1/goods-receipt-notes/ has both POST and GET (OK but confusing)
Before adding ANY endpoint, run this check:
  grep "@app\." src/main.py | grep "path" | sort | uniq -d

DANGER ZONE 3: DATABASE SCHEMA DRIFT
We have tables created at different times with different column names.
Some tables have columns added via ALTER TABLE.
Some columns differ between Docker db and local db.
Before any data work, ALWAYS run:
  SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
  SELECT column_name FROM information_schema.columns WHERE table_name='X';

DANGER ZONE 4: SEED DATA IDs
All our seed data uses fixed IDs (wo-001, tech-001, site-nile-plaza etc.).
These IDs are hardcoded throughout the codebase.
If you delete and re-seed, all references break.
NEVER delete seed data — only UPDATE or INSERT with ON CONFLICT DO NOTHING.

DANGER ZONE 5: TWIN HEALTH DROPPED
Twin was 100/100 at Sprint 247, then gradually dropped to 93/100.
Each new sprint adds complexity that the twin's heuristics penalize.
The twin measures code quality, not just features.
To raise it back: check /api/v1/twin/state for what's penalized.

DANGER ZONE 6: PORTAL BUILD TIME
As pages grew from 20 to 41+, build time went from 8s to 14s.
At 60+ pages it will approach 30s.
Consider: lazy loading, dynamic imports, route groups.

DANGER ZONE 7: NOTIFICATION FLOOD
We have 367+ notifications generated from live data.
Running /platform-notif/generate repeatedly creates duplicates.
Current check: only creates if not in last 24h for same title+entity.
But if data changes, old notifications become stale.
Add a cleanup endpoint: DELETE FROM notifications WHERE created_at < NOW()-INTERVAL '7 days'

DANGER ZONE 8: FILE UPLOAD STORAGE
Files stored at /uploads/{hotel_id}/{entity_type}/{entity_id}/
No size limit enforced at OS level (only 10MB per file check).
No cleanup mechanism for deleted entities.
In production, this will grow unbounded.
Recommend: Add file count + total size check per entity.

DANGER ZONE 9: JWT TOKENS ARE INSECURE
Current JWT secret: "tb-jwt-secret-2026" (hardcoded fallback)
No token rotation.
No refresh tokens.
No token blacklisting on logout.
Client/supplier portal tokens are separate from main portal.
In production, this is a critical security issue.

DANGER ZONE 10: SQL INJECTION RISK
Most endpoints use SQLAlchemy text() with :parameter binding — safe.
But some endpoints build WHERE clauses with string concatenation:
  f"WHERE {' AND '.join(where)}"
The 'where' list itself uses parameterized queries, so it's safe.
BUT: if anyone ever adds user input directly to 'where' without :param, it's injectable.
Always use :parameter style.

╔══════════════════════════════════════════════════════════════════════════════╗
║  PART 3: PRODUCTION READINESS ROADMAP                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

PHASE 1: STABILITY (2-3 weeks)
Goal: Make what exists reliable and secure

P1.1 SECURITY HARDENING (Critical)
  - Change JWT_SECRET to cryptographic random secret (not hardcoded)
    os.urandom(32).hex() -> store in .env
  - Add JWT token expiry validation
  - Add refresh token system
  - Rate limiting: pip install slowapi
    from slowapi import Limiter; @app.route limiter.limit("100/minute")
  - Input sanitization: validate all user inputs with Pydantic models
  - CORS: restrict to specific domain (not *)
  - Remove debug PIN "1234" — implement proper password hashing (bcrypt)
  - Add X-Content-Type-Options, X-Frame-Options headers
  - HTTPS only (nginx + Let's Encrypt)

P1.2 DATABASE HARDENING
  - Connection pooling: use create_engine with pool_size=10, max_overflow=20
  - Add proper constraints: FOREIGN KEY, CHECK, NOT NULL where missing
  - Add missing indexes for slow queries
  - Regular VACUUM ANALYZE
  - Point-in-time backup every 6 hours (pg_dump)
  - Separate read replica for reports

P1.3 CODE REFACTORING
  - Split main.py into router modules:
    src/routers/operations.py
    src/routers/procurement.py
    src/routers/financial.py
    src/routers/portals.py
    src/routers/reports.py
  - Add proper Pydantic models for request/response validation
  - Add error middleware for consistent error responses
  - Add request logging middleware (log every API call)
  - Fix all @ts-nocheck in frontend (or justify each one)

P1.4 ERROR HANDLING
  - Global exception handler in FastAPI
  - Frontend error boundaries on all pages
  - Proper 404/500 pages in Next.js
  - API error response format: {error: code, message: str, details: {...}}

PHASE 2: OBSERVABILITY (1-2 weeks)
Goal: Know what's happening in production

P2.1 LOGGING
  - Structured logging (JSON format) for all API calls
  - Log: timestamp, method, path, status, duration, user_id, hotel_id
  - Log to file + stdout
  - Consider: Datadog, Sentry, or self-hosted Grafana/Loki

P2.2 METRICS
  - API response time per endpoint
  - Database query time
  - Active users per hotel
  - Work order creation rate
  - Invoice processing rate

P2.3 HEALTH CHECKS
  - GET /health -> {status: ok, db: ok, redis: ok, version: x.y.z}
  - Database connectivity check
  - File storage accessibility check
  - Background job status

P2.4 ALERTING
  - Alert when API error rate > 5%
  - Alert when DB connections > 80% of pool
  - Alert when disk usage > 80%
  - Alert when SLA breach count increases

PHASE 3: INFRASTRUCTURE (2-3 weeks)
Goal: Deploy reliably and scale

P3.1 CONTAINERIZATION
  - Dockerfile for backend:
    FROM python:3.12-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install -r requirements.txt
    COPY src/ src/
    CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8030"]
  - Dockerfile for frontend:
    FROM node:20-alpine
    WORKDIR /app
    COPY package*.json .
    RUN npm ci
    COPY . .
    RUN npm run build
    CMD ["npm", "start"]
  - docker-compose.yml with all services:
    - backend (FastAPI)
    - frontend (Next.js)
    - postgres (PostgreSQL 15)
    - redis (for caching + sessions)
    - nginx (reverse proxy + SSL)

P3.2 ENVIRONMENT CONFIGURATION
  - .env.production with:
    DATABASE_URL=postgresql://user:pass@db:5432/triangle_black
    JWT_SECRET_KEY=[cryptographic random]
    PORTAL_URL=https://app.triangleblack.com
    ALLOWED_ORIGINS=https://app.triangleblack.com
    MAX_FILE_SIZE_MB=10
    UPLOAD_PATH=/data/uploads
  - Never commit .env files
  - Use secrets management (Docker secrets or HashiCorp Vault)

P3.3 REVERSE PROXY (Nginx)
  server {
    server_name app.triangleblack.com;
    location /api/ { proxy_pass http://backend:8030; }
    location / { proxy_pass http://frontend:3000; }
    ssl_certificate /etc/letsencrypt/live/...;
  }

P3.4 DATABASE MIGRATION
  - Current: all in main.py with CREATE TABLE IF NOT EXISTS
  - Production: Alembic migrations
  - pip install alembic
  - alembic init migrations
  - Each sprint = one migration file
  - Never ALTER TABLE in production without migration

P3.5 FILE STORAGE
  - Current: local disk (fails with horizontal scaling)
  - Production options:
    A. Single server: keep local disk with proper backup
    B. Multi-server: MinIO (self-hosted S3-compatible)
       pip install minio
    C. Cloud: AWS S3 or Azure Blob Storage
  - Update upload endpoint to use storage abstraction layer

PHASE 4: MULTI-TENANCY (1-2 weeks)
Goal: Support multiple companies

P4.1 TENANT ISOLATION
  - Current: all data under hotel_id='tb-default-hotel-000000000001'
  - Production: each company has unique hotel_id
  - Add tenant context to every API call (middleware reads JWT hotel_id)
  - Row-level security in PostgreSQL:
    ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
    CREATE POLICY tenant_isolation ON work_orders
    USING (hotel_id = current_setting('app.current_tenant'));

P4.2 ONBOARDING NEW COMPANY
  - Admin endpoint: POST /api/v1/admin/companies
  - Auto-create: hotel record, default user, default settings
  - Send welcome email with temp credentials
  - Provision upload directory
  - Run default seed data (demo WOs, demo assets)

P4.3 COMPANY ADMIN PORTAL
  - /admin/companies — list all companies
  - /admin/companies/{id}/users — manage users
  - /admin/companies/{id}/settings — subscription, limits
  - /admin/companies/{id}/data — export, backup, delete

PHASE 5: REAL USER MANAGEMENT (1 week)
Goal: Proper user accounts

P5.1 USER TABLE
  CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hotel_id VARCHAR REFERENCES hotels(id),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,  -- bcrypt
    name VARCHAR,
    role VARCHAR DEFAULT 'viewer',   -- admin, manager, engineer, viewer
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );

P5.2 ROLES & PERMISSIONS
  Current: everything accessible to everyone (no RBAC)
  Production:
  - admin: full access
  - manager: view all, create/edit, approve
  - engineer: create/edit WOs, log time, view
  - viewer: read-only
  Implementation: middleware checks JWT role against endpoint permission map

P5.3 PASSWORD MANAGEMENT
  - bcrypt password hashing (pip install bcrypt)
  - Password reset via email
  - Force password change on first login
  - Session management with refresh tokens
  - Audit log: who logged in when from where

PHASE 6: REAL DATA MIGRATION (1-2 weeks)
Goal: Replace demo data with real data

P6.1 DATA IMPORT TOOLS
  - Excel/CSV import for: assets, vendors, work orders history
  - API import: POST /api/v1/import/assets with CSV file
  - Validation before insert: check required fields, format dates
  - Dry-run mode: validate without inserting

P6.2 DATA QUALITY
  - Duplicate detection: flag similar vendor names, asset codes
  - Required field enforcement: enforce NOT NULL at DB level
  - Data enrichment: auto-populate from existing records

P6.3 HISTORICAL DATA
  - Import past work orders from Excel
  - Import asset maintenance history
  - Import vendor invoices from accounting system
  - Match historical data to new schema

P6.4 REMOVE DEMO DATA
  Script to cleanly remove all demo records:
  DELETE FROM work_orders WHERE id LIKE 'wo-%';
  DELETE FROM vendors WHERE vendor_code LIKE 'VND-%';
  etc.
  Run in transaction with rollback capability.

PHASE 7: PERFORMANCE OPTIMIZATION (1 week)
Goal: Handle real production load

P7.1 DATABASE
  - Connection pooling (already needed, pool_size=20)
  - Query optimization: EXPLAIN ANALYZE on slow queries
  - Add composite indexes for common filter combinations
  - Archive old data: move completed WOs > 1 year to archive table
  - Materialized views for dashboard queries

P7.2 API CACHING
  - Redis for: executive dashboard (60s TTL), report catalog (5min TTL)
  - pip install redis aioredis
  - Cache key: f"dashboard:{hotel_id}:{date}"

P7.3 FRONTEND
  - Code splitting: next/dynamic for heavy components
  - Image optimization: next/image for all images
  - Bundle analysis: ANALYZE=true npm run build
  - Service Worker for offline support (field technicians need it)

P7.4 FILE SERVING
  - Serve uploads through nginx, not FastAPI
  - Add CDN for PDF files (heavy bandwidth)
  - Compress PDFs: pip install pdfrw

╔══════════════════════════════════════════════════════════════════════════════╗
║  PART 4: HARDEST PROBLEMS WE SOLVED (LESSONS FOR NEXT AGENT)               ║
╚══════════════════════════════════════════════════════════════════════════════╝

HARDEST PROBLEM #1: Route Conflicts (8 occurrences)
Pattern: old router intercepts new endpoint path
Time spent: ~3 hours total
Root cause: main.py has 50+ old routers all at /api/v1/*
Solution that works: rename to /v2/ or /platform-xxx/ prefix
Better solution for next agent: audit all registered routes FIRST:
  python3 -c "
  import re; src=open('src/main.py').read()
  routes = re.findall(r'@app\.(get|post|patch|put|delete)\("([^"]+)"', src)
  for method, path in sorted(routes): print(f'{method.upper():7} {path}')
  " | sort

HARDEST PROBLEM #2: Wrong Database (multiple times)
Time spent: ~4 hours total
Every time: created tables in Docker, backend used local.
Solution: bookmark this command, always use it:
  PGPASSWORD=ai123 psql -h localhost -p 5432 -U ai -d triangle_black

HARDEST PROBLEM #3: Pydantic v2 + multipart (2 hours)
The entire document upload system failed for days.
422 errors with cryptic Pydantic validation messages.
Solution: Request.form() instead of Form() parameters.
This is a known Pydantic v2 breaking change. FastAPI docs don't mention it clearly.

HARDEST PROBLEM #4: FastAPI startup crash with no useful error (1 hour)
Backend started, served some requests, then crashed with no error.
Cause: duplicate route decoration (same function decorated twice)
Finding it: uvicorn --log-level debug shows startup route registration

HARDEST PROBLEM #5: Next.js Turbopack build errors
Turbopack is stricter than webpack.
Issues we hit:
- "two parallel pages resolve to same path" → remove duplicate
- "Export X doesn't exist in target module" → add missing export
- "Unterminated string constant" → newline in join("
") split across lines
- "Expected ';', '}', <eof>" → broken import (missing 'i' in 'import')
All build errors: node next build 2>&1 | tail -30

HARDEST PROBLEM #6: Python f-string with curly braces in code
When generating code documentation as f-strings,
any { } in the text breaks the f-string.
Solution: use lines.append() list approach for anything with code examples.
Or: use .format() with %% for literal braces.

HARDEST PROBLEM #7: Maintenance schedule showing 0 assets
The endpoint returned empty even though 51 assets had next_maintenance_date.
Cause: old maintenance_enterprise_router had /maintenance/schedule endpoint
registered BEFORE ours, intercepting all requests.
Fix: rename to /pm-schedule/assets
Discovery method: check logs — old route was returning empty dict {}
not 404, because old route matched but returned no results.

╔══════════════════════════════════════════════════════════════════════════════╗
║  PART 5: THE PATTERN LIBRARY (PROVEN SOLUTIONS)                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

PATTERN: Safe date display (prevents epoch 1969 bug)
  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
      return dt.toLocaleDateString("en-GB");
    } catch { return "—"; }
  };

PATTERN: Safe array from API response
  const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

PATTERN: Backend list endpoint with filters
  @app.get("/api/v1/items/", tags=["module"])
  def list_items(status: str = None, limit: int = 50):
      where, params = ["1=1"], {"l": limit}
      if status: where.append("i.status=:s"); params["s"] = status
      rows = db.execute(text(f"SELECT * FROM items WHERE {' AND '.join(where)} LIMIT :l"), params)

PATTERN: File upload endpoint (Pydantic v2 safe)
  @app.post("/api/v1/upload/", tags=["files"])
  async def upload(request: Request):
      form = await request.form()
      entity_type = str(form.get("entity_type") or "")
      file_obj = form.get("file")
      contents = await file_obj.read()

PATTERN: Delete endpoint with correct status
  @app.delete("/api/v1/items/v2/{item_id}", tags=["items"])
  def delete_item(item_id: str):
      db.execute(text("DELETE FROM items WHERE id=:id"), {"id": item_id})
      db.commit()
      return {"status": "deleted", "id": item_id}
  # Test: if r.status_code in [200, 204]: # success

PATTERN: Redirect stub page
  "use client";
  import { useEffect } from "react";
  import { useRouter } from "next/navigation";
  export default function Redirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/correct/path"); }, []);
    return null;
  }

PATTERN: Route conflict detection before building
  python3 -c "
  src = open('src/main.py').read()
  import re
  routes = re.findall(r'@app\.(get|post|patch|delete)\("([^"]+)"', src)
  for method, path in routes:
    if 'NEW_PATH' in path:
      print(f'{method} {path}')
  "

PATTERN: Qwen for architecture analysis
  prompt = f"""
  You are Principal Architect for Triangle Black MEP.
  EXISTING TABLES: {table_list}
  EXISTING ENDPOINTS: {endpoint_list}
  TASK: Design X system.
  OUTPUT: exactly 3 DB tables, 5 API endpoints. Be concise.
  """

PATTERN: Full platform health check
  # Quick health check — run before any new sprint
  tests = ["/api/v1/work-orders/?limit=1", "/api/v1/vendors/",
           "/api/v1/supplier-invoices/dashboard"]
  for url in tests:
      r = requests.get(f"http://localhost:8030{url}", headers=h)
      print(r.status_code, url)

╔══════════════════════════════════════════════════════════════════════════════╗
║  PART 6: WHAT THE NEXT AGENT SHOULD DO FIRST                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

DAY 1 CHECKLIST:
[ ] 1. Read AGENT_HANDOFF.md completely
[ ] 2. Read this BRAIN_DUMP.md completely
[ ] 3. Start backend and portal: verify both running
[ ] 4. Run full test: visit /workspace in browser — does it look complete?
[ ] 5. Run backend test: check 5 key endpoints return data
[ ] 6. Check main.py line count: wc -l src/main.py
[ ] 7. Check DB tables: psql ... -c "SELECT tablename FROM pg_tables WHERE schemaname='public'"
[ ] 8. Check twin health: GET /api/v1/twin/state

BEFORE ANY NEW SPRINT:
[ ] Audit routes: check for conflicts at new path
[ ] Check DB schema: column names for tables you'll use
[ ] Qwen analysis: design first, code second
[ ] Test existing features: don't break what works

FIRST CODE CHANGE:
Fix the 3 immediate issues:
1. UPDATE service_requests SET resolved_at=NOW()
   WHERE status='resolved' OR status='completed';
   (This fixes SLA scores from 0% to real values)

2. Add "Log Time" button to WO detail page:
   portal/app/(app)/(enterprise)/operations/work-orders/[id]/page.tsx
   Add: <button onClick={()=>router.push('/operations/time-tracking')}>⏱ Log Time</button>

3. Add notification cleanup endpoint:
   DELETE FROM notifications WHERE created_at < NOW()-INTERVAL '7 days'
   (Prevents 367+ notification accumulation)

╔══════════════════════════════════════════════════════════════════════════════╗
║  PART 7: PRODUCTION DEPLOYMENT CHECKLIST                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

SECURITY CHECKLIST:
[ ] JWT_SECRET_KEY changed from default (tb-jwt-secret-2026 is in repo!)
[ ] All passwords hashed with bcrypt (not plaintext PIN "1234")
[ ] CORS restricted to production domain
[ ] Rate limiting on all endpoints
[ ] File upload size limits enforced at nginx level
[ ] SQL injection audit: all parameters use :param style
[ ] XSS protection: Content-Security-Policy header in nginx
[ ] No hardcoded credentials in code (use environment variables)
[ ] .env files not committed to git
[ ] Dependencies audited: pip audit + npm audit

INFRASTRUCTURE CHECKLIST:
[ ] HTTPS/TLS certificate (Let's Encrypt)
[ ] Database backups automated (every 6 hours)
[ ] File storage backed up
[ ] Monitoring/alerting configured
[ ] Log aggregation set up
[ ] Health check endpoint working
[ ] Graceful shutdown handling in FastAPI
[ ] Database migrations versioned with Alembic
[ ] Redis configured for caching

DATA CHECKLIST:
[ ] Demo seed data removed (or marked as demo)
[ ] Real asset data imported
[ ] Real vendor data imported
[ ] SLA targets configured per client contract
[ ] User accounts created with proper roles
[ ] Client portal accounts set up for each hotel
[ ] Supplier portal accounts set up for each vendor

PERFORMANCE CHECKLIST:
[ ] Database connection pooling configured
[ ] Slow query log enabled in PostgreSQL
[ ] CDN configured for static assets
[ ] Next.js production build (not dev mode)
[ ] uvicorn workers = 2-4 (not 1)
[ ] nginx worker_processes = auto

TESTING CHECKLIST:
[ ] All 41 portal pages return 200
[ ] All 70+ API endpoints tested
[ ] File upload works end-to-end
[ ] PDF generation works for all 5 types
[ ] Client portal login and all 5 pages work
[ ] Supplier portal login and all 5 pages work
[ ] QR code scan page works on mobile
[ ] Mobile bottom nav works on phone
[ ] SLA dashboard shows real data

================================================================================
FINAL NOTES TO NEXT AGENT:

This platform was built in a single conversation with one human.
We made mistakes, found workarounds, and kept moving forward.
The codebase reflects that — pragmatic, not perfect.

The best thing you can do for this platform:
1. Don't break what works (verify before and after every change)
2. Fix technical debt incrementally (don't big-bang rewrite)
3. Use Qwen for architecture decisions (it's surprisingly good)
4. Always check route conflicts before adding endpoints
5. Always check column names before writing SQL

The vision is real: a world-class MEP platform for Egyptian hospitality.
The foundation is solid. Now make it production-ready.

Good luck.
================================================================================
