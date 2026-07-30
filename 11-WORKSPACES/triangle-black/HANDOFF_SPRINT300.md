
# TRIANGLE BLACK — COMPLETE AGENT HANDOFF
# Sprint 300 Final State — 30/07/2026 08:11
# READ THIS COMPLETELY BEFORE WRITING ANY CODE

================================================================================
## 1. PLATFORM IDENTITY
================================================================================
Company:    Triangle Black Engineering Services
Type:       Enterprise MEP Operations Platform (SaaS-ready)
Market:     Egyptian hotel engineering companies (B2B)
Vision:     AI-native enterprise platform — configurable per industry
Location:   /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/
Repository: github.com/amrtwap2017-bit/AI-COMPANY-OS (main branch)
Sprint:     300 (delivered 20 sprints in last 2 sessions: 245-300)

================================================================================
## 2. TECHNOLOGY STACK
================================================================================

BACKEND:
  Runtime:    Python 3.12 + FastAPI
  File:       src/main.py (~7200+ lines — APPEND ONLY, never rewrite)
  Database:   PostgreSQL 15 — LOCAL port 5432 (NOT Docker!)
  Auth:       src/commercial/auth/ — bcrypt + JWT (TB_SECRET_KEY in .env)
  Port:       8030
  Start:      cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
              export $(grep -v '^#' .env | grep -v '^$' | xargs)
              nohup .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 --log-level warning > /tmp/tb_backend_manual.log 2>&1 &

FRONTEND:
  Runtime:    Next.js 16 App Router + Turbopack
  Directory:  portal/
  Design:     TBDL 1.0 — Warm light workspace + Obsidian sidebar
  Font:       Plus Jakarta Sans
  Accent:     Champagne Bronze #B9924C
  Port:       3000
  Start:      cd portal && nohup node node_modules/.bin/next start --port 3000 > /tmp/tb_portal.log 2>&1 &
  Build:      cd portal && rm -rf .next && node node_modules/.bin/next build

DATABASE (CRITICAL):
  Backend uses LOCAL postgres port 5432
  Docker ai-postgres is SEPARATE — tables must be in LOCAL
  Local:   PGPASSWORD=ai123 psql -h localhost -p 5432 -U ai -d triangle_black
  Docker:  docker exec ai-postgres psql -U ai -d triangle_black (DIFFERENT!)

AI ASSISTANT:
  Model:   qwen2.5-coder:7b
  URL:     http://localhost:11434/api/generate
  Timeout: 180 seconds minimum
  Pattern: requests.post(url, json={model,prompt,stream:False,options:{num_predict,temperature:0.0}})

================================================================================
## 3. LIVE PLATFORM STATS (Sprint 300 state)
================================================================================
Twin Health Score: 89/100
Work Orders:       172 total
Time Entries:      150.5h logged · EGP 26,475 labor cost
Portal Pages:      200+ (109 real, 27 interactive, 74 stubs)
DB Tables:         27+
API Endpoints:     80+
Sprints Delivered: 245-300 (55 sprints across 3 sessions)

================================================================================
## 4. DESIGN SYSTEM — TBDL 1.0
================================================================================
Philosophy: "Luxury Engineering. Quiet Confidence. Operational Excellence."
Theme:      Warm light workspace — NOT dark (sidebar only is dark)

COLORS:
  Body bg:      #FAF8F5  (warm cream)
  Card bg:      #FFFFFF  (clean white)
  Surface alt:  #F3EFE8  (warm ivory)
  Brand accent: #B9924C  (champagne bronze)
  Brand hover:  #A88446
  Sidebar:      #0F0D0B  (obsidian black)
  Topbar:       #D9C3A9  (sandy warm)
  Hero bg:      linear-gradient(140deg, #E8DDD0 0%, #D9C3A9 50%, #C4A98A 100%)
  Text-1:       #221D1A  (dark warm on light)
  Text-2:       #6D5F53  (warm stone)
  Text-3:       #B29F8B  (light stone)
  Success:      #547C4D  (olive — NOT neon green)
  Warning:      #B07A2A  (warm amber)
  Danger:       #A84A3D  (deep terracotta)
  Info:         #5B7C8C  (muted bronze-blue)

CSS CLASSES (globals.css — use these, never hardcode):
  .tb-hero .tb-hero-inner     Full-width sandy gradient header
  .tb-hero-title              Dark warm text on sandy hero
  .tb-hero-kpi                KPI card in hero (clickable)
  .tb-canvas                  Content area
  .tb-section                 White card with warm border
  .tb-table .tb-table-row     Data table
  .tb-badge                   Status pill
  .tb-pill .tb-pill--active   Filter tab
  .tb-empty                   Empty state
  var(--color-*)              Always use CSS vars for colors

IMPORTANT: Hero sections use inline sandy gradient (not dark)
NEVER add: purple, neon, blue, crypto-style gradients

================================================================================
## 5. ARCHITECTURE — KEY FILES
================================================================================
src/main.py                   Backend monolith (~7200L) — APPEND ONLY
src/core/auth.py              JWT + bcrypt — DO NOT MODIFY
src/core/database.py          DB engine with pool_size=5
lib/role-navigation.ts        Role-aware sidebar config
lib/toast.ts                  Sonner toast wrapper
lib/platform-config.ts        SaaS configuration engine
components/workspace/
  EnterpriseSidebar.tsx        Role-aware sidebar (role-navigation.ts)
  EnterpriseTopbar.tsx         Sandy topbar with user dropdown
  nav.ts                       Complete sitemap (190 pages)
app/(app)/(enterprise)/        All enterprise pages
app/login/page.tsx             Dark TBDL login (inline styles)
app/globals.css                1100L design system CSS

KEY FUNCTIONS IN main.py:
  _audit(db, entity_type, entity_id, action, request, old_value, new_value)
  _notify(db, title, message, notif_type, entity_type, entity_id)
  _verify_inline_token(request)  — lightweight auth for inline endpoints
  _get_user_role_from_token(request) — extract role from JWT

================================================================================
## 6. NAVIGATION SYSTEM
================================================================================
File:      portal/components/workspace/nav.ts
Groups:    Platform | Operations | Supply Chain | Intelligence | Platform Admin
Role nav:  lib/role-navigation.ts — PRIMARY_BY_ROLE controls sidebar per role
All pages: /workspace/all-modules — searchable full sitemap

ROLE VISIBILITY:
  admin:    all 13 centers (full access)
  manager:  workspace, executive, operations, projects-center, supply-chain, analytics, financial, portals
  engineer: workspace, operations, engineering, maintenance, projects-center
  finance:  workspace, financial, commercial, analytics, supply-chain
  viewer:   workspace, executive, analytics, reports, maintenance, portals

SIDEBAR FEATURES (Sprint 297):
  - Start Here: 3 pinned shortcuts per role
  - Recent Pages: last 5 visited (localStorage)
  - All Modules button: always visible at bottom
  - Role label shows under TB logo

================================================================================
## 7. DATABASE SCHEMA (25+ tables in LOCAL postgres)
================================================================================

OPERATIONS:
  work_orders         — 169 WOs, key cols: id, title, status, priority, technician_id, site_id
  service_requests    — 42 SRs, key cols: id, title, category, urgency, submitted_by, resolved_at
  technicians         — 31 techs, key cols: id, name, specializations(json!), is_active
  assets              — 54 assets, key cols: id, name, category, status, site_id
  sites               — 5 hotel sites
  time_entries        — 40 entries, key cols: id, work_order_id, technician_id, hours_logged, labor_cost, start_time(NOT NULL)

PROCUREMENT:
  scope_of_work       — 5 SOWs linked to hotel clients
  rfq_headers         — 5 RFQs linked to SOWs
  vendor_quotations   — 10 bids with scores
  purchase_orders_v2  — 4 POs linked to vendors
  po_line_items       — 14 line items
  goods_receipt_notes — 3 GRNs received
  grn_items           — 8 items with quantities
  approval_requests   — 4 pending approvals
  vendors             — 10 vendors (9 approved)

FINANCIAL:
  supplier_invoices   — 10 invoices (5 paid, 2 submitted, 2 matching)
  invoice_line_items
  invoice_payments

PLATFORM:
  users               — 10 users (bcrypt hashed)
  platform_users      — 1 (redundant, not used for auth)
  notifications       — 9 remaining (auto-generate on events)
  platform_audit_log  — 26+ events (auto-records on mutations)
  contracts           — 4 real hotel contracts
  projects            — 15 projects
  entity_documents    — file attachments
  client_accounts     — 4 hotel GM logins
  supplier_accounts   — 4 vendor logins

SCHEMA GOTCHAS (ALWAYS CHECK BEFORE QUERYING):
  technicians.specializations  → json type, cannot GROUP BY directly, use ::text cast
  time_entries.start_time      → NOT NULL, always provide
  service_requests.urgency     → NOT priority
  service_requests.submitted_by → NOT requested_by
  assets.category              → NOT type
  projects.title               → NOT name
  work_orders.technician_id    → NOT assigned_technician_id

================================================================================
## 8. SEED DATA IDs (NEVER DELETE THESE)
================================================================================
Sites:    site-nile-plaza, site-cairo-festival, site-four-seasons, site-hilton-cairo, Marriott Sharm
Vendors:  v-elec-001, v-hvac-001, v-plmb-001, v-fire-001, v-civil-001, v-gen-001..003, v-it-001, v-elev-001
SOWs:     sow-demo-001 to sow-demo-005
RFQs:     rfq-demo-001 to rfq-demo-005
POs:      po-demo-001 to po-demo-004
GRNs:     grn-demo-001 to grn-demo-003
Invoices: inv-demo-001 to inv-demo-005
Techs:    tech-001 (Ahmed/HVAC) tech-002 (Mohamed/Elec) tech-003 (Khaled/Plumbing) tech-004 (Tarek/Fire) tech-005 (Omar/Civil) tech-006 (Youssef/HVAC) + t1..t20 (numeric IDs)
WOs:      wo-001 to wo-014 (fixed IDs), 155+ auto-generated UUIDs
Users:    amr@triangleblack.com/admin123 (admin), manager@triangleblack.com, engineer@triangleblack.com, finance@triangleblack.com

================================================================================
## 9. WORKING INTERACTIVE PAGES (23 pages with create/edit/delete)
================================================================================
  /operations/work-orders           — inline status update + create form
  /operations/work-orders/new       — full WO create with validation + toast
  /operations/work-orders/[id]      — detail + delete + assign + status update
  /operations/service-requests      — + New SR modal with validation
  /operations/service-requests/[id] — detail + status update
  /operations/time-tracking         — log hours + summary
  /operations/dispatch              — kanban with assign
  /supply-chain/scope-of-work       — + New SOW modal
  /supply-chain/vendor-management   — + New Vendor modal
  /supply-chain/rfq-management      — + New RFQ modal
  /supply-chain/purchase-orders-v2/[id] — line items + status
  /supply-chain/scope-of-work/[id]  — approve/reject
  /supply-chain/invoices/[id]       — approve + pay
  /supply-chain/approvals-center    — approve inline
  /commercial/invoices/[id]         — approve + pay
  /commercial/contracts/[id]        — activate + renew
  /approvals                        — approve inline
  /settings/users                   — role editor
  /settings/profile                 — password change + logout
  /workspace/my-day                 — pending approvals + SLA breaches
  /projects-center                  — + New Project modal
  /administration/audit             — full audit trail with filters
  /workspace/all-modules            — searchable full sitemap

================================================================================
## 10. E2E WORKFLOW — VERIFIED 7/7 (Sprint 299)
================================================================================
Step 1: SR Create    POST /api/v1/service-requests/          → 201
Step 2: WO Create    POST /api/v1/work-orders/               → 201
Step 3: WO Assign    PATCH /api/v1/work-orders/{id}/assign  → 200
Step 4: WO Status    PATCH /api/v1/work-orders/{id}/status  → 200
Step 5: Time Log     POST /api/v1/time-entries/              → 200
Step 6: WO Complete  PATCH /api/v1/work-orders/{id}/status  → 200
Step 7: Invoice Pay  POST /api/v1/supplier-invoices/{id}/pay → 200

================================================================================
## 11. CRITICAL ROUTE CONFLICT MAP (ALWAYS CHECK BEFORE NEW ENDPOINTS)
================================================================================
FastAPI: FIRST MATCH WINS
Old routers intercept paths — always check before adding new endpoints:

  python3 -c "import re; src=open('src/main.py').read(); [print(m.group()) for m in re.finditer(r'@app\.(get|post|patch|delete)\("[^"]+"', src)]" | grep NEW_PATH

Known conflicts:
  /api/v1/notifications/           → use /api/v1/platform-notif/
  /api/v1/reports/{type}          → use /api/v1/report-engine/{type}
  /api/v1/maintenance/schedule     → use /api/v1/pm-schedule/assets
  /api/v1/invoices/dashboard       → use /api/v1/supplier-invoices/dashboard
  /api/v1/documents/upload         → use /api/v1/documents/v2/upload
  Detail before List: /{<built-in function id>} registered before / causes 404 on list

================================================================================
## 12. COMMON ERRORS & EXACT FIXES
================================================================================
"relation X does not exist"     → Table in Docker not local. Run against port 5432
"column X does not exist"       → Check information_schema.columns first
"422 Unprocessable"             → Wrong field names. Check actual column names
"could not GROUP BY json"       → Cast: t.specializations::text in GROUP BY
"start_time NOT NULL"           → Always provide start_time in time_entries
"Router intercepts 404"         → Add /v2/ prefix or check route order
"build failed duplicate export" → Remove duplicate useMutation import
"SLA compliance 0%"             → service_requests need resolved_at — UPDATE SET resolved_at=updated_at WHERE status='resolved'
JSX injection breaks build      → Never use string replace to inject into middle of JSX — write complete file

================================================================================
## 13. KNOWN REMAINING GAPS (next sprints)
================================================================================

CRITICAL (blocks users daily):
  A. _notify() not wired to SR create (pattern changed from original)
     Find: grep -n "return.*sr_id.*status.*open" src/main.py
     Fix: Add _notify() call before return on line ~1523

  B. 94 display-only pages still have NO action buttons
     Priority: commercial/leads, operations/sites, supply-chain/purchase-orders-v2

  C. New PO create form — /supply-chain/purchase-orders-v2 has no + New PO button

  D. Technician detail page /operations/technicians/[id] shows "not found" for many IDs
     Cause: API returns 200 but detail page queries wrong endpoint

HIGH VALUE:
  E. RFQ detail /supply-chain/rfq-management/[id] — bid comparison page needs award button
  F. GRN create /supply-chain/goods-receipts/new — form works but needs better UX
  G. SOW → create RFQ flow — no direct button from SOW detail to create linked RFQ
  H. Email notifications (SMTP) — _notify() exists but no SMTP configured

MEDIUM:
  I. Sidebar "Platform Admin" group shows for manager/finance — should be admin only
  J. Mobile bottom nav still has 5 fixed items — should be role-aware like sidebar
  K. Work order detail needs "Convert to PM Plan" button for preventive WOs
  L. Analytics/costs page needs date range filter (currently shows all time)

================================================================================
## 14. MANDATORY AGENT WORKFLOW
================================================================================
BEFORE ANY CODE:
  1. Read this file completely
  2. Verify backend is running: curl -s http://localhost:8030/api/v1/health
  3. Check DB schema: PGPASSWORD=ai123 psql -h localhost -p 5432 -U ai -d triangle_black -c "SELECT column_name FROM information_schema.columns WHERE table_name='X';"
  4. Check route conflicts: grep -n "@app\." src/main.py | grep "NEW_PATH"
  5. Use Qwen for architecture decisions BEFORE writing code

BACKEND CHANGES:
  - ALWAYS append to src/main.py — NEVER rewrite
  - Check: if "SPRINT_X" not in src before appending
  - Syntax check: .venv/bin/python3 -m py_compile src/main.py
  - Tables: PGPASSWORD=ai123 psql -h localhost -p 5432 -U ai -d triangle_black

FRONTEND CHANGES:
  - Build: cd portal && rm -rf .next && node node_modules/.bin/next build
  - NEVER use string.replace to inject JSX into middle of existing JSX
  - Write complete new file when making significant changes
  - Always rebuild after changes: rm -rf .next && next build

PORTAL PAGE PATTERN (TBDL standard):
  hero section:     className="tb-hero" → .tb-hero-inner → .tb-hero-title + .tb-hero-description
  hero KPIs:        .tb-hero-kpi (clickable with onClick)
  content:          maxWidth:1400, margin:"0 auto", padding:"32px"
  cards:            background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:14
  buttons (primary): background:"linear-gradient(135deg,#8F6F3D,#B9924C)", color:"#181614"
  toast on success:  toast.success("message")
  toast on error:    toast.error("message")

================================================================================
## 15. CREDENTIALS
================================================================================
Main portal:      amr@triangleblack.com / admin123 (admin)
                  manager@triangleblack.com (manager)
                  engineer@triangleblack.com (agent)
                  finance@triangleblack.com (manager)
Client portals:   ahmed.fouad@nileplaza.com / PIN 1234
                  sara.hassan@cairofestival.com / PIN 1234
                  mona.kamal@fourseasons.com / PIN 1234
                  rania.ibrahim@hilton.com / PIN 1234
Supplier portals: info@arctic-hvac.com / PIN 1234
                  ahmed@delta-elec.com / PIN 1234
                  khaled@blueline.com / PIN 1234
                  nadia@fireshield.com / PIN 1234

================================================================================
## 16. STARTUP SEQUENCE (MANDATORY ORDER)
================================================================================
Step 1 — Kill old processes:
  pkill -f "uvicorn src.main:app" 2>/dev/null; fuser -k 8030/tcp 2>/dev/null; fuser -k 3000/tcp 2>/dev/null; sleep 3

Step 2 — Start backend (MUST export .env first):
  cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
  nohup .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 --log-level warning > /tmp/tb_backend_manual.log 2>&1 &
  sleep 10

Step 3 — Start portal:
  cd portal && nohup node node_modules/.bin/next start --port 3000 > /tmp/tb_portal.log 2>&1 &
  sleep 8

Step 4 — Verify:
  curl -s http://localhost:8030/api/v1/health; echo

================================================================================
## 17. SPRINT HISTORY SUMMARY (245-300)
================================================================================
245-247: P2P Procurement — SOW/BOQ/RFQ/PO/GRN schema + 12 tables
248:     Document Attachments (entity_documents)
249:     Invoice 3-Way Matching + Payment Recording
250:     Bug Fixes — auth, epoch dates
251:     Master Seed — 15 WOs, 8 SRs, 6 techs, 8 assets, 4 sites
252:     Executive Dashboard + Delete buttons
253:     Universal Report Engine — 12 types
254:     PDF Export — PO, Invoice, SOW, WO
255:     Mobile Layout
256:     Dispatch Kanban + Notification System
257:     Financial P&L Dashboard
258:     Customer Portal (4 hotel clients)
259:     Supplier Portal (4 vendors)
260:     Preventive Maintenance Scheduler
261:     Asset QR Code System
262:     Navigation Rebuild
263:     Workspace Dashboard + Breadcrumb
264-265: SLA Dashboard + Time Tracking
266:     SLA data fix, vendor seed, notification cleanup
267:     JWT secret secured, health endpoint, user management API
268:     .env loader, contracts page, users page, start.sh
269:     Fix startup warnings, legacy routers disabled
270:     Complete sidebar — 200+ pages
271:     P2P ecosystem seed — full workflow integrated
272:     Analytics wired to real endpoints
273:     Labor cost COALESCE fix
274:     Technician productivity — json GROUP BY fix
275:     All 31 technicians in dropdown
276:     Executive dashboard enrichment — SLA+labor+procurement
277-278: My Day command center + sidebar link
279-280: Audit trail (page + auto-recording on 10 endpoints)
281:     Data export — 8 CSV endpoints + download buttons
282-283: TBDL 1.0 — Desert Premium identity, login redesign
284-285: Warm light workspace, sidebar premium fix
286:     Sidebar accordion navigates, WO delete 401 fix
287:     Profile page, contract detail, approvals center
288:     Invoices, alerts, platform admin, payment history
289:     Premium topbar with role-aware dropdown
290-291: Global warm color sweep — zero dark pages
292:     Toaster wired, toast on mutations
293:     Analytics charts with warm TBDL colors
294:     9 stub pages filled with real content
295:     Role-aware workspace — personalized per role
296:     WO form validation + inline status dropdown
297:     Role-aware sidebar + All Modules sitemap + Recent Pages
298:     New SR modal, New Vendor modal, auto-notification helper
299:     New SOW modal, New Project modal, 7/7 E2E verified
300:     _notify wired to WO create, New RFQ modal, technician quick actions

================================================================================
## 18. QWEN ANALYSIS TASK (run this at session start)
================================================================================
See next section — comprehensive Qwen prompt for gap analysis.

================================================================================
END OF HANDOFF — Sprint 300 Final State
Twin: 89/100 | WOs: 172 | Hours: 150.5h | EGP 26,475
================================================================================
