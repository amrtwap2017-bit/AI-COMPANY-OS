# CURRENT_PROGRESS.md

Last Updated: August 2026

## TEST STATUS — MILESTONE ACHIEVED
Tests passing: 126
Tests skipped: 18 (known: unregistered modules, performance)
Tests failing: 0
Server: localhost:8030
Login: WORKING

## Session Summary
Start: 40 passing
End:   126 passing (+215%)
Commits: 39 on main

## Architecture (verified)
Entry: src/main.py (uvicorn src.main:app)
hotel_id = tenant identifier (923 uses)
get_hotel_id in src/core/tenant.py = JWT auth
Rate limit: RATE_LIMIT_MAX=10000 (dev-friendly)

## DO NOT TOUCH
src/main.py - stable
src/commercial/auth/router.py - stable

## Next Actions
1. Sprint-001 CRM portal (portal/app/(app)/crm/)
2. Test coverage for src/commercial/ modules
3. HR domain implementation (Sprint-019)
4. Financial GL (Sprint-015)
