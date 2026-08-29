# Architecture State — 2026-08-29

## Backend
- Framework: FastAPI (Python 3.12)
- Database: PostgreSQL 15 + SQLAlchemy ORM
- Cache: Redis
- Auth: JWT (hotel_id claim)
- Pattern: DDD repositories + application services

## Key Modules (src/commercial/)
- onboarding/ — self-service provisioning ✅
- data_import/ — CSV import suite ✅
- recommendations/ — AI→Human decision loop ✅
- roi/ — KPI snapshot + delta ✅
- digital_twin/ — impact chain analysis ✅
- ai_directors/ — 4 governed directors ✅

## Technical Debt
- src/main.py: ~8,900 lines (needs extraction)
- 294 @ts-nocheck in portal/lib/
- 1,184 inline styles in portal pages

## Architecture Health: GOOD
