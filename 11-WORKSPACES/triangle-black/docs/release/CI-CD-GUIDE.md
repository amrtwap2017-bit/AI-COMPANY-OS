# CI/CD Pipeline Guide — Triangle Black

## Pipeline Stages

1. **lint-and-compile**: Verifies `src/main.py` compiles cleanly with Python 3.12
2. **backend-tests**: Runs pytest against a fresh PostgreSQL 16 container
3. **build-guard**: Validates Build Guard checks (inline styles, duplicate routes, placeholder pages)

## Trigger Conditions
- Push to `main` branch
- Pull request targeting `main`

## Required Secrets
- `DATABASE_URL`: PostgreSQL connection string for CI database

## Local Equivalent
```bash
bash START.sh
.venv/bin/python -m pytest tests/ -q --tb=no | tail -5
Rollback Procedure
See: docs/release/ROLLBACK.md
