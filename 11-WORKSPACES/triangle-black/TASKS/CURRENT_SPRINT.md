# CURRENT_SPRINT.md — Triangle Black

Sprint Goal: Fix DEFAULT_HOTEL fallback P0 + run tests

## Status
AI Factory: COMPLETE
Security audit: COMPLETE (found hotel_id pattern)
Now: Fix DEFAULT_HOTEL + verify JWT source

## Key Finding
hotel_id IS the tenant identifier (923 uses)
tenant_id is not used in code (0 uses)
Documentation was wrong — now corrected

## Active Tasks

| ID | Task | Priority | Status |
|----|------|----------|--------|
| P0-FIX-001 | Remove DEFAULT_HOTEL fallback from all repositories | P0 | Active |
| P0-FIX-002 | Verify hotel_id comes from JWT not user input | P0 | Active |
| DEV-001 | Install httpx to fix test import error | P1 | Done |
| DEV-002 | Run full test suite and report results | P1 | Active |
| DOC-001 | Update all docs hotel_id vs tenant_id | P2 | Active |

## Acceptance Criteria
- Zero DEFAULT_HOTEL fallbacks in repository.py files
- All hotel_id values sourced from JWT token only
- Tests run without import errors
- Test pass rate documented
