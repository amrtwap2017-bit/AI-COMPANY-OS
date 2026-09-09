# V10 DATA QUALITY BASELINE
Generated: 2026-09-09 08:53
Hotel: tb-default-hotel-000000000001
Status: VERIFIED from live database

---

## Overall Data Quality Score

| Metric | Score | Value | Target | Status |
|--------|-------|-------|--------|--------|
| WO→Asset Linkage | 5.1% | 226/4440 | >80% | 🔴 |
| PM→Asset Linkage | 73.4% | 1476/2012 | >80% | 🟢 |
| Asset Criticality | 100.0% | 1330/1330 | 100% | ✅ |
| Supplier Completeness | 99.5% | 1492/1500 | >90% | ✅ |
| AI Acceptance Rate | 8.0% | 535/6709 | >20% | 🔴 |

**Overall Data Quality: LOW**

---

## Work Order Analysis

| Metric | Count | % |
|--------|-------|---|
| Total WOs | 4,440 | 100% |
| Asset-linked | 226 | 5.1% |
| Open | 906 | 20.4% |
| Critical open | 880 | 19.8% |
| Unassigned | 896 | 20.2% |

## WO Linkage by Type (Root Cause Analysis)

| Type | Total | Linked | % | Root Cause |
|------|-------|--------|---|-----------|
| Corrective | 3,140 | 74 | 2.4% | Form had no asset field (V9-015 deployed) |
| Preventive | 96 | 95 | 99.0% | PM plans pre-select assets |
| Service Request | 1,145 | 0 | 0.0% | SR→WO conversion no asset field (V10-007) |

## V10-006 Target: WO→Asset Improvement

| Milestone | Target | Action |
|-----------|--------|--------|
| Now | 5.1% (baseline) | Document |
| After V10-006 | 30% | Enforce asset on new corrective WOs |
| After V10-007 | 50% | SR→WO asset field |
| After pilot import | 70%+ | Real hotel data with assets |

## AI Intelligence Quality

| Metric | Value | Assessment |
|--------|-------|-----------|
| Total recommendations | 6,709 | 🟡 High volume |
| Pending | 1,106 | 🔴 |
| Approved | 535 | — |
| Acceptance rate | 8.0% | 🔴 Low — quality/fatigue issue |

## Data Quality Gap Register

| Gap | Impact | V10 Sprint |
|-----|--------|-----------|
| WO→Asset 5.1% | MTTR unreliable, critical path unreliable | V10-006 |
| SR→WO no asset | 0% SR linkage | V10-007 |
| AI acceptance 8% | Recommendations ignored | V10-008 |
| 896 unassigned WOs | No accountability | Attention Engine |
| 525 overdue PM | Operational risk | Attention Engine |
