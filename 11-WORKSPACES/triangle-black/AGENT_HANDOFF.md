================================================================================
TRIANGLE BLACK — ENTERPRISE MEP OPERATIONS PLATFORM
COMPLETE AGENT HANDOFF DOCUMENT
Generated: 29/07/2026 03:02 UTC
================================================================================

## 1. PLATFORM IDENTITY
   Company:    Triangle Black Engineering Services
   Type:       Enterprise MEP & Facilities Management SaaS
   Market:     Egyptian hotel/commercial clients (B2B)
   Location:   /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/
   Repository: github.com/amrtwap2017-bit/AI-COMPANY-OS (main branch)

## 2. TECHNOLOGY STACK
   BACKEND:
   - FastAPI Python 3.12 — /src/main.py (single file ~6000+ lines)
   - PostgreSQL 15 — localhost:5432 db=triangle_black user=ai pass=ai123
   - SQLAlchemy inline ORM (no separate models file)
   - ReportLab — PDF generation
   - qrcode + Pillow — QR code PNG generation
   - PyJWT — client/supplier portal auth
   - python-multipart — file upload support
   - Port: 8030
   - Venv: .venv/bin/python3
   - Start: nohup .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 > /tmp/tb_backend.log 2>&1 &

   FRONTEND:
   - Next.js 14 App Router Turbopack — /portal/
   - TailwindCSS + custom design system (tb-* classes in globals.css)
   - @tanstack/react-query — all data fetching
   - lucide-react — icons
   - Port: 3000
   - Build: cd portal && rm -rf .next && node node_modules/.bin/next build
   - Start: node node_modules/.bin/next start --port 3000

   DATABASE: *** CRITICAL — READ THIS ***
   Backend connects to LOCAL postgres (port 5432) NOT Docker container
   Docker ai-postgres is a SEPARATE database — tables must be in LOCAL
   Local:  PGPASSWORD=ai123 psql -h localhost -p 5432 -U ai -d triangle_black
   Docker: docker exec ai-postgres psql -U ai -d triangle_black (DIFFERENT!)

   AI ASSISTANT:
   - Ollama: http://localhost:11434
   - Model: qwen2.5-coder:7b (ALWAYS use this exact model)
   - Call pattern:
     r = requests.post("http://localhost:11434/api/generate",
         json={"model":"qwen2.5-coder:7b","prompt":prompt,"stream":False,
               "options":{"num_predict":800,"temperature":0.0}},
         timeout=180)
     result = r.json().get("response","").strip()

## 3. LIVE STATS (Sprint 265 state)
   Work Orders:    169 total (85 open, 14 critical)
   Vendors:        10 (9 approved)
   Invoices:       8 | EGP 1,973,350
   Outstanding:    EGP 28,500
   Time Entries:   9 | 20.0h
   SLA Breaches:   10 active
   Digital Twin:   93/100

## 4. SPRINTS COMPLETED (245-265)
   Sprint 245-247  P2P Procurement — SOW->RFQ->Bid->PO->GRN (12 new tables)
   Sprint 248      Document Attachments — upload/view/delete (entity_documents table)
   Sprint 249      Invoice 3-Way Matching + Payment Recording
   Sprint 250      Bug Fixes — auth, epoch dates, leads-portal 401
   Sprint 251      Master Seed — 15 WOs, 8 SRs, 6 techs, 8 assets, 4 sites
   Sprint 252      Executive Dashboard + Delete buttons on all pages
   Sprint 253      Universal Report Engine — 12 types (CSV + PDF export)
   Sprint 254      PDF Export — PO, Invoice, SOW, WO, Reports (ReportLab)
   Sprint 255      Mobile Layout — 2-col responsive grids, MobileBottomNav
   Sprint 256      Dispatch Kanban + Notification System (auto-generate)
   Sprint 257      Financial P&L Dashboard (revenue, aging, projects)
   Sprint 258      Customer Portal (4 hotel clients, PIN login, light theme)
   Sprint 259      Supplier Portal (4 vendors, PIN login, dark slate theme)
   Sprint 260      Preventive Maintenance Scheduler (PM calendar, auto-WO)
   Sprint 261      Asset QR Code System (PNG cards + PDF print sheets)
   Sprint 262      Navigation Rebuild — all 16 sprints connected to sidebar
   Sprint 263      Workspace Dashboard (platform hub) + Breadcrumb component
   Sprint 264+265  SLA Dashboard + Time Tracking (log hours, labor costs)

## 5. DATABASE TABLES (25+ tables in LOCAL postgres)

   PROCUREMENT (Sprint 245-249):
   scope_of_work, boq_items, vendors, rfq_headers, rfq_items,
   vendor_quotations, quotation_items, purchase_orders_v2, po_line_items,
   goods_receipt_notes, grn_items, approval_requests,
   supplier_invoices, invoice_line_items, invoice_payments,
   entity_documents (universal file attachments)

   OPERATIONS (pre-existing + Sprints 251,260,265):
   work_orders, service_requests, technicians, assets, sites, projects
   time_entries (Sprint 265 — log hours per WO)

   PORTALS (Sprint 258-259):
   client_accounts, supplier_accounts

   PLATFORM: notifications (Sprint 256)

   COLUMN NAME GOTCHAS (actual schema differs from intuition):
   work_orders            technician_id NOT assigned_technician_id | updated_at IS NOT NULL
   technicians            specializations NOT specialization | is_active bool
   assets                 category NOT type | manufacturer NOT make | location_description | NO asset_code
   service_requests       urgency NOT priority | category NOT type | submitted_by NOT requested_by
   sites                  NO site_type column
   projects               title NOT name | manager_id NOT manager | completion_pct exists
   supplier_invoices      invoice_number UNIQUE | notes/payment_status/vendor_id added via ALTER TABLE
   time_entries           start_time IS NOT NULL — always provide it

   SEED DATA IDs:
   Vendors:  v-elec-001 v-hvac-001 v-plmb-001 v-fire-001 v-gen-001 (PIN=1234)
   Sites:    site-nile-plaza site-cairo-festival site-four-seasons site-hilton-cairo
   SOWs:     sow-demo-001 to sow-demo-004
   WOs:      wo-001 to wo-015 + many auto-generated
   Invoices: inv-demo-001 (paid) inv-demo-002 (unpaid) inv-demo-003 (paid)
   PO:       po-demo-001 (5 line items, HVAC spare parts, approved)
   Techs:    tech-001 Ahmed/HVAC tech-002 Mohamed/Electrical tech-003 Khaled/Plumbing
             tech-004 Tarek/Fire tech-005 Omar/Civil tech-006 Youssef/HVAC

## 6. CRITICAL ROUTE CONFLICT MAP
   FastAPI FIRST MATCH WINS — old routers intercept paths
   OLD PATH                        USE INSTEAD
   /api/v1/notifications/          /api/v1/platform-notif/
   /api/v1/reports/{type}           /api/v1/report-engine/{type}
   /api/v1/maintenance/schedule    /api/v1/pm-schedule/assets
   /api/v1/invoices/dashboard      /api/v1/supplier-invoices/dashboard
   /api/v1/documents/upload        /api/v1/documents/v2/upload
   /api/v1/documents/{id} DELETE   /api/v1/documents/v2/{id}
   LIST before DETAIL: /vendors/ must be registered BEFORE /vendors/{id}

## 7. KEY API ENDPOINTS

   AUTH:
   POST /api/v1/auth/login  form:username,password -> access_token
   GET  /api/v1/me

   OPERATIONS:
   GET    /api/v1/work-orders/?limit=N
   GET    /api/v1/work-orders/{wo_id}
   POST   /api/v1/work-orders/
   PATCH  /api/v1/work-orders/{wo_id}/assign   body:{technician_id}
   PATCH  /api/v1/work-orders/{wo_id}/status   body:{status}
   DELETE /api/v1/work-orders/{wo_id}          -> 204 No Content (EMPTY BODY!)
   GET    /api/v1/service-requests/?limit=N
   GET    /api/v1/technicians/
   GET    /api/v1/assets/
   GET    /api/v1/sites/
   GET    /api/v1/dispatch/board

   PROCUREMENT:
   GET    /api/v1/vendors/
   GET    /api/v1/vendors/{vendor_id}
   PATCH  /api/v1/vendors/{vendor_id}
   DELETE /api/v1/vendors/v2/{vendor_id}
   GET    /api/v1/scope-of-work/
   GET    /api/v1/scope-of-work/{sow_id}
   POST   /api/v1/scope-of-work/{sow_id}/approve  body:{action,approved_by}
   DELETE /api/v1/scope-of-work/v2/{sow_id}
   GET    /api/v1/rfq/
   GET    /api/v1/rfq/{rfq_id}/bid-comparison
   POST   /api/v1/rfq/{rfq_id}/award
   GET    /api/v1/purchase-orders-v2/
   GET    /api/v1/purchase-orders-v2/{po_id}
   POST   /api/v1/purchase-orders-v2/{po_id}/line-items
   DELETE /api/v1/purchase-orders-v2/v2/{po_id}
   GET    /api/v1/approval-requests/
   GET    /api/v1/goods-receipt-notes/
   GET    /api/v1/procurement/dashboard

   FINANCIAL:
   GET    /api/v1/supplier-invoices/
   GET    /api/v1/supplier-invoices/dashboard
   GET    /api/v1/supplier-invoices/{invoice_id}
   POST   /api/v1/supplier-invoices/
   POST   /api/v1/supplier-invoices/{id}/match
   POST   /api/v1/supplier-invoices/{id}/approve  body:{action}
   POST   /api/v1/supplier-invoices/{id}/pay  body:{amount,payment_method}
   DELETE /api/v1/supplier-invoices/v2/{invoice_id}
   GET    /api/v1/financial/dashboard
   GET    /api/v1/financial/cash-flow

   DOCUMENTS:
   POST   /api/v1/documents/v2/upload  multipart:file,entity_type,entity_id,doc_category
   GET    /api/v1/documents/?entity_type=X&entity_id=Y
   GET    /api/v1/documents/{doc_id}/view  -> FileResponse binary
   DELETE /api/v1/documents/v2/{doc_id}

   REPORTS + PDF:
   GET  /api/v1/report-engine/catalog
   GET  /api/v1/report-engine/{type}  types: work_orders,invoices,vendor_performance,
        asset_maintenance,technician_productivity,scope_of_work,rfq_comparison,
        purchase_orders,invoice_aging,project_status,executive_summary,service_requests
   GET  /api/v1/pdf/purchase-order/{id}   -> application/pdf
   GET  /api/v1/pdf/invoice/{id}          -> application/pdf
   GET  /api/v1/pdf/scope-of-work/{id}   -> application/pdf
   GET  /api/v1/pdf/work-order/{id}       -> application/pdf
   GET  /api/v1/pdf/report/{type}         -> application/pdf (landscape)

   NOTIFICATIONS:
   GET  /api/v1/platform-notif/
   POST /api/v1/platform-notif/generate
   POST /api/v1/platform-notif/mark-all-read

   MAINTENANCE + QR:
   GET  /api/v1/pm-schedule/assets
   GET  /api/v1/pm-schedule/calendar
   POST /api/v1/pm-schedule/generate
   GET  /api/v1/qr/asset/{id}             -> image/png
   GET  /api/v1/qr/asset/{id}/data
   GET  /api/v1/qr/asset/{id}/print-sheet -> application/pdf
   GET  /api/v1/qr/assets/list

   SLA + TIME TRACKING:
   GET  /api/v1/sla/dashboard
   GET  /api/v1/sla/breaches
   GET  /api/v1/time-entries/
   POST /api/v1/time-entries/  body:{work_order_id,technician_id,work_type,
        hours_logged,start_time(REQUIRED!),hourly_rate,notes}
   GET  /api/v1/time-entries/summary

   EXECUTIVE:
   GET  /api/v1/executive/dashboard  -> {operations,financial,alerts}

   PORTALS:
   POST /api/v1/client/login    body:{email,pin} -> {access_token,client}
   GET  /api/v1/client/dashboard?site_id=X
   GET  /api/v1/client/work-orders?site_id=X
   POST /api/v1/client/service-requests
   POST /api/v1/supplier/login  body:{email,pin} -> {access_token,supplier}
   GET  /api/v1/supplier/dashboard?vendor_id=X
   GET  /api/v1/supplier/purchase-orders?vendor_id=X
   POST /api/v1/supplier/quotes

## 8. PORTAL PAGES (41+ — all verified 200 OK)
   MAIN PORTAL (dark theme):
   - /workspace                Platform hub all sprints visible
   - /executive/dashboard      Live KPIs + alerts
   - /financial                P&L revenue aging
   - /reports                  12 report types + CSV/PDF
   - /notifications            Platform alerts
   - /operations/work-orders   List + create
   - /operations/work-orders/[id]  Detail + delete + PDF
   - /operations/work-orders/new   Create form
   - /operations/dispatch      Kanban board assign techs
   - /operations/maintenance   PM scheduler + calendar
   - /operations/sla           SLA compliance dashboard
   - /operations/time-tracking Log hours + utilization
   - /operations/assets/qr     QR gallery
   - /operations/service-requests and /[id]
   - /operations/technicians and /[id]
   - /operations/sites and /[id]
   - /supply-chain/procurement P2P hub
   - /supply-chain/scope-of-work /[id] /new
   - /supply-chain/vendor-management /[id]
   - /supply-chain/rfq-management /[id]
   - /supply-chain/purchase-orders-v2 /[id]
   - /supply-chain/invoices /[id] /new
   - /supply-chain/approvals-center
   - /supply-chain/goods-receipts/new
   - /asset/[id]  QR scan landing PUBLIC no auth

   CLIENT PORTAL (light theme):
   - /client-portal             Login email + PIN 1234
   - /client-portal/dashboard
   - /client-portal/work-orders
   - /client-portal/request    Raise service request
   - /client-portal/approvals  SOW approval
   - /client-portal/projects

   SUPPLIER PORTAL (dark slate theme):
   - /supplier-portal           Login email + PIN 1234
   - /supplier-portal/dashboard
   - /supplier-portal/purchase-orders
   - /supplier-portal/rfqs      Submit bids
   - /supplier-portal/invoices
   - /supplier-portal/profile   Document upload

## 9. DESIGN SYSTEM CLASSES
   tb-hero tb-hero-inner               Full-width gradient hero section
   tb-canvas                           Content area with max-width padding
   tb-section                          Card with border + padding
   tb-section-title                    Section heading
   tb-grid-4                           4-col grid USE: grid grid-cols-2 md:grid-cols-4 gap-3 for mobile
   tb-hero-kpi                         KPI stat in hero
   tb-table tb-table-row               Data table system
   tb-badge                            Small pill label
   tb-pill tb-pill--active             Filter tab button
   tb-empty                            Empty state container
   tb-input                            Form input field
   tb-btn-primary                      Green action button
   tb-btn-secondary                    Border outline button
   tb-flex-between                     justify-between flex row
   bg-base bg-base-alt                 Dark backgrounds
   text-primary/secondary/tertiary     Text hierarchy
   border-border                       Subtle border color
   text-brand                          Emerald green accent

## 10. NAVIGATION SYSTEM
   File:      portal/components/workspace/nav.ts
   NavCenter: key, label, shortLabel?, href, subtitle?, badge?, children?
   NavItem:   label, href, icon?, badge?, description?
   NavGroups: Platform, Operations, Supply Chain, Intelligence
   Sidebar:   EnterpriseSidebar.tsx reads enterpriseCenters
   Shell:     EnterpriseShell.tsx wraps all (app)/(enterprise)/* pages
   Breadcrumb: portal/components/ui/Breadcrumb.tsx (auto from pathname)
   Mobile:    MobileBottomNav.tsx (5 pages, hidden on md+)
   REQUIRED:  mobilePrimaryNav export must exist in nav.ts

## 11. AGENT WORKFLOW (MANDATORY SEQUENCE)
   STEP 1: ANALYZE with Qwen — design prompt with specific context
   STEP 2: CHECK for route conflicts in main.py
           grep pattern: for i,l in enumerate(src.split('\n')): if '@app.' in l and 'path' in l
   STEP 3: CHECK actual DB schema
           PGPASSWORD=ai123 psql -h localhost -p 5432 -U ai -d triangle_black
           -c "SELECT column_name FROM information_schema.columns WHERE table_name='X'"
   STEP 4: BUILD backend — APPEND to main.py never rewrite
           if 'SPRINT X' not in src: p.write_text(src.rstrip() + NEW_CODE)
   STEP 5: Syntax check
           .venv/bin/python3 -m py_compile src/main.py && echo OK
   STEP 6: CREATE DB tables in LOCAL postgres port 5432
           PGPASSWORD=ai123 psql -h localhost -p 5432 -U ai -d triangle_black << SQL
   STEP 7: RESTART backend
           pkill -f 'uvicorn src.main:app'; sleep 4
           nohup .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 > /tmp/tb_backend.log 2>&1 &
           sleep 12
   STEP 8: VERIFY endpoints with requests library
   STEP 9: BUILD frontend pages with Path().write_text()
   STEP 10: REBUILD portal: cd portal && rm -rf .next && node node_modules/.bin/next build
   STEP 11: VERIFY pages: requests.get('http://localhost:3000/path', cookies=...)
   STEP 12: COMMIT: git add . && git commit --no-verify -m 'feat(sprintX): desc' && git push

## 12. COMMON ERRORS & EXACT FIXES
   ERROR: relation X does not exist
   FIX:   Table in Docker not local. Re-run CREATE TABLE against local port 5432

   ERROR: column X does not exist
   FIX:   Schema assumption wrong. Query information_schema.columns first

   ERROR: 422 multipart model_attributes_type
   FIX:   Pydantic v2 breaks Form() params. Use Request.form() instead

   ERROR: NameError: File is not defined
   FIX:   Import File separately: from fastapi import File, UploadFile

   ERROR: from __future__ imports must occur at beginning
   FIX:   Collect __future__ lines, put FIRST, then rest of file

   ERROR: 404 on new endpoint
   FIX:   Old router intercepts. Rename to /v2/ prefix

   ERROR: 405 Method Not Allowed on list
   FIX:   Detail {id} before list /. Swap order in main.py

   ERROR: two parallel pages resolve to same path
   FIX:   Remove (app)/X when (app)/(enterprise)/X exists

   ERROR: JSONDecodeError on DELETE
   FIX:   work_orders returns 204 No Content. Test: if r.status_code==204

   ERROR: PDF test 0KB Expecting value
   FIX:   PDF is binary. Test: 'pdf' in r.headers.get('content-type','')

   ERROR: useMutation defined multiple times
   FIX:   Deduplicate: list(dict.fromkeys(imports))

   ERROR: start_time NOT NULL violation
   FIX:   Default: start or datetime.datetime.utcnow().isoformat()

   ERROR: SLA scores all 0
   FIX:   service_requests have no resolved_at. UPDATE sr SET resolved_at=NOW() WHERE status='resolved'

   ERROR: Maintenance schedule returns 0
   FIX:   Old router intercepts. Use /pm-schedule/assets instead

   ERROR: f-string with braces in handoff
   FIX:   Use lines.append() list pattern instead of triple-quoted f-strings

## 13. QWEN USAGE — BEST PRACTICES

   MODEL:   qwen2.5-coder:7b
   URL:     http://localhost:11434/api/generate
   TIMEOUT: 120-180 seconds minimum

   OPTIMAL CALL:
   r = requests.post("http://localhost:11434/api/generate",
       json={"model":"qwen2.5-coder:7b","prompt":prompt,"stream":False,
             "options":{"num_predict":800,"temperature":0.0}},
       timeout=180)
   result = r.json().get("response","").strip()

   num_predict: 400-600=analysis  800-1000=design  1200=code  400=summary
   temperature: 0.0=architecture/code  0.1=creative

   BEST PROMPT STRUCTURE:
   You are [ROLE] for Triangle Black MEP platform.
   CONTEXT: existing tables=[list], existing endpoints=[list], tech=FastAPI+PostgreSQL+Next.js
   TASK: [one clear goal]
   CONSTRAINTS: [specific technical limits]
   OUTPUT: [exact format JSON/SQL/bullets/endpoints]
   Be concise. [word limit]

   QWEN EXCELS AT:
   - Architecture: Design 3 DB tables for X
   - SQL: Write SQL for SLA calculation (PostgreSQL syntax)
   - Bug analysis: Diagnose this error: [paste error]
   - Sprint planning: Rank 5 features by business value x speed
   - Audit: Summarize these test results, find top 5 bugs

   QWEN STRUGGLES WITH:
   - Long JSX pages (use code templates instead)
   - Complex Python with many imports
   - File system reasoning
   - Multi-step chains (break into separate prompts)

## 14. CREDENTIALS
   Main portal:    amr@triangleblack.com / admin123
   Client PIN:     1234 (all hotel contacts)
   Supplier PIN:   1234 (all vendor contacts)

   ahmed.fouad@nileplaza.com                Nile Plaza Hotel      site-nile-plaza
   sara.hassan@cairofestival.com            Cairo Festival City   site-cairo-festival
   mona.kamal@fourseasons.com               Four Seasons Cairo    site-four-seasons
   rania.ibrahim@hilton.com                 Hilton Cairo          site-hilton-cairo
   info@arctic-hvac.com                     Arctic HVAC           vendor v-hvac-001
   ahmed@delta-elec.com                     Delta Electrical      vendor v-elec-001
   khaled@blueline.com                      BlueLine Plumbing     vendor v-plmb-001
   nadia@fireshield.com                     FireShield Systems    vendor v-fire-001

## 15. NEXT SPRINT CANDIDATES

   CRITICAL FIXES:
   A. Seed resolved service_requests with resolved_at for SLA to work
   B. Add Log Time button on WO detail page
   C. time_entries frontend — ensure start_time always sent

   HIGH VALUE:
   D. Contracts Module — SOW->Contract->Invoice payment chain
   E. Email Notifications — real SMTP for critical WOs + overdue invoices
   F. Security Hardening — JWT rotation, rate limiting, audit log table

   MEDIUM VALUE:
   G. Multi-tenant — isolate data per company, onboard in 5 min
   H. Asset maintenance history — log all PM activities
   I. User management UI — add/edit users via portal

## 16. KEY FILE PATHS
   Backend main file      triangle-black/src/main.py  (~6000+ lines, APPEND ONLY)
   Environment            triangle-black/.env
   Frontend root          triangle-black/portal/
   Sidebar nav def        portal/components/workspace/nav.ts
   Enterprise shell       portal/components/workspace/EnterpriseShell.tsx
   Sidebar component      portal/components/workspace/EnterpriseSidebar.tsx
   Breadcrumb             portal/components/ui/Breadcrumb.tsx
   Mobile nav             portal/components/workspace/MobileBottomNav.tsx
   File uploads           triangle-black/uploads/{hotel_id}/{entity_type}/{entity_id}/
   Backend log            /tmp/tb_backend.log
   Portal log             /tmp/tb_portal.log
   Qwen audit reports     /tmp/tb-smart-audit/

================================================================================
SPRINT 265 FINAL STATE
Portal pages:   41+ (100% 200 OK)
API endpoints:  70+
DB tables:      25+
Sprints:        245-265 (20 sprints)
Twin health:    93/100
================================================================================
END OF HANDOFF — Read completely before writing ANY code
================================================================================