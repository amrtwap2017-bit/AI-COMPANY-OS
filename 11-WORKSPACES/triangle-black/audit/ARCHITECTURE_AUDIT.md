# Architecture Audit

## Actual runtime target

`START.sh`, `start-api.sh`, `Dockerfile`, and `Dockerfile.api` point to `src.main:app`; this is the assessed application. Root `main.py` is a separate 254-line legacy/admin FastAPI application with its own unsafe `safe_include` swallow-and-continue registration and SQLite lead endpoint. It is a duplicate runtime candidate.

## Findings

| Claim | Status | Evidence |
|---|---|---|
| FastAPI / SQLAlchemy / Alembic implementation | VERIFIED | `src/main.py`, `src/core/database.py`, `alembic/` |
| PostgreSQL / Redis production design | PARTIALLY VERIFIED | compose configs declare both; no service reachable locally |
| Next.js 14 | CONTRADICTED | `portal/package.json` declares Next `16.2.10` |
| modular router registration | PARTIALLY VERIFIED | many routers; registration uses broad `try/except` blocks |
| active API healthy | CONTRADICTED | runtime import: 225 routes, 11 critical validator failures; OpenAPI raises Pydantic error |

`src/main.py` is a monolithic append-only registrar. It contains direct endpoints, repeated middleware and import aliases, and many independent `try/except` registrations. One grouped block references undefined `attention_sla_router`; the resulting `NameError` prevents recommendations, evidence, attention SLA, import tracking, adoption, and user management from mounting. Individual imports of those routers succeed.

Routes registered at runtime: 225 method/path pairs; three duplicate method/path pairs. Static decorators: 961 across 173 router files, showing a large gap between code present and active runtime surface. `app.openapi()` fails with `PydanticUserError` for unresolved `AddNoteIn` forward reference. Therefore live OpenAPI cannot be used as a contract.

Background work is FastAPI `BackgroundTasks` and ad hoc service calls; Celery is in requirements but no verified durable queue/job state was demonstrated. ReportLab is in requirements; report capability is only partially verified.
