# V10 AI BASELINE
Generated: 2026-09-09 08:53
Status: VERIFIED from live database

---

## Recommendation Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total recommendations | 6,709 | — | — |
| Pending | 1,106 | <200 | 🔴 |
| Approved | 535 | — | — |
| Rejected | 135 | — | — |
| Acceptance rate | 8.0% | >20% | 🔴 |

## By Director and Status

| Director | Status | Count |
|----------|--------|-------|
| AI Executive Analyst | archived | 1,370 |
| AI Executive Analyst | pending | 302 |
| AI Maintenance Director | archived | 1,131 |
| AI Maintenance Director | approved | 304 |
| AI Maintenance Director | pending | 200 |
| AI Maintenance Director | rejected | 58 |
| AI Operations Director | archived | 1,062 |
| AI Operations Director | pending | 302 |
| AI Operations Director | approved | 231 |
| AI Operations Director | rejected | 77 |
| AI Procurement Director | archived | 1,370 |
| AI Procurement Director | pending | 302 |


## Daily Generation Pattern (last 10 days)

| Date | Count |
|------|-------|
| 2026-09-09 | 1,133 |
| 2026-09-08 | 260 |
| 2026-09-04 | 260 |
| 2026-09-03 | 156 |
| 2026-09-02 | 260 |
| 2026-09-01 | 2,084 |
| 2026-08-31 | 1,044 |
| 2026-08-30 | 468 |
| 2026-08-29 | 1,044 |


## AI Architecture Status

| Component | Status | File |
|-----------|--------|------|
| Recommendations service | ✅ | recommendations/service.py |
| Daily digest endpoint | ✅ | recommendations/router.py |
| Generate endpoint | ✅ | recommendations/router.py |
| Approve/Reject endpoints | ✅ | recommendations/router.py |
| Outcome tracking | ✅ | service.py |
| Effectiveness tracking | ✅ | service.py |
| Deduplication (EXISTS check) | ✅ | service.py |
| Daily cap | ❌ REMOVED | Architectural decision |

## AI Quality Problems

| Problem | Impact | V10 Action |
|---------|--------|-----------|
| 8% acceptance rate | Recommendations ignored | V10-008: ranking + dedup |
| Duplicates per director per day | Queue bloat | V10-008: generation-time dedup |
| No urgency/expiry on recs | Stale items in queue | V10-008: add expiry field |
| No duplicate_key field | Can't detect semantic duplicates | V10-008: add field |
| Low data quality → low relevance | Wrong recommendations | V10-006: fix data first |

## V10-008 AI Recommendation 2.0 Plan

Required new fields:
- duplicate_key (hash of director+risk_level+recommendation[:100])
- expiry_date (auto-expire after 30 days if not actioned)
- urgency_level (IMMEDIATE/TODAY/THIS_WEEK/MONITOR)
- affected_asset_id (link to specific asset)
- affected_wo_id (link to specific WO)
- estimated_impact (quantified where possible)
- model_version (which director logic generated this)

Required logic changes:
- Generation-time dedup: check duplicate_key before INSERT
- Auto-expire: mark stale recs as expired daily
- Ranking: CRITICAL + high confidence → top of queue
- Daily digest: show top 5 per director, not all pending
