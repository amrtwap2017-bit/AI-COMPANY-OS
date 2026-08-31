# V7 AUDIT — 04 DATABASE AUDIT
Date: 2026-08-31
Status: VERIFIED FROM LIVE DB

---

## DATABASE SCALE

| Metric | Value | Status |
|--------|-------|--------|
| Tables | 174 | FOUND |
| Indexes | 446 | FOUND |
| Alembic head | f2a3b4c5d6e7 | SINGLE HEAD ✅ |
| Migrations | 19 | FOUND |

## KEY TABLE ROW COUNTS

| Table | Rows | Notes |
|-------|------|-------|
| hotels | 1,895 | Very high — test data bloat |
| users | 2,418 | Very high — test data bloat |
| assets | 713 | Active operational data |
| work_orders | 1,729 | Active operational data |
| maintenance_plans | 722 | Active operational data |
| suppliers | 1,019 | Active operational data |
| recommendations | 1,616 | Active |
| kpi_snapshots | 1,932 | Active |
| recommendation_outcomes | 20 | SPARSE — only 1.2% coverage |
| platform_audit_log | 7,163 | Active ✅ |
| platform_notifications | 145 | Active |
| workflow_instances | 695 | Active |
| workflow_definitions | 2,447 | VERY HIGH — likely test bloat |

## TENANT ISOLATION — VERIFIED

ALL 6 critical tables have hotel_id on EVERY row:
- work_orders: 1,729 total, 0 NULL hotel_id ✅
- assets: 713 total, 0 NULL hotel_id ✅
- maintenance_plans: 722 total, 0 NULL hotel_id ✅
- suppliers: 1,019 total, 0 NULL hotel_id ✅
- recommendations: 1,616 total, 0 NULL hotel_id ✅
- kpi_snapshots: 1,932 total, 0 NULL hotel_id ✅

## DATA QUALITY DISCREPANCY

V6 reported (2026-08-29):           V7 verified (2026-08-31):
Suppliers with email: 46.1%    →    99.2% (992/1000)
PM Compliance: 10.1%           →    72.6%
Assets: 418                    →    628
Suppliers: 737                 →    1,019

CONCLUSION: Dataset was significantly refreshed between sessions.
The V6 intelligence numbers (78.8 DQ score, 10.1% PM compliance)
were from an earlier, smaller dataset. Current data is different.
All V6 intelligence claims must be re-verified against current DB.

## OPERATIONAL DATA REALITY (Current)

Work Orders:
  Total: 1,634
  Asset linked: 139 (8.5%) — CRITICAL GAP
  Technician assigned: 437 (26.7%)
  Completed: 855
  Unassigned open: 395 — CRITICAL

Maintenance Plans:
  Total: 722
  Asset linked: 676 (93.6%) ✅
  Overdue: 198
  PM Compliance: 72.6% (needs improvement, target 85%)

Assets: 628 total, 100% criticality, 100% site ✅

Suppliers: 1,000 total, 99.2% email ✅

AI Recommendations: 1,616 total
  Pending: 1,460 (90.4%)
  Approved: 125 (7.7%)
  Rejected: 31 (1.9%)
  Outcomes recorded: 20 (1.2% of approved)

