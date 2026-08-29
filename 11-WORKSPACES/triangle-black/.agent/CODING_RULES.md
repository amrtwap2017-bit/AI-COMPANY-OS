# Triangle Black — Coding Rules

## Python
  Always use: from __future__ import annotations
  Always try/except around DB queries
  Always rollback on DB error
  Never hardcode hotel_id (use Depends(get_hotel_id))
  Use text() with parameterized queries only
  Never string-format SQL

## FastAPI
  All endpoints need: current_user=Depends(get_current_user)
  All endpoints need: hotel_id: str = Depends(get_hotel_id)
  Positional params before Depends params
  Use Body(...) for JSON body endpoints (not File+Body together)

## TypeScript
  No new @ts-nocheck additions
  Prefer: authFetch() over raw fetch()
  Use tb- classes over inline style={{...}}

## Git
  Commit format: feat/fix/refactor/security/perf/test/docs(scope): message
  One logical change per commit
  Always run: .venv/bin/python -m pytest tests/ -q --tb=no before commit
  Always run: Build Guard script before commit

## Testing
  NEVER write fake tests that always pass
  NEVER disable failing tests
  ALWAYS verify runtime behavior, not just syntax
