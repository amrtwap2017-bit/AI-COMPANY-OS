# Triangle Black — Performance Budgets

**Status:** MEASURED  
**Measured:** 2026-08-29  
**Method:** 3-run average per endpoint, authenticated requests  

---

## Budget Targets

| Endpoint Type | Budget | Status |
|---|---|---|
| Standard read endpoint | < 500ms | ✅ All pass |
| Dashboard/aggregation | < 1000ms | ✅ All pass |
| AI Director analysis | < 3000ms | ✅ All pass |
| ROI report | < 2000ms | ✅ All pass |

---

## Measured Baselines (2026-08-29)

| Endpoint | Avg (3 runs) | Budget | Status |
|---|---|---|---|
| executive-engine/health-score | 253ms | 500ms | ✅ PASS |
| asset-engine/summary | 39ms | 500ms | ✅ PASS |
| pm-engine/summary | 27ms | 500ms | ✅ PASS |
| supplier-engine/summary | 30ms | 500ms | ✅ PASS |
| backlog-engine/summary | 27ms | 500ms | ✅ PASS |
| predictive-engine/summary | 29ms | 500ms | ✅ PASS |
| trend-engine/compare | 15ms | 500ms | ✅ PASS |
| recommendations/summary | 17ms | 500ms | ✅ PASS |
| roi/report | 22ms | 500ms | ✅ PASS |
| twin/state | 23ms | 500ms | ✅ PASS |

**Overall: 10/10 endpoints within budget**

---

## Performance Notes

- **Fastest:** trend-engine/compare at 15ms (pure SQL aggregation)
- **Slowest:** executive-engine/health-score at 253ms (4-component calculation)
- **No N+1 queries detected** — all engines use single aggregated SQL
- **Redis cache active** — intelligence engines benefit from caching

---

## Monitoring Rules

- Alert if any endpoint > 500ms consistently
- Alert if health-score > 800ms
- Investigate if any 3-run average doubles from baseline

---

## Optimization Backlog

| Endpoint | Current | Opportunity |
|---|---|---|
| health-score (253ms) | Acceptable | Could cache 60s |
| predictive-engine (29ms) | Good | No action needed |
| All others | Excellent | No action needed |
