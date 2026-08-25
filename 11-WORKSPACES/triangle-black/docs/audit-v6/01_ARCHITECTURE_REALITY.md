# Architecture Reality
## A-001 Audit — August 2026

### Overall Pattern
- **Type**: Modular monolith with DDD repository pattern
- **NOT microservices** — intentionally, correctly for current stage
- **Entry point**: src/main.py (single file — 8,560 lines)

### Verified Measurements
| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| main.py lines | 8,560 | < 4,000 | 4,560 to extract |
| @app routes | 211 | 0 (all in routers) | 211 to move |
| Raw SQL in main.py | 309 | 0 | 309 to migrate |
| Inline create_engine() | 152 | 0 | 152 to fix |
| Broad except blocks | 86 | 0 | 86 to type |
| Full DDD modules | 52/122 (43%) | 122/122 | 70 incomplete |

### DDD Compliance
Full DDD = has models.py + schemas.py + repository.py + router.py
- 52 modules: FULLY COMPLIANT
- 70 modules: router-only or missing repository/models

### Architecture Strengths
- DDD layer separation working correctly in 43% of modules
- Application service layer present
- Event outbox pattern implemented
- Workflow engine operational (TriangleWorkflowEngine)
- SLA engine operational
- Redis/cache hybrid layer
- Correlation ID middleware on all responses

### Architecture Risks
1. main.py monolith — hard to test, hard to audit, hard to extract
2. 152 inline create_engine() — potential connection pool exhaustion
3. 309 raw SQL in main.py — business logic in wrong layer
4. 86 broad except blocks — silent failure swallowing

### Fix Strategy
- Freeze: no new business logic in main.py
- Extract: 10 routes/sprint → dedicated router files
- Migrate: raw SQL → repository pattern (by business value)
- Target: main.py < 4,000 lines (from 8,560)
