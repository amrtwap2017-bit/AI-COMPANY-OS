# CURRENT_PROGRESS.md

Last Updated: August 2026

## Test Status
Start of session: 40 passed
Current best:     127 passed (before regression)
After regression fix: 111 passed
Target: 130+ passed

## Pending Issues
1. Rate limit fix needs server restart to take effect
2. quotes tests 429 in suite (pass alone)
3. analytics/sla no route
4. customers URL mismatch

## Key Facts
- Entry point: src/main.py (uvicorn src.main:app)
- Rate limiter: src/commercial/auth/router.py
  - Was: 5 attempts, 900s lockout
  - Now: 20 attempts, 60s lockout
- hotel_id = tenant identifier (923 uses)
- get_hotel_id in src/core/tenant.py extracts from JWT

## Next Session
1. Restart server (Step 1 above)
2. Run full suite (Step 2)
3. Fix remaining failures with Qwen
4. Target 130+ then move to Sprint-001 portal work
