# TRIANGLE BLACK — RUNTIME LOCK
Date: 2026-09-01
Status: LOCKED — V8-002

## CANONICAL RUNTIME VERSIONS

| Runtime | Locked Version | File | Production |
|---------|---------------|------|------------|
| Python | 3.12.13 | .python-version | ✅ |
| Node.js | v24.18.0 | .nvmrc | ✅ |
| npm | 11.16.0 | package.json engines | ✅ |
| PostgreSQL | 17.x (pgvector container) | docker-compose | ✅ |
| Redis | 7.x | docker-compose | ✅ |
| Nginx | 1.28.x | system package | ✅ |
| Docker | Docker version 29.6.1 | - | ✅ |

## IMPORTANT DISCOVERIES FROM AUDIT

### This machine is a shared AI infrastructure server

Running simultaneously:
- Open WebUI (port 3400)
- Ollama LLM (port 11434)
- Qdrant vector DB (port 6333-6334)
- Another Python API (port 8001)
- Triangle Black API (port 8030)
- Next.js portal (port 3000)
- Nginx (ports 80, 443)
- Redis (port 6379) — SHARED with AI stack
- PostgreSQL (port 5432) — SHARED with AI stack

### Production VM must be ISOLATED

The production server must NOT share:
- PostgreSQL
- Redis
- Qdrant
- Nginx config

with Open WebUI / Ollama / other AI tools.

## VERSION CONFLICT: TWO PYTHON VERSIONS

System Python: 3.14.4 (Ubuntu system)
Project Python: 3.12.13 (venv)

RULE: Always use .venv/bin/python — never python3 directly.

Any script using python3 instead of .venv/bin/python may run on wrong version.

## DOCKER COMPOSE STATUS

docker-compose (v1): ❌ NOT INSTALLED
docker compose (v2): Check with: docker compose version

Production deployment requires Docker Compose.
Install: sudo apt-get install docker-compose-plugin

## LOCKED FILES CREATED

| File | Purpose |
|------|---------|
| .python-version | pyenv/asdf Python version |
| .nvmrc | Node.js version (root) |
| portal/.nvmrc | Node.js version (portal) |
| .tool-versions | asdf multi-runtime lock |
| portal/package.json | engines field added |

## RULE

CI must use these exact versions.
Production must use these exact versions.
No manual version selection allowed.
