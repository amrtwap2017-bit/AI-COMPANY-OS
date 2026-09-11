
# TRIANGLE BLACK — NEXT SPRINT PLAN
Generated: 2026-09-11
Based on: Gap analysis + DB state + test failures

## CURRENT METRICS
- WO→Asset: 6.4% direct | 8.9% total classified
- AI acceptance: 10.5%
- Pending recs: 223

## PRIORITY ORDER (no cloud required)

### V11-001 — Fix failing test + data threshold review
Priority: P0 (test suite integrity)
Files: tests/commercial/test_v8_011_data_integrity.py
Action: Investigate test assertion vs actual data

### V11-002 — Secure real unprotected mutations
Priority: P0 (security)
Files: bulk_operations/router.py, ai_gateway/router.py,
       goods_receipt_workflow/router.py, approval_chain/router.py
Action: Add auth dependency to genuinely unprotected routes

### V11-003 — WO→Asset linkage improvement
Priority: P1 (data trust)
Target: total classified > 30%
Action: Run classification on remaining 5,000+ unclassified WOs
        Add corrective WO asset enforcement in creation form

### V11-004 — AI Recommendation Outcome Tracking
Priority: P1 (commercial value proof)
Action: Add outcome/roi_impact columns to recommendations
        Build outcome tracking endpoint
        Wire approved→actioned→outcome loop

### V11-005 — Duplicate route consolidation
Priority: P2 (architecture)
Files: src/core/actions.py (7 duplicates), src/main.py (2x /me)
Action: Remove duplicate route definitions safely

## NOT BUILDING NOW
- Cloud VM (infrastructure decision needed)
- TS17008 fixes (V11 page rewrites, low priority)
- Mobile app, K8s, SSO, billing
