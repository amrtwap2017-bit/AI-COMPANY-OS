# Performance Baseline (N-001 Verified)

| Endpoint | Latency | DB Queries | Status |
|---|---|---|---|
| /api/v1/platform/status | ~38ms | 9 | 🟢 PASS |
| /api/v1/platform/procurement | ~15ms | 6 | 🟢 PASS |
| /api/v1/platform/assets | ~14ms | 5 | 🟢 PASS |
| /api/v1/work-orders/?limit=20 | ~14ms | 1 | 🟢 PASS |
| /api/v1/assets/?limit=20 | ~11ms | 1 | 🟢 PASS |
| /api/v1/invoices/?limit=20 | ~27ms | 1 | 🟢 PASS |
| /api/v1/twin/state | ~15ms | 8 | 🟢 PASS |
| /api/v1/ai-gateway/registry | ~5ms | 0 | 🟢 PASS |

**SLA Target:** p95 < 300ms for reads, < 500ms for mutations
**Current Status:** ALL READ ENDPOINTS WITHIN SLA
