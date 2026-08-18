# Triangle Black — Health Check Reference

## Endpoints

| Endpoint | Purpose | Auth | Expected Response |
|----------|---------|------|-------------------|
| GET /api/v1/health/live | Process liveness | None | 200 {"status":"live"} |
| GET /api/v1/health/ready | DB connectivity | None | 200 {"status":"ready","database":"connected"} |
| GET /api/v1/health | Basic platform check | None | 200 {"status":"healthy"} |
| GET /api/v1/platform/status | Tenant-scoped status | JWT | 200 with 6 subsystem stats |

## SLOs

| Check | Target | Alert Threshold |
|-------|--------|----------------|
| /health/live response time | < 100ms | > 500ms |
| /health/ready response time | < 500ms | > 2000ms |
| DB connectivity | 99.9% uptime | any failure |
| Server startup time | < 15s | > 30s |

## Docker Healthcheck Config

Both docker-compose.yml and docker-compose.production.yml have healthcheck directives.
The backend service uses /api/v1/health/live for liveness.

## Quick Verification

Run: curl -s http://localhost:8030/api/v1/health/live
Run: curl -s http://localhost:8030/api/v1/health/ready

## Monitoring Integration

Poll /api/v1/health/live every 30s for liveness.
Poll /api/v1/health/ready every 60s for readiness.
Alert on 3 consecutive failures.
