# V7 AUDIT — 07 SECURITY AUDIT
Date: 2026-08-31
Status: PARTIAL — endpoints verified, penetration not performed

---

## CRITICAL SECURITY FINDINGS

### FINDING 1 — UNAUTHENTICATED ENDPOINTS IN main.py

Status: CRITICAL P0

The following endpoints in main.py lack visible Depends(get_current_user):

RBAC mutations (HIGH RISK):
  L336: POST /api/v1/rbac/users/{user_id}/role
  L360: GET  /api/v1/rbac/users

Operations (HIGH RISK):
  L1041: POST /api/v1/work-orders/{wo_id}/complete
  L1067: GET  /api/v1/work-orders-sync/assets
  L1093: GET  /api/v1/service-requests/{sr_id}/work-order

Data access (MEDIUM RISK — may have auth inside function body):
  L880:  GET  /api/v1/ai/signals/summary
  L910:  GET  /api/v1/stock-balances/
  L940:  GET  /api/v1/rfqs/
  L975:  GET  /api/v1/pm-plans/
  L1026: GET  /api/v1/payment-tracking/

NOTE: Some of these may have auth inside the function body via
get_hotel_id() which does NOT raise 401 without JWT.
This means the endpoint may return data from DEFAULT_HOTEL_ID
without authentication — a data exposure risk.

### FINDING 2 — 308 ROGUE create_engine() CALLS

Status: CRITICAL P0

308 inline create_engine() calls inside route handlers.

Pattern:
  eng = create_engine(os.environ.get("DATABASE_URL","..."))
  with eng.connect() as conn: ...

Risk: Each API call creates a new SQLAlchemy engine + connection pool.
Under concurrent load, this will exhaust PostgreSQL connections.
This is a stability risk for any real-load scenario.

### FINDING 3 — RBAC ENDPOINT AUTH UNCLEAR

Status: HIGH P1

POST /api/v1/rbac/users/{user_id}/role at L336
appears to use:
  _admin: str = Depends(require_admin)
but this was confirmed in V6 as WORKING.

Need to verify require_admin actually enforces JWT.
Need to verify the endpoint cannot be accessed without auth.

### FINDING 4 — JWT TOKEN HANDLING IN main.py

Evidence (from grep):
  L287: manual JWT decode via token.split(".")
  L2622: manual JWT decode via raw_token.split(".")
  L2710-2718: change-password with manual token extraction

Manual JWT parsing is risky. Should use jose/python-jose library
consistently. Verify these paths don't have timing attacks or
signature bypass vulnerabilities.

## POSITIVE FINDINGS

| Area | Status | Evidence |
|------|--------|----------|
| Tenant isolation | ✅ VERIFIED | 0 NULL hotel_ids in 6 critical tables |
| Rate limiting | ✅ PRESENT | DISABLE_RATE_LIMIT env flag exists |
| Per-tenant rate limiting | ✅ PRESENT | Sprint 195 added it |
| Build Guard | ✅ PASSING | 0 issues on every commit |
| Backup | ✅ ACTIVE | Cron running, files present |
| Audit log | ✅ ACTIVE | 7,163 events recorded |
| CORS | UNVERIFIED | Need to check production config |

## REQUIRED ACTIONS

1. Audit ALL 224 route decorators in main.py for auth
2. Fix RBAC mutations to require explicit JWT auth
3. Fix WO complete endpoint to require explicit JWT auth  
4. Replace manual JWT parsing with library calls
5. Create automated security regression test for all endpoints
6. Document intentionally public endpoints

