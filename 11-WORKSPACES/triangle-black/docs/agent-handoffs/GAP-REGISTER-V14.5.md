# TRIANGLE BLACK — Authoritative Gap Register
## Generated: 2026-09-16 09:00
## Commit: 6e7b67d0 | Tests: 3,808/0

## Summary: 9 gaps identified

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (blocks V14.5 GO) | 1 | Production blockers |
| P0-POST-VM | 1 | Need VM first |
| P1 (blocks V15 pilot) | 5 | Customer pilot blockers |
| P2 (quality/debt) | 2 | Non-blocking debt |

---

## GAP-001: Evidence Ledger not connected to recommendation outcomes
**Priority:** P0 | **Effort:** 2h
**Module:** `recommendations/outcome_service.py`
**State:** MISSING_INTEGRATION
**Impact:** 92K EGP internal ROI is NOT in evidence_ledger → cannot show L0-L4 hierarchy
**Fix:** In record_outcome(): after DB commit, call EvidenceLedgerService.record_evidence(level=0, financial_value=roi_impact)

---

## GAP-004: Pilot dashboard shows internal ROI without L0/L3 distinction
**Priority:** P1 | **Effort:** 4h
**Module:** `portal pilot-dashboard/page.tsx`
**State:** INCOMPLETE
**Impact:** Customer sees inflated ROI numbers that include internal evidence
**Fix:** Add evidence summary widget: 'Internal (L0-2): X EGP | Customer Verified (L3+): Y EGP'

---

## GAP-005: No outcome recording UI in recommendations page
**Priority:** P1 | **Effort:** 4h
**Module:** `portal recommendations/page.tsx`
**State:** MISSING
**Impact:** Customer cannot record outcomes from UI — must use API directly
**Fix:** Add outcome recording form to approved recommendations

---

## GAP-006: No UI for customer to upgrade evidence L0→L3
**Priority:** P1 | **Effort:** 4h
**Module:** `portal evidence/`
**State:** MISSING
**Impact:** Customer verified ROI stays at 0 — cannot generate Level 3 evidence from UI
**Fix:** Add 'Customer Confirms' button on evidence records → calls PATCH /evidence/{id}/verify

---

## GAP-007: 59 mutation routes still without explicit auth
**Priority:** P1 | **Effort:** 2h
**Module:** `various src/commercial/`
**State:** PARTIAL
**Impact:** Some production mutations accessible without authentication
**Fix:** Verify each: ACCEPTABLE (internal/demo) or add current_user=Depends(get_current_user)

---

## GAP-008: Playwright tests fragile — require manual port 3000 management
**Priority:** P2 | **Effort:** 2h
**Module:** `portal/e2e/`
**State:** FRAGILE
**Impact:** E2E tests fail when AI Company OS takes port 3000 — not reliable in CI
**Fix:** Update playwright.config.ts to verify TB is on port 3000 before tests start

---

## GAP-009: 281 pre-existing TypeScript errors (non-blocking but accumulating)
**Priority:** P2 | **Effort:** 1 week
**Module:** `portal/ (various)`
**State:** DOCUMENTED_DEBT
**Impact:** Hidden quality debt — next build passes but source has errors
**Fix:** Progressive fix: start with critical customer routes, then lib/, then admin pages

---

## GAP-010: No production monitoring configured (uptime, alerts, dashboards)
**Priority:** P0-POST-VM | **Effort:** 1 day
**Module:** `infra/monitoring/`
**State:** MISSING
**Impact:** Cannot detect production incidents before customers do
**Fix:** UptimeRobot (free) + disk/5xx/backup alerts via ALERT_WEBHOOK_URL

---

## GAP-011: ~3,863 test WOs archived but provenance classification inconsistent
**Priority:** P1 | **Effort:** 1h
**Module:** `data/work_orders`
**State:** PARTIAL
**Impact:** KPI metrics show 6% WO→Asset when real data is ~15-20%
**Fix:** Run archive script for remaining test patterns + add provenance to all KPI queries

---
