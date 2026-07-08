# 06 — Docker

> Docker Compose configuration validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | Docker Compose setup |
| PHASE-05 | DevOps-Foundation.md | docker-compose.yml |

## Service Configuration

| Service | Image | Port | Health Check | Restart | Status |
|---------|-------|------|-------------|---------|--------|
| nginx | nginx:1.26-alpine | 80/443 | /health | always | ❌ |
| api | ghcr.io/triangle-black/api | 3000 | /api/v1/health | always | ❌ |
| web | ghcr.io/triangle-black/web | 3001 | /api/health | always | ❌ |
| worker | ghcr.io/triangle-black/worker | — | — | always | ❌ |
| postgres | postgres:16-alpine | 5432 | pg_isready | always | ❌ |

## Docker Compose Validation

- [ ] `docker compose up` starts all 5 services
- [ ] All services pass health checks
- [ ] Services can communicate (api → postgres, nginx → api/web)
- [ ] Logs are captured (json-file driver)
- [ ] Restart policy works (kill container → auto-restarts)
- [ ] Resource limits configured (CPU, memory)
- [ ] Networks configured (internal for services)
- [ ] Volumes configured (persistent data)
- [ ] `.env` file loading works correctly
- [ ] Production override file works (docker-compose.prod.yml)

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT VERIFIED
