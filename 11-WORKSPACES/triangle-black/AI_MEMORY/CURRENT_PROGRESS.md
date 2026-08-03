# CURRENT_PROGRESS.md

Last Updated: August 2026

## Test Status — STABLE BASELINE
Tests passing: 109
Tests skipped: 19
Tests failing: 28
Server: RUNNING at localhost:8030
Login: WORKING

## DO NOT TOUCH
src/main.py — working, stable
src/commercial/auth/router.py — working, stable
Rate limiters — do not modify

## Remaining 28 Failures (to fix carefully)
Run: .venv/bin/python -m pytest tests/ -q --tb=no 2>&1 | grep FAILED

## Architecture
Entry: src/main.py (uvicorn src.main:app)
hotel_id = tenant identifier
get_hotel_id in src/core/tenant.py = JWT auth

## Next Priority
1. Fix 28 failures
2. Sprint-001 CRM portal work
3. Test coverage improvement
