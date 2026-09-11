# TRIANGLE BLACK — IMPLEMENTATION PLAN
Generated: 2026-09-11

## PHASE 0 — IMMEDIATE (This Session)

| Task | Files | Risk | Status |
|------|-------|------|--------|
| Fix TS1128 (missing return()) | 7 portal pages | LOW | IN PROGRESS |
| Verify 0 TS errors | portal/ | LOW | PENDING |
| Full test suite pass | tests/ | LOW | PENDING |

## PHASE 1 — PRODUCTION FOUNDATION (Next Priority)

Requires: Cloud VM with public IP

| Task | Files | Risk |
|------|-------|------|
| Provision VM | Infrastructure | MEDIUM |
| Configure DNS | DNS provider | LOW |
| Install Nginx + Certbot | /etc/nginx | MEDIUM |
| Deploy PostgreSQL | Docker/system | HIGH |
| Deploy Redis | Docker/system | MEDIUM |
| Systemd services | /etc/systemd | MEDIUM |
| Environment secrets | .env.prod | HIGH |
| Backup automation | cron/scripts | MEDIUM |
| Health + smoke tests | tests/smoke | LOW |

## PHASE 2 — DATA TRUST (Parallel Track)

| Task | Files | Risk |
|------|-------|------|
| WO non_asset_reason classification | src/commercial/work_orders | LOW |
| Corrective WO asset linkage tool | src/commercial/data_recovery | MEDIUM |
| Historical linkage reporting | src/commercial/pilot_control | LOW |
| WO→Asset linkage target: 30%+ | Database | LOW |

## PHASE 3 — E2E GOLDEN JOURNEYS

| Journey | Test File | Status |
|---------|-----------|--------|
| Customer Onboarding | tests/e2e/test_journey_1_onboarding.py | MISSING |
| Maintenance SR→WO | tests/e2e/test_journey_2_maintenance.py | MISSING |
| PM Plan execution | tests/e2e/test_journey_3_pm.py | MISSING |
| Procurement PR→PO | tests/e2e/test_journey_4_procurement.py | MISSING |
| Intelligence→Action | tests/e2e/test_journey_5_intelligence.py | MISSING |

## PHASE 4 — PILOT LAUNCH GATE

Requirements before first customer:
[ ] Production URL live
[ ] HTTPS live
[ ] 0 TS errors
[ ] 5/5 golden journeys PASS
[ ] WO→Asset > 30%
[ ] Pilot onboarding tested end-to-end
[ ] ROI measurement verified
[ ] Backup restore tested

