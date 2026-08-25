# DISCOVERY-003 — Real Test Baseline: 2387 passing, 30 failing

Discovered: 2026-08-25
Session: AI Engineering OS bootstrap
Classification: BASELINE_ESTABLISHED

## Summary
AGENT_HANDOFF.md reported 158+ tests.
Actual run: 2387 passed, 30 failed, 31 skipped, 78 deselected.
The project has significantly more test coverage than documented.

## Classified Failures (all pre-existing)

### HIGH — Alembic Migration
test_sprint249_indexes_isolation.py::test_alembic_head_is_e2f3a4b5c6d7
Root cause: Alembic head revision mismatch (employees/gl/eta created via SQL)
Fix: Proper migration repair sprint

### MEDIUM — Cache API
test_sprint197_cache.py (5 failures) — TypeError in cache API
Fix: Review cache service interface changes

### MEDIUM — Middleware/Endpoints
test_sprint_c002, test_sprint_n004, test_sprint_n005, test_sprint_p010
Fix: Missing endpoint implementations or config

### LOW — Infrastructure checks
test_sprint205_docker.py (2), test_sprint_c001 (1)
Fix: Docker compose structure / CI file path checks

## Action
Add to N-FIX sprint backlog.
Do not introduce new test failures.
New baseline: 2387 passing.
