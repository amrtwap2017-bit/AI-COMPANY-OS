# TRIANGLE BLACK — CONTAINER ARCHITECTURE
Date: 2026-09-01
Status: V8-004 — COMPLETE

---

## SERVICE ARCHITECTURE
Internet (HTTPS only) │ [Nginx] │ ┌────┴────┐ │ │ [API:8030] [Portal:3000] │ [Redis:6379] ← internal only │ [PostgreSQL:5432] ← internal only

## SERVICES INVENTORY

| Service | Image | Port | Public? | Purpose |
|---------|-------|------|---------|---------|
| api | ./Dockerfile | 8030 | ❌ Internal | FastAPI backend |
| portal | ./Dockerfile.portal | 3000 | ❌ Internal | Next.js frontend |
| db | pgvector/pgvector:pg17 | 5432 | ❌ Internal | PostgreSQL + vectors |
| redis | redis:7-alpine | 6379 | ❌ Internal | Cache + rate limits |
| nginx | nginx:1.28-alpine | 80,443 | ✅ Public | Reverse proxy + SSL |

## COMPOSE FILE STRATEGY

| File | Purpose | Use When |
|------|---------|----------|
| infra/compose/base.yml | Shared config | Always included |
| infra/compose/local.yml | Dev overrides | Local development |
| infra/compose/production.yml | Prod config | Production only |

## STARTUP COMMANDS

Local development (DB + Redis only):
docker compose -f infra/compose/base.yml -f infra/compose/local.yml up -d


Production (full stack):
docker compose -f infra/compose/base.yml -f infra/compose/production.yml up -d


## CRITICAL RULES

1. PostgreSQL port 5432 NEVER exposed in production
2. Redis port 6379 NEVER exposed in production
3. All traffic enters through Nginx on 443 (HTTPS)
4. HTTP 80 immediately redirects to HTTPS 443
5. API and Portal only accessible via Nginx proxy
6. No container runs as root (tbapp user in Dockerfile)

## ISOLATION FROM SHARED AI INFRASTRUCTURE

This machine runs: Open WebUI, Ollama, Qdrant

These MUST NOT share:
- PostgreSQL database
- Redis instance
- Nginx configuration

Production VM must be completely isolated.
Triangle Black gets its own PostgreSQL container.
Triangle Black gets its own Redis container.
Shared infrastructure is a development convenience only.
