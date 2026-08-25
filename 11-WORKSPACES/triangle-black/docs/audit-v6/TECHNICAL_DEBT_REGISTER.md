# Technical Debt Register
## A-001 Audit — August 2026

### DEBT-001: main.py Monolith (8,560 lines)
- Type: Architecture
- Impact: HIGH — unmaintainable, hard to test
- Effort: HIGH — 20+ sprints at 10 routes each
- Strategy: Freeze + progressive extraction
- Progress: 13 modules extracted (A-007 batches 1-7)
- Remaining: ~198 routes to extract

### DEBT-002: 70/122 Routers Missing Full DDD
- Type: Architecture  
- Impact: MEDIUM — business logic in wrong layer
- Effort: MEDIUM — 10 routers/sprint
- Strategy: Priority by business value (financial first)
- Progress: 52/122 complete (43%)

### DEBT-003: 152 Inline create_engine() Calls
- Type: Infrastructure
- Impact: HIGH — connection pool exhaustion risk under load
- Effort: LOW/MEDIUM — find all, replace with SessionLocal
- Strategy: Fix in each extracted module (A-007)

### DEBT-004: 86 Broad except Exception Blocks
- Type: Error Handling
- Impact: MEDIUM — silent failures reach production
- Effort: MEDIUM — requires typed exception hierarchy
- Strategy: Build src/core/exceptions.py, replace progressively

### DEBT-005: 309 Raw SQL in main.py
- Type: Architecture
- Impact: MEDIUM — business logic in wrong layer
- Effort: HIGH — migrate to repository pattern
- Strategy: Fix as routes extracted in A-007

### DEBT-006: 1 Direct localhost:8030 Fetch
- Type: Frontend
- Impact: HIGH — breaks in production
- Effort: LOW — single file fix
- Strategy: IMMEDIATE fix

### DEBT-007: PM Plans 404
- Type: Product
- Impact: CRITICAL — breaks operations loop
- Effort: LOW — routing fix
- Strategy: IMMEDIATE fix
