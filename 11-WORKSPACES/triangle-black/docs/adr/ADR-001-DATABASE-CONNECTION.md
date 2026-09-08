# ADR-001: Database Connection Architecture
Date: 2026-09-08
Status: ACCEPTED

## Context
153 rogue create_engine() calls in main.py (confirmed audit).
Each creates independent pool bypassing governance.

## Decision
ONE canonical layer: src/core/database.py
All code uses: from src.core.database import get_db, engine

## Migration Waves
Wave 1: Scripts → use engine from src.core.database
Wave 2: main.py inline routes → replace local create_engine
Wave 3: Router files → Depends(get_db)
Wave 4: Background tasks → SessionLocal context manager

## Verification
grep -rn "create_engine(" src/ | grep -v "src/core/database.py" | wc -l
Target: 0
