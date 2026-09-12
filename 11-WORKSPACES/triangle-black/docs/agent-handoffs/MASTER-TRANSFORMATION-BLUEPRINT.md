# TRIANGLE BLACK — MASTER TRANSFORMATION BLUEPRINT
## Date: 2026-09-12

## SECTION 1: LIVE DATABASE TRUTH (authoritative)
  Assets:                    1,848
  Work Orders:               6,627
  WO Asset-linked:           447 (6.75%) ← VERY_LOW confidence
  WO Non-asset classified:   234
  WO Total classified:       10.28%
  WO Unclassified:           5,946 (URGENT)
  PM Plans:                  2,974
  PM Asset-linked:           2,581 (86.79%) ← HIGH confidence
  Service Requests:          5,116
  SR with asset:             244
  Recs pending:              261
  Recs approved:             833
  Recs acceptance rate:      76.1%
  Recs with outcome:         0 ← ZERO verified outcomes
  Outcome columns active:    ['roi_impact', 'actioned_at', 'outcome_verified_at', 'outcome', 'outcome_notes', 'outcome_by']
  Alembic head:              v11004_rec_outcomes

## SECTION 2: COMPONENT CLASSIFICATION
Domain                              Status   Quality    Class        Priority
-------------------------------------------------------------------------------------
Commercial Loop                     EXISTS   STRONG     KEEP         P1
Operations/WO                       EXISTS   STRONG     KEEP         P0
SR→Asset→WO                         EXISTS   ADEQUATE   REFACTOR     P0
PM Maintenance                      EXISTS   STRONG     KEEP         P1
Procurement                         EXISTS   ADEQUATE   KEEP         P1
Inventory                           EXISTS   ADEQUATE   KEEP         P2
Workflow Engine                     EXISTS   STRONG     KEEP         P1
Attention Engine                    EXISTS   STRONG     REFACTOR     P1
AI Directors                        EXISTS   STRONG     KEEP         P1
Recommendations                     EXISTS   ADEQUATE   REFACTOR     P0
Outcome Tracking                    EXISTS   WEAK       REFACTOR     P0
Digital Twin                        EXISTS   ADEQUATE   KEEP         P2
Data Trust Layer                    EXISTS   ADEQUATE   REFACTOR     P0
WO Classification                   EXISTS   WEAK       REFACTOR     P0
Pilot Engine                        EXISTS   STRONG     KEEP         P1
Onboarding                          EXISTS   ADEQUATE   REFACTOR     P1
Data Import                         EXISTS   ADEQUATE   REFACTOR     P1
Auth/Tenant                         EXISTS   STRONG     KEEP         P0
Audit Trail                         EXISTS   WEAK       REFACTOR     P1
Notifications                       EXISTS   WEAK       CONSOLIDATE  P2
Analytics                           EXISTS   WEAK       CONSOLIDATE  P2
Customer Report (PDF)               MISSING  MISSING    BUILD        P1
Observability                       EXISTS   WEAK       REFACTOR     P1
Production VM                       MISSING  MISSING    BUILD        P0
HTTPS/TLS                           MISSING  MISSING    BUILD        P0
Staging                             MISSING  MISSING    BUILD        P0
Backup/Restore                      EXISTS   WEAK       REFACTOR     P0
Browser E2E (Playwright)            MISSING  MISSING    BUILD        P1
Frontend Loading (60%)              EXISTS   WEAK       REFACTOR     P2
TS17008 (34 errors)                 EXISTS   WEAK       REFACTOR     P2
main.py (8942 lines)                EXISTS   WEAK       REFACTOR     P2
Asset Intelligence Card             MISSING  MISSING    BUILD        P2
Metric Registry                     MISSING  MISSING    BUILD        P1
API Registry                        MISSING  MISSING    BUILD        P2
RBAC 2.0                            MISSING  MISSING    DEFER        P3
SSO/SCIM                            MISSING  MISSING    DEFER        P3
Billing                             MISSING  MISSING    DEFER        P3
Mobile PWA                          MISSING  MISSING    DEFER        P3
IoT                                 MISSING  MISSING    DEFER        P3

## SECTION 3: DATA TRUST GAPS
  WO→Asset: 6.75% (VERY_LOW — intelligence unreliable)
  Root cause: Historical WOs created without asset linkage
  Unclassified WOs: 5,946 (need domain keyword library)
  PM→Asset: 86.79% (HIGH — V11-001 fixed)
  CRITICAL: 793 approved recs, 0 verified outcomes
  Outcome columns: ['roi_impact', 'actioned_at', 'outcome_verified_at', 'outcome', 'outcome_notes', 'outcome_by'] (V11-004 — just activated)

## SECTION 4: SECURITY GAPS
  Protected mutations: 235
  Unprotected (need investigation): 52
  Note: Many 'unprotected' may be showcase/demo routes
  V11-002 secured: bulk_operations, ai_gateway, goods_receipt, approval_chain
  Remaining: 10 routes need individual review

## SECTION 5: DUPLICATE DETECTION
  actions.py: RESOLVED (V11-005 removed 7 duplicates)
  /api/v1/me: OPEN (L2610 canonical, L6990 dead code)
  Notification routers: Multiple — NEEDS AUDIT
  Analytics routers: Multiple — NEEDS AUDIT

## SECTION 6: TEST INTEGRITY
  Total test functions: 3900
  Test files: 397
  Skipped (35): UNEXPLAINED — needs investigation
  Deselected (78): UNEXPLAINED — likely old/obsolete
  E2E journeys: 5/5 API-level (browser E2E MISSING)

## SECTION 7: FRONTEND TRUST
  Pages with loading states: 121/315 (38%)
  TS17008 errors: 34 (documented artifacts, non-blocking)
  Loading state approach: automated injection ABANDONED (too risky)
  Required approach: manual page-by-page, Tier-A first

## SECTION 8: PRODUCTION GAPS (P0)
  1. No production VM — localhost only
  2. No HTTPS/TLS — no certificate
  3. No staging environment — deploy directly impossible
  4. Backup restore NEVER tested — DR unverified
  5. Production secrets not rotated — dev credentials in use
  6. No automated backup — manual only
  7. No health alerting — failures go undetected
  8. No deployment rollback procedure tested

## SECTION 9: COMPLETE GAP REGISTER
ID       Domain               Gap                                           Priority Local?
----------------------------------------------------------------------------------------------------
  G001     Production           No VM/HTTPS/TLS/staging                       P0     No
  G002     Data Trust           WO→Asset 6.6% (VERY_LOW confidence)           P0     Partial
  G003     Outcomes             0 verified AI outcomes (793 approved)         P0     Yes
  G004     Security             Backup restore never tested                   P0     Yes
  G005     Security             Production secrets not rotated                P0     No
  G006     Testing              35 skipped / 78 deselected unexplained        P1     Yes
  G007     UX                   60% loading states — 127 pages missing        P1     Yes
  G008     Observability        No alerting, no business telemetry            P1     Yes
  G009     Customer             Onboarding requires developer                 P1     Yes
  G010     Reporting            No customer-grade PDF report                  P1     Yes
  G011     AI                   No outcome verification engine                P1     Yes
  G012     Data                 WO domain keyword library too generic         P1     Yes
  G013     Architecture         main.py 8942 lines (215 inline routes)        P2     Yes
  G014     Architecture         TS17008 34 errors (17 page rewrites)          P2     Yes
  G015     Architecture         /api/v1/me duplicate in main.py               P2     Yes
  G016     Architecture         Notification routers duplicated               P2     Yes
  G017     Architecture         Analytics metric drift risk                   P2     Yes
  G018     Intelligence         Asset Intelligence Card not exposed           P2     Yes
  G019     Intelligence         Metric Registry missing                       P2     Yes
  G020     Intelligence         Attention lifecycle incomplete                P2     Yes
  G021     Browser E2E          Playwright tests missing                      P1     Yes
  G022     Deferred             SSO/SCIM                                      P3     No
  G023     Deferred             Billing system                                P3     No
  G024     Deferred             Mobile native PWA                             P3     No
  G025     Deferred             IoT telemetry                                 P3     No

## SECTION 10: RECOMMENDED SPRINT SEQUENCE
  V12-001: OUTCOME VERIFICATION
    Objective: Record first 10 verified outcomes + ROI
    Files:     Recommendations router + pilot report
    Value:     HIGH value

  V12-002: EXECUTIVE PDF REPORT
    Objective: Build customer-grade pilot PDF
    Files:     New report service + PDF generation
    Value:     HIGH value

  V12-003: WO DOMAIN KEYWORDS
    Objective: Domain keyword library → >30% classified
    Files:     classification.py expansion
    Value:     MEDIUM effort

  V12-004: BACKUP RESTORE TEST
    Objective: Document + test restore procedure
    Files:     PostgreSQL + API verification
    Value:     HIGH trust

  V12-005: TEST AUDIT
    Objective: Explain all 35 skipped + 78 deselected
    Files:     tests/ directory review
    Value:     HIGH integrity

  V12-006: OBSERVABILITY
    Objective: Health alerts + business telemetry
    Files:     FastAPI middleware + alerting
    Value:     MEDIUM effort

  V12-007: ONBOARDING WIZARD
    Objective: Remove developer dependency
    Files:     onboarding/ + import/ + UI
    Value:     HIGH commercial

  V12-008: PRODUCTION VM
    Objective: Cloud deployment + HTTPS
    Files:     Infrastructure (requires cloud)
    Value:     CRITICAL gate

## SECTION 11: WHAT NOT TO BUILD
  1. Kubernetes (no scale need yet)
  2. Microservices rewrite (monolith is fine for pilot)
  3. Native mobile app (mobile web is sufficient)
  4. 50 AI agents (governed Directors are enough)
  5. Complex billing (prove value first)
  6. Enterprise SSO/SCIM (V13+ only)
  7. ERP integrations (post first customer)
  8. IoT platform (V14 capability)
  9. Blockchain (no use case justified)
  10. Multi-region architecture (single region sufficient for pilot)

## SECTION 12: NORTH STAR ASSESSMENT

  Triangle Black is currently closer to:
  SOPHISTICATED ENGINEERING PROJECT than COMMERCIAL PRODUCT

  Evidence FOR strong platform:
    ✅ 3,753 tests passing / 0 failing
    ✅ 934 API routes across commercial + operations + maintenance + procurement
    ✅ Multi-tenant JWT isolation (adversarially tested)
    ✅ AI recommendations with dedup, expiry, urgency, confidence
    ✅ Pilot engine with 30-day measurement framework
    ✅ Outcome tracking columns (just activated V11-004)
    ✅ Build Guard preventing regressions

  Evidence AGAINST production readiness:
    ❌ No production VM — localhost only
    ❌ 0 verified AI outcomes (793 approved, 0 measured)
    ❌ WO→Asset 6.6% (VERY_LOW intelligence confidence)
    ❌ Backup restore never tested
    ❌ Dev credentials in use
    ❌ No customer-grade PDF report
    ❌ No browser E2E tests
    ❌ No first customer

  ACCURATE STATUS:
  Advanced local engineering platform with strong architecture.
  NOT YET a production SaaS product.
  Gap: Production infrastructure + first customer proof.

  RECOMMENDED FOCUS:
  Stop adding features.
  Start proving outcomes from existing features.
  Then deploy to production.
  Then get first customer.
