# Triangle Black — A-000 Gap Register
## Authoritative as of August 2026 Git HEAD

---

## SEVERITY: CRITICAL (Must fix before first customer)

### GAP-001: Tenant Isolation — 38% Coverage Gap
- **Status**: VERIFIED PARTIAL
- **Finding**: 40/107 router modules have NO hotel_id dependency
- **Risk**: Cross-tenant data access possible on these endpoints
- **Modules without tenant**:
  ai_assistant, ai_mentor, ai_signals, analytics_kpi,
  approval_chain, approval_requests, audit_log, auth,
  bulk_operations, commercial_leads, csv_export, customer360,
  customer_success, email_alert, executive_kpi, global_search,
  goods_receipt_workflow, hotels, inventory_alerts, knowledge_graph,
  notification_engine, notifications, onboarding, pdf_export,
  performance_audit, pilot_control, procurement_intake, reporting,
  sales_pipeline, scope_of_work, search_filters, sla_dashboard,
  sse_notifications, supplier_portal, suppliers, tenant_audit,
  user_preferences, vendor_portal, warehouse_intelligence, warranty
- **Fix**: Add get_hotel_id dependency to all business data endpoints
- **Sprint**: A-003
- **Exceptions allowed**: auth, health, public marketing routes

### GAP-002: Raw SQL in 51 Router Files
- **Status**: VERIFIED — 51 router files contain raw SQL
- **Worst offenders**:
  work_orders: 51, projects: 42, approval_chain: 38,
  scope_of_work: 36, maintenance_enterprise: 36
- **Risk**: Business logic in wrong layer, hard to test/audit
- **Fix**: Migrate to repository/service layer progressively
- **Sprint**: A-007 (progressive)
- **Note**: Intelligence modules are CLEAN (use service layer)

### GAP-003: src/main.py — 309 Raw SQL Calls
- **Status**: VERIFIED
- **Lines**: 8,454
- **Risk**: Impossible to audit, test, or extract safely
- **Fix**: Freeze new business logic in main.py; extract to routers
- **Sprint**: A-007 (progressive)

### GAP-004: 152 Engine Creations
- **Status**: VERIFIED
- **Risk**: Multiple DB connection pools — potential exhaustion
- **Fix**: Single engine instance via src/core/database.py
- **Sprint**: A-002

### GAP-005: 86 Broad except Exception Blocks
- **Status**: VERIFIED
- **Risk**: Silent failures, data inconsistency, undetectable errors
- **Fix**: Structured error handling with typed exceptions
- **Sprint**: A-001 (critical ones), A-007 (all)

### GAP-006: CI/CD Pipeline — Does Not Exist
- **Status**: VERIFIED MISSING
- **Risk**: No automated quality gate before production
- **Fix**: GitHub Actions pipeline
- **Sprint**: A-005

### GAP-007: Staging Environment — Does Not Exist
- **Status**: VERIFIED MISSING
- **Fix**: Docker Compose production.yml + staging deploy
- **Sprint**: A-005

### GAP-008: Observability — Not Instrumented
- **Status**: VERIFIED MISSING
- **Risk**: No visibility into production failures
- **Fix**: OpenTelemetry traces + metrics + SLO definition
- **Sprint**: A-006

---

## SEVERITY: HIGH (Must fix before scaling to 3+ customers)

### GAP-009: Customer Onboarding — Not E2E Validated
- **Status**: UNVERIFIED
- **Risk**: First customer cannot self-onboard
- **Fix**: Full onboarding E2E test + fix all failures
- **Sprint**: A-008

### GAP-010: Data Import Domain Rule (assets.score NOT NULL)
- **Status**: VERIFIED BROKEN
- **Risk**: CSV imports fail silently or incorrectly
- **Fix**: Implement correct domain rule (calculated vs supplied)
- **Sprint**: A-009

### GAP-011: Marketing Routes — Auth May Intercept
- **Status**: UNVERIFIED
- **Risk**: Prospects cannot access marketing site
- **Fix**: Verify proxy.ts PUBLIC list covers all marketing pages
- **Sprint**: A-001

### GAP-012: Full Backend Suite — 31 Known Failures
- **Status**: VERIFIED (from last full run)
- **Risk**: Unknown regressions in production paths
- **Fix**: Fresh server run, categorize, fix
- **Sprint**: A-001

---

## SEVERITY: MEDIUM (Before enterprise customers)

### GAP-013: API Contract — Executive Dashboard Mismatch
- **Status**: PARTIAL — alias added, contract not enforced
- **Sprint**: A-003

### GAP-014: Backup/Restore — Not Verified E2E
- **Status**: UNVERIFIED
- **Sprint**: A-002

### GAP-015: Inline Styles — 1,022 Remaining
- **Status**: VERIFIED PARTIAL (was 1,169, now 1,022)
- **Note**: All remaining are dynamic/irreducible (CSS vars, grid, progress)
- **Sprint**: Design system ongoing

### GAP-016: Pricing Validation — Not Customer-Tested
- **Status**: UNVERIFIED
- **Sprint**: A-016

### GAP-017: ROI Measurement — Not Built Per-Customer
- **Status**: UNVERIFIED
- **Sprint**: A-012

---

## SEVERITY: LOW (Enterprise scale, post-traction)

### GAP-018: SSO/SAML — Sandbox Only
### GAP-019: Stripe Billing — Not Production Configured
### GAP-020: Multi-Region — Not Applicable Yet
### GAP-021: WCAG 2.2 AA — Not Audited
### GAP-022: SLSA Build Provenance — Not Configured
### GAP-023: OWASP ASVS Matrix — Not Built

---

## WHAT IS FULLY VERIFIED WORKING

| Component | Evidence |
|-----------|----------|
| E2E Full Suite | 126/126 ✅ |
| E2E Auth | 9/9 ✅ |
| Backend targeted | 70/70 ✅ |
| Build Guard | 0 issues ✅ |
| Intelligence APIs | 20 endpoints all 200 ✅ |
| Digital Twin | Foundation ✅ |
| Workflow Engine | SR→WO→Invoice complete ✅ |
| Audit Trail | 16 call points ✅ |
| DDD Compliance | All table-owning modules ✅ |
| @ts-nocheck | 234→2 ✅ |
| Alembic | g2h3i4j5k6l7 clean head ✅ |
| Pilot Tenants | 3 operational ✅ |
| Demo Tenant | Seeded ✅ |
| Portal | 305 pages ✅ |
| nav.ts | 13 centers, 130+ routes ✅ |
| CHILD_ICONS | 55 Lucide names mapped ✅ |
