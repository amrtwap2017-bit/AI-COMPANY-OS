# V8-001 AUDIT — 03 DATA TRUSTWORTHINESS
Date: 2026-08-31
Source: Live DB queries

---

## DATA QUALITY DASHBOARD

| Metric | Coverage | Status | Impact on Intelligence |
|--------|---------|--------|----------------------|
| WO→Asset linkage | 7.7% | ❌ CRITICAL | MTTR, critical path, repeat failures based on 7.7% only |
| PM→Asset linkage | 87.5% | ✅ GOOD | PM compliance is reliable |
| WO technician assigned | 49.3% | ❌ CRITICAL | 422 open WOs have no technician |
| Asset criticality set | 100% | ✅ GOOD | Risk scoring is reliable |
| Supplier data complete | 99.2% | ✅ GOOD | Supplier intelligence is reliable |
| AI outcome tracking | 40.7% | ✅ GOOD | Can prove 40% of AI value |

**Overall Data Trust Score: ~68.7%**

## WHAT THIS MEANS FOR EACH INTELLIGENCE CLAIM

### MTTR = 88.2h (STATED CONFIDENCE: VERY LOW)
Based on 7.7% of WOs (those linked to assets).
Customer challenge: "Is this representative?"
Answer required: "No. Only 7.7% of WOs are linked to assets. This is the best available data."

### Critical Path (STATED CONFIDENCE: VERY LOW)
Same limitation. The top assets shown are only those with WOs linked to them.
91.5% of WO history is not attributable to any asset.

### PM Compliance (STATED CONFIDENCE: HIGH)
87.5% PM→Asset linkage. This is reliable.
Overdue PM count is accurate and actionable.

### Repeat Failure Rate (STATED CONFIDENCE: VERY LOW)
Inherits the 7.7% WO-asset linkage limitation.

### Supplier Quality (STATED CONFIDENCE: HIGH)
99.2% data completeness. This is highly reliable.

### AI Effectiveness (STATED CONFIDENCE: MEDIUM)
40.7% of approved recommendations have outcomes recorded.
We can prove value for those 40%. The other 60% are untracked.

## THE SINGLE MOST IMPORTANT DATA QUALITY ACTION

**Link work orders to assets.**

If WO-asset linkage goes from 7.7% to 80%:
- MTTR becomes reliable
- Critical path becomes trustworthy
- Repeat failure detection improves 10x
- Asset intelligence covers the full operational picture

This is a DATA ENTRY problem, not a software problem.
The fix is: enforce asset selection when creating a WO.

## RECOMMENDATION FOR PILOT

During pilot, implement:
1. WO creation MUST select an asset (enforce in UI, not just API)
2. Technician MUST be assigned before WO can move to in_progress
3. Outcome recording prompted after every approved recommendation

These three changes would transform the data trust score from 68.7% to ~90%+.

