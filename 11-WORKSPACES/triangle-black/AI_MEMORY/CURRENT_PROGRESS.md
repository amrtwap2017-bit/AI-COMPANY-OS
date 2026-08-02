# CURRENT_PROGRESS.md — Triangle Black

Last Updated: August 2026

## Phase 0: AI Software Factory

Status: COMPLETE
Committed: bf856701
Files: 72 new files, 3339 insertions

## Security Audit Results

hotel_id is the tenant identifier (923 uses)
get_hotel_id dependency in src/core/tenant.py extracts from JWT

Safe routers (using Depends): 24
Fixed routers (ai_scheduling): 3 endpoints fixed
Remaining path params: hotels/router.py (intentional admin endpoints)
DEFAULT_HOTEL fallback: exists in tenant.py as safety net (P2, not P0)

Commits:
  099f2f99 fix(security): document P0 tenant isolation gaps
  7331c4f6 fix(docs): correct security model hotel_id is tenant identifier
  4c9536cd fix(security): P0 hotel isolation in ai_scheduling router

## Test Status

Runner: .venv/bin/python -m pytest
Results: 40 passed, 3 failed, 103 errors
Errors: import/config issues not code bugs (need conftest fix)

Failing tests:
  test_api_endpoints.py::TestHealth::test_health
  test_core_apis.py::TestWorkOrders::test_limit_enforced
  test_twin.py::test_twin_no_critical_open

## Sprint Status

| Sprint | Status | Backend | Portal | Tests |
|--------|--------|---------|--------|-------|
| Sprint-000 | Done | Done | Done | Partial |
| Sprint-001 | Active | Done | Partial | Missing |
| Sprint-010 | Active | Done | Partial | Missing |

## Next Actions

1. Fix 3 failing tests
2. Fix hotels/router.py undefined hotel_id bug
3. Fix 103 test errors (conftest issue)
4. Sprint-001 portal completion
