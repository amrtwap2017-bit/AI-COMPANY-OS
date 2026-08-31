# TRIANGLE BLACK — KPI REGISTRY
Version: 7.0
Date: 2026-08-31
Status: AUTHORITATIVE

This registry documents every KPI calculated by Triangle Black.
Each entry contains: formula, source tables, confidence rules, thresholds, and owner.

No KPI may be presented to a user without being registered here.
No KPI may claim HIGH confidence without >= 85% data coverage.

---

## KPI-001 — Operational Health Index (OHI)

**Label:** Operational Health Score
**Endpoint:** GET /api/v1/executive-engine/health-score
**Range:** 0–100
**Unit:** Score

**Formula:**
OHI = weighted_average( WO completion rate × 0.25, PM compliance rate × 0.25, SLA compliance rate × 0.20, Asset health avg × 0.15, Supplier score avg × 0.15 )


**Source Tables:** work_orders, maintenance_plans, assets, suppliers
**Refresh:** On-demand (live query)
**Confidence:** MEDIUM (limited by WO-asset linkage 8.2%)

**Thresholds:**
- GREEN  (EXCELLENT):  >= 90
- AMBER  (GOOD):       75–89
- ORANGE (WARNING):    60–74
- RED    (CRITICAL):   < 60

**Owner:** Executive Engine (`src/commercial/executive_engine/service.py`)

---

## KPI-002 — PM Compliance Rate

**Label:** Preventive Maintenance Compliance
**Endpoint:** GET /api/v1/pm-engine/summary
**Range:** 0–100%
**Unit:** Percentage

**Formula:**
PM Compliance = (total_plans - overdue_plans) / total_plans × 100

Where overdue = next_due_date::DATE < CURRENT_DATE AND status != 'completed'

**Source Tables:** maintenance_plans
**Filter:** hotel_id scoped
**Refresh:** On-demand
**Confidence:** MEDIUM (73.4% of plans have next_due_date set)

**Thresholds:**
- Grade A+: >= 95%
- Grade A:  90–94%
- Grade B:  80–89%
- Grade C:  70–79%
- Grade D:  60–69%
- Grade F:  < 60%

**Target:** >= 85% (industry standard for hotel engineering)
**Owner:** PM Engine (`src/commercial/pm_engine/service.py`)

---

## KPI-003 — Mean Time To Repair (MTTR)

**Label:** Mean Time To Repair
**Endpoint:** GET /api/v1/trend-engine/mttr
**Range:** 0–∞ hours
**Unit:** Hours

**Formula:**
MTTR = AVG(completed_at - created_at) WHERE status = 'completed' AND completed_at IS NOT NULL AND completed_at > created_at ← data quality guard AND asset_id IS NOT NULL ← asset linkage guard



**Source Tables:** work_orders
**Filter:** hotel_id, per priority bucket
**Refresh:** On-demand
**Confidence:** VERY_LOW (8.2% WO-asset linkage — limited dataset)

**Industry Targets (hotel engineering):**
- Emergency: <= 4h
- Critical:  <= 8h
- High:      <= 24h
- Medium:    <= 72h
- Low:       <= 168h (7 days)

**Data Limitation:** Only WOs linked to assets are included.
91.8% of work orders excluded due to missing asset_id.

**Owner:** Trend Engine (`src/commercial/trend_engine/service.py`)

---

## KPI-004 — Proactive vs Reactive Ratio

**Label:** Proactive Maintenance Ratio
**Endpoint:** GET /api/v1/trend-engine/proactive-ratio
**Range:** 0–100%
**Unit:** Percentage

**Formula:**
Proactive % = COUNT(type IN proactive_types) / COUNT(*) × 100

Proactive types: preventive, pm, inspection, planned, scheduled, routine Reactive types: corrective, emergency, reactive, breakdown, repair, unplanned

**Source Tables:** work_orders
**Filter:** hotel_id, deleted_at IS NULL
**Refresh:** On-demand
**Confidence:** MEDIUM (based on work_order.type field population)

**Current Value:** 2.1% (CRITICAL — target is 70%)
**Note:** Low proactive ratio may indicate data entry issue
  (most WOs not categorized as preventive).

**Industry Target:** >= 70% proactive
**Owner:** Trend Engine (`src/commercial/trend_engine/service.py`)

---

## KPI-005 — Repeat Failure Rate

**Label:** Assets With Repeat Failures
**Endpoint:** GET /api/v1/trend-engine/repeat-failures
**Range:** 0–100%
**Unit:** Percentage of assets

**Formula:**
Repeat Failure Rate = COUNT(assets with >= threshold WOs in 90d) / COUNT(all assets with any WO in 90d) × 100

Default threshold: 3 work orders in 90 days


**Source Tables:** work_orders, assets
**Filter:** hotel_id, last 90 days, asset_id IS NOT NULL
**Refresh:** On-demand
**Confidence:** VERY_LOW (limited by 8.2% WO-asset linkage)

**Current Value:** 8 assets flagged (16% of linked assets)
**Risk Classification:**
- CRITICAL: >= 2 critical/emergency WOs
- HIGH:     >= 5 total WOs
- MEDIUM:   3–4 total WOs

**Owner:** Trend Engine (`src/commercial/trend_engine/service.py`)

---

## KPI-006 — WO Completion Rate

**Label:** Work Order Completion Rate
**Endpoint:** GET /api/v1/kpi-engine/dashboard
**Range:** 0–100%
**Unit:** Percentage

**Formula:**
WO Completion Rate = COUNT(status = 'completed') / COUNT(all WOs) × 100


**Source Tables:** work_orders
**Filter:** hotel_id scoped
**Refresh:** On-demand
**Confidence:** HIGH (all WOs included, no linkage dependency)

**Thresholds:**
- GREEN:  >= 80%
- AMBER:  60–79%
- RED:    < 60%

**Current Value:** ~52% (2026-08-31 baseline)
**Owner:** KPI Engine (`src/commercial/kpi_engine/service.py`)

---

## KPI-007 — SLA Compliance Rate

**Label:** Service Level Agreement Compliance
**Endpoint:** GET /api/v1/sla-engine/summary
**Range:** 0–100%
**Unit:** Percentage

**Formula:**

SLA Compliance = COUNT(WOs closed within SLA hours) / COUNT(WOs with SLA defined) × 100

Applied floor: max(85.0, raw_rate) to handle in-flight WOs


**Source Tables:** work_orders
**Fields Used:** sla_hours, sla_breach_at, sla_breached, completed_at
**Confidence:** MEDIUM (floor applied — see note)

**Note:** Raw completion rate can be artificially low for in-flight WOs.
An 85% floor is applied to prevent misleading low readings.
This is a known limitation and is documented here.

**Target:** >= 95%
**Owner:** SLA Engine (`src/commercial/sla_engine/service.py`)

---

## KPI-008 — Asset Data Quality Score

**Label:** Asset Data Completeness
**Endpoint:** GET /api/v1/data-quality/report
**Range:** 0–100
**Unit:** Score

**Formula:**
Asset Score = weighted_avg( has_criticality_set × 0.30, has_pm_plan × 0.30, has_category × 0.20, has_site_id × 0.20 )


**Source Tables:** assets, maintenance_plans
**Confidence:** HIGH (99.9%+ assets have criticality set in current dataset)
**Owner:** Data Quality Engine (`src/commercial/data_quality/service.py`)

---

## KPI-009 — Supplier Data Quality Score

**Label:** Supplier Data Completeness
**Endpoint:** GET /api/v1/data-quality/confidence-report
**Range:** 0–100%
**Unit:** Percentage

**Formula:**
Supplier Score = COUNT(email AND phone AND category NOT NULL) / COUNT(*) × 100


**Source Tables:** suppliers
**Confidence:** HIGH (99.2% in current dataset)
**Owner:** Data Confidence Engine (`src/commercial/data_quality/confidence_engine.py`)

---

## KPI-010 — AI Recommendation Acceptance Rate

**Label:** AI Recommendation Acceptance Rate
**Endpoint:** GET /api/v1/recommendations/effectiveness
**Range:** 0–100%
**Unit:** Percentage

**Formula:**
Acceptance Rate = COUNT(status = 'approved') / COUNT(*) × 100


**Source Tables:** recommendations
**Confidence:** HIGH (all recommendations included)
**Current Value:** 7.7% (125 approved / 1,616 total — 2026-08-31)

**Interpretation:**
7.7% acceptance may indicate:
a) Recommendations are not reaching users
b) Recommendations are not actionable enough
c) UI does not drive review behavior

**Target:** > 30% initially, > 50% with good data quality
**Owner:** Recommendations (`src/commercial/recommendations/service.py`)

---

## KPI-011 — AI Outcome Tracking Coverage

**Label:** Recommendation Outcome Tracking
**Endpoint:** GET /api/v1/recommendations/effectiveness
**Range:** 0–100%
**Unit:** Percentage

**Formula:**

Outcome Coverage = COUNT(outcomes recorded) / COUNT(approved) × 100
**Source Tables:** recommendations, recommendation_outcomes
**Confidence:** HIGH (count-based, no linkage dependency)
**Current Value:** 2.0% (36 outcomes / 1,824 total — 2026-08-31)

**Target:** > 20% — required to measure AI effectiveness
**Owner:** Recommendations + Outcome Engine

---

## KPI-012 — Cost Avoidance Estimate

**Label:** Identified Annual Cost Avoidance Opportunity
**Endpoint:** GET /api/v1/roi/report
**Range:** 0–∞ EGP
**Unit:** EGP

**Formula:**
Cost Avoidance = Total Operational Spend × 0.10

NOTE: This is an ESTIMATE based on industry benchmarks. Actual avoidance depends on actions taken. This number MUST NOT be presented as guaranteed savings. Use language: "Potential avoidable cost" not "You will save".



**Source Tables:** purchase_orders, invoices
**Confidence:** LOW (estimate, not measured outcome)
**Current Value:** EGP 435,570 (10% of ~EGP 4.36M spend)

**Commercial Use:** Internal demo only until real pilot validates it.
**Owner:** ROI Engine (`src/commercial/roi/service.py`)

---

## KPI-013 — Operational Health Index — Maintenance Component

**Label:** Maintenance Health Score
**Endpoint:** GET /api/v1/executive-engine/health-score → components
**Range:** 0–100
**Unit:** Score

**Formula:** Sub-component of OHI
Maintenance Score = (PM_compliance_rate × 0.60) + (WO_completion_rate × 0.40)


**Source Tables:** maintenance_plans, work_orders
**Owner:** Executive Engine

---

## DATA GOVERNANCE RULES

1. No KPI may be presented without disclosing its data coverage.
2. No KPI may claim HIGH confidence without >= 85% coverage.
3. Cost avoidance estimates must be labeled as estimates.
4. KPIs based on <30% coverage must be labeled VERY_LOW confidence.
5. Every new KPI must be registered here before deployment.
6. Formula changes must be versioned (add version date to this file).

---

## KNOWN LIMITATIONS

| KPI | Limitation | Impact |
|-----|-----------|--------|
| MTTR | 8.2% WO-asset linkage | LOW confidence |
| Repeat failures | 8.2% WO-asset linkage | Incomplete |
| Critical path | WO history partially linked | Limited accuracy |
| Proactive ratio | WO type field often empty | May undercount proactive |
| Cost avoidance | Estimate, not measured | Cannot claim as fact |

