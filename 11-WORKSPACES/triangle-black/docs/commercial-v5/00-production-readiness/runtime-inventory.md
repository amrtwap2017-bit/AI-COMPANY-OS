# Production Truth Matrix — N-001 Verification
**Date:** August 2026
**Method:** Runtime API probing + repository inspection

| Area | Claimed | Verified | Evidence | Risk |
|---|---|---|---|---|
| Authentication (JWT Login) | ✅ | ❌ FAIL | `POST /api/v1/auth/login` | HIGH |
| Tenant Isolation (hotel_id) | ✅ | ❌ FAIL | `GET /api/v1/work-orders/` | HIGH |
| Workflow Engine | ✅ | ❌ FAIL | `GET /api/v1/workflow/instances` | HIGH |
| AI Gateway Registry | ✅ | ❌ FAIL | `GET /api/v1/ai-gateway/registry` | HIGH |
| Digital Twin State | ✅ | ❌ FAIL | `GET /api/v1/twin/state` | HIGH |
| Platform Status (Cached) | ✅ | ❌ FAIL | `GET /api/v1/platform/status` | HIGH |
| Procurement Read Model | ✅ | ❌ FAIL | `GET /api/v1/platform/procurement` | HIGH |
| Asset Read Model | ✅ | ❌ FAIL | `GET /api/v1/platform/assets` | HIGH |
| Executive Dashboard | ✅ | ❌ FAIL | `GET /api/v1/executive-dashboard/` | HIGH |
| Event Outbox | ✅ | ✅ PASS | `src/core/events.py exists` | Low |
| SLA Scanner | ✅ | ✅ PASS | `src/core/sla_scanner.py exists` | Low |
| Cache Layer | ✅ | ❌ FAIL | `GET /api/v1/cache/status` | HIGH |
| Health Live | ✅ | ❌ FAIL | `GET /api/v1/health/live` | HIGH |
| Health Ready | ✅ | ❌ FAIL | `GET /api/v1/health/ready` | HIGH |
| Security Headers | ✅ | ✅ PASS | `Middleware verified in src/main.py` | Low |
| Performance Telemetry | ✅ | ✅ PASS | `X-Response-Time-Ms header present` | Low |
| Rate Limiting | ✅ | ✅ PASS | `X-RateLimit-Limit header present` | Low |
| Backup/Restore | ✅ | ❌ FAIL | `No automated backup cron verified` | HIGH |
| Monitoring/Alerting | ✅ | ❌ FAIL | `No external monitoring integration verified` | HIGH |
| Disaster Recovery | ✅ | ❌ FAIL | `No DR runbook verified` | HIGH |
