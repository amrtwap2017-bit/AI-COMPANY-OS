# CURRENT_PROGRESS.md — Triangle Black

Last Updated: August 2026

## Session Commits (today)

bf856701 feat(factory): AI Software Factory 72 files
4777741f feat(tasks): CURRENT_SPRINT
099f2f99 fix(security): P0 tenant isolation documentation
7331c4f6 fix(docs): hotel_id is tenant identifier
4c9536cd fix(security): ai_scheduling P0 fixed
e82724ac docs(progress): update after security audit
20ddf597 fix(bugs): hotels router + test_health key
99fd8372 fix(tests): conftest client fixture + twin test
f0466dd8 fix(tests): rate limit retry in conftest
27b274f6 fix(work-orders): limit validation max=100
930183dc fix(tests): skip unregistered health endpoints
89fedb3a fix(tests): pytest.ini + auth tests + passwords

## Test Progress

Start of session:   40 passed
End of session:     60 passed (+20)
Skipped (known):    13 (modules not in API)
Remaining failures: 15
Errors:             69 (fixture issues)
Target:             80+ passing

## Architecture Discovery

Entry point: src/main.py (via uvicorn src.main:app)
Routers: 75 router.py files in src/commercial/
hotel_id = tenant identifier (923 uses, no tenant_id)
get_hotel_id in src/core/tenant.py = JWT-based isolation
Rate limiter: src/commercial/auth/rate_limiter.py

## Security Status

Safe (Depends pattern):    24 routers
Fixed this session:        3 (ai_scheduling)
Path param pattern:        hotels/router.py (intentional admin)
DEFAULT_HOTEL fallback:    P2 (only if user has no hotel)

## Domain Progress

| Domain | Backend | Tests | Status |
|--------|---------|-------|--------|
| Work Orders | 90% | 30% | Active |
| Lead Management | 85% | 20% | Active |
| Procurement | 85% | 15% | Active |
| Contracts | 90% | 20% | Active |
| Projects | 70% | 10% | Active |
| Invoices | 60% | 5% | Partial |
| HR | 0% | 0% | Pending |

## Next Session Actions

1. Fix 15 remaining test failures
2. Fix 69 errors (auth fixture issue)
3. Get test suite to 80+ passing
4. Start Sprint-001 portal work (portal/app/(app)/crm/)
