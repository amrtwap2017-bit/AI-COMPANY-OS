# TRIANGLE BLACK — 30-DAY PILOT PLAYBOOK
Version: 7.0 | Date: 2026-08-31 | AUTHORITATIVE

## OVERVIEW
Duration: 30 days | Goal: Measurable operational improvement
Success: 1+ KPI improves + ROI documented with evidence

## PRE-PILOT (Days -3 to 0)
Assess: Properties / Assets / PM format / Supplier list / Contact
Tech:   bash START.sh → health 200 → tests passing

## WEEK 1 — SETUP (Days 1-7)
POST /api/v1/onboarding/provision → hotel_id + password
GET  /api/v1/onboarding/checklist → pilot_ready=true
POST /api/v1/data-import/assets
POST /api/v1/data-import/suppliers
POST /api/v1/data-import/pm-plans
GET  /api/v1/data-quality/confidence-report → Trust >60%
POST /api/v1/roi/snapshot ← capture baseline
POST /api/v1/recommendations/generate

## WEEK 2 — MONITORING (Days 8-14)
GET /api/v1/recommendations/daily-digest → top 5 daily
GET /api/v1/kpi-engine/alerts → red KPIs

## WEEK 3 — ACTIONS (Days 15-21)
GET  /api/v1/recommendations/action-queue → P0 first
POST /api/v1/recommendations/{id}/outcome ← after every action

## WEEK 4 — MEASUREMENT (Days 22-30)
POST /api/v1/roi/snapshot ← final
GET  /api/v1/roi/delta ← before/after
GET  /api/v1/reports/operational-summary ← PDF export

## SUCCESS CRITERIA
STRONG: 2+ KPIs improved | SUCCESS: 1 KPI + renewal | NEEDS WORK: fix DQ first

## ROI DISCLOSURE (MANDATORY)
SAY:   "Potential EGP X avoidance identified"
NEVER: "You will save EGP X"
All claims: source records + formula + labeled estimate

## QUICK API REFERENCE
Provision:    POST /api/v1/onboarding/provision
Checklist:    GET  /api/v1/onboarding/checklist
Import:       POST /api/v1/data-import/{assets|suppliers|pm-plans}
Confidence:   GET  /api/v1/data-quality/confidence-report
Baseline:     POST /api/v1/roi/snapshot
Daily Digest: GET  /api/v1/recommendations/daily-digest
Action Queue: GET  /api/v1/recommendations/action-queue
Outcome:      POST /api/v1/recommendations/{id}/outcome
Compare:      GET  /api/v1/roi/delta
PDF:          GET  /api/v1/reports/operational-summary
