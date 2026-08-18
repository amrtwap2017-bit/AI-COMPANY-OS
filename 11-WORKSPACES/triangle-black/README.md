# Triangle Black

Enterprise AI Operations Platform for hotel engineering, maintenance, procurement and asset management.

## Quick Start

bash START.sh

Backend: http://localhost:8030
Portal: http://localhost:3000
Login: amr@triangleblack.com / admin123

## Tech Stack (Current)

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12 + FastAPI |
| ORM | SQLAlchemy + Alembic |
| Database | PostgreSQL |
| Frontend | Next.js 14 App Router |
| Auth | JWT HS256 via TB_SECRET_KEY |
| Cache | Redis + in-memory fallback |
| AI | Ollama local + AIGateway |
| Tests | pytest + Playwright E2E |

## Key Commands

Run everything: bash START.sh
Run tests: .venv/bin/python -m pytest tests/ -q --tb=no
Run E2E: cd portal && npx playwright test e2e/
Migrations: .venv/bin/alembic upgrade heads
Seed demo: .venv/bin/python3 scripts/seed_demo_tenant.py

## Architecture Notes

The original ADR documents describe NestJS plus Prisma plus schema-per-tenant.
The actual implementation is Python FastAPI plus SQLAlchemy plus row-level hotel_id.
This reflects a deliberate technology pivot during development.
See 00-ARCHITECT/ARCHITECTURE_REALITY.md for the full comparison.
See docs/upgrade-analysis/00_EXECUTIVE_SUMMARY.md for current maturity scores.
