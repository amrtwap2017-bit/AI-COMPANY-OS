# V8-001 AUDIT — 02 INTELLIGENCE LOOP AUDIT
Date: 2026-08-31
Source: Live DB verification

---

## LOOP MEASUREMENT

Signal → Recommendation → Decision → Action → Outcome → Learning

| Stage | Measurement | Status | Evidence |
|-------|------------|--------|----------|
| 1. SIGNAL | Critical WOs + overdue PM exist | ✅ GOOD | Real operational problems found |
| 2. RECOMMENDATION | 1,824+ generated | ✅ GOOD | AI directors producing output |
| 3. DECISION | 7.7% acceptance | ❌ CRITICAL | 90%+ never reviewed = fatigue |
| 4. ACTION | Workflow audit events exist | ✅ PARTIAL | workflow_events table has no hotel_id |
| 5. OUTCOME | 40.7% of approved recorded | ✅ GOOD | Major improvement from 1.2% |
| 6. LEARNING | 1,932 KPI snapshots | ✅ GOOD | ROI measurement infrastructure exists |

## CRITICAL FINDING: LOOP IS WEAK AT STEP 3

The primary bottleneck is recommendation fatigue.
- 1,460+ recommendations in 'pending' status (never reviewed)
- Daily digest (top 5) was built to address this → needs UI integration
- Action queue (P0/P1 priority) was built → needs UI integration

The loop is NOT broken — it is weakly connected at the decision stage.

## SCHEMA GAP DISCOVERED

workflow_events table has NO hotel_id column.
SQL: `SELECT COUNT(*) FROM workflow_events WHERE hotel_id=:h` → ERROR

This means:
- Workflow events cannot be tenant-scoped for reporting
- The audit trail for workflow transitions uses platform_audit_log instead
- platform_audit_log does have hotel_id and IS working

Priority: MEDIUM — does not block pilot but must be fixed before reporting.

## POSITIVE FINDINGS

AI Outcome Tracking: 40.7% (was 1.2% in V7)
This is a 34x improvement. The outcome tracking infrastructure works.
What is needed: make it easy for users to record outcomes in the UI.

KPI Snapshots: 1,932 recorded
Before/after comparison infrastructure exists and works.

## LOOP VERDICT

Current state: WEAKLY FUNCTIONAL
Primary blocker: Recommendation fatigue (90%+ never reviewed)
Secondary gap: No UI surfaces for daily-digest or action-queue
Tertiary gap: workflow_events schema missing hotel_id

What makes the loop close for a REAL customer:
1. Daily digest visible on login screen (not buried in API)
2. Action queue as primary dashboard widget
3. One-click outcome recording after taking action
4. Automatic ROI delta after 30 days

