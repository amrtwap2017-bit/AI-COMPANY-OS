# ADR-001: Database Connection Architecture

Date: 2026-09-08
Status: ACCEPTED
Deciders: Amr Mostafa (Owner), AI Architect

## Context

The codebase has ~308 rogue create_engine() calls scattered across src/main.py
and other files. Each creates an independent connection pool, bypassing:
- Connection pool governance
- Tenant isolation enforcement
- Observability (query count tracking)
- Connection limit management

## Decision

ONE canonical database layer: src/core/database.py

All application code MUST use:
  from src.core.database import get_db, engine, SessionLocal

No file except src/core/database.py may call create_engine().

## Consequences

Positive:
- Single connection pool (5 connections + 10 overflow)
- pool_recycle=3600 prevents stale connections
- pool_pre_ping=True handles disconnections
- All queries counted in X-DB-Query-Count header

Negative:
- Requires progressive migration of ~308 call sites
- Cannot be done in a single sprint

## Migration Strategy

Wave 1: Scripts (standalone) — use engine directly from src.core.database
Wave 2: main.py inline routes — replace local create_engine with shared engine
Wave 3: Router files — use Depends(get_db) pattern
Wave 4: Background tasks — use SessionLocal context manager

## Verification

grep -rn "create_engine(" src/ | grep -v "src/core/database.py" | wc -l
Target: 0
