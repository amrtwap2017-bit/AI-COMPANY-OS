# TRIANGLE BLACK — ARCHITECTURE CONSTITUTION
Version: V9
Date: 2026-09-08

## ABSOLUTE RULES

### Rule 1: No new code in main.py
main.py is orchestration ONLY:
- app = FastAPI(...)
- middleware registration
- router include_router()
- startup/shutdown events
- health endpoints (exception — these are infrastructure)

NEVER in main.py:
- create_engine()
- sessionmaker()
- business logic
- SQL queries
- tenant resolution
- AI logic
- route handlers with business logic

### Rule 2: Single database connection
ONLY src/core/database.py may call create_engine()
All other files must use: from src.core.database import get_db, engine

### Rule 3: Auth on every mutation
Every @router.post, @router.patch, @router.delete, @router.put
MUST have either:
  current_user: User = Depends(get_current_user)
OR:
  dependencies=[Depends(get_current_user)]

### Rule 4: hotel_id from JWT only
hotel_id MUST come from get_hotel_id() dependency
NEVER from request body or query params for tenant-scoped data

### Rule 5: No new architectural patterns without ADR
Create docs/adr/ADR-XXX-description.md before implementing

## CANONICAL LAYERS

Request → Router → ApplicationService → Repository → Database
                ↕
           Domain Logic

## DATABASE ACCESS HIERARCHY

src/core/database.py       — CANONICAL: engine, SessionLocal, get_db
src/core/tenant.py         — CANONICAL: get_hotel_id from JWT
src/*/repositories/*.py    — ALLOWED: use get_db
src/*/services/*.py        — ALLOWED: use repositories
src/*/router.py            — ALLOWED: Depends(get_db), Depends(get_hotel_id)
src/main.py                — ALLOWED: only for health check fallback
scripts/                   — ALLOWED: standalone scripts only
tests/                     — ALLOWED: test fixtures only
