# 04 — Smoke Testing

> Smoke tests to validate basic system functionality after deployment.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-05 | Health checks | Health endpoints |

## Smoke Test Suite

| Test | Expected | Command / URL | Status |
|------|----------|---------------|--------|
| API health (liveness) | 200 OK | `GET /api/v1/health/live` | ❌ |
| API health (readiness) | 200 OK | `GET /api/v1/health/ready` | ❌ |
| Web app loads | 200 OK | `GET /` | ❌ |
| Login page loads | 200 OK | `GET /login` | ❌ |
| Login succeeds | 200 + token | `POST /api/v1/auth/login` | ❌ |
| Authenticated request | 200 | `GET /api/v1/users/me` | ❌ |
| Database connection | Connected | Health check | ❌ |
| Docker services running | 5/5 | `docker ps` | ❌ |

## Smoke Test Execution

| Event | Trigger | Executor |
|-------|---------|----------|
| Post-deployment | CI/CD pipeline | Automated |
| Pre-UAT session | Manual | QA |
| Incident recovery | Manual | DevOps |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT SET UP
