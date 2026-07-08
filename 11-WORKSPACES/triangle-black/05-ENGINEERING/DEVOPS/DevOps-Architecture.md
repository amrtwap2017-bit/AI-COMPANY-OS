# Phase 04 — DevOps Architecture

> Infrastructure, deployment, and operations architecture.

## Infrastructure

| Component | V1 | V2 Path |
|-----------|-----|---------|
| Host | DigitalOcean $6/mo droplet | Vertical to $40/mo, then horizontal |
| OS | Ubuntu 24.04 LTS | Same |
| Container | Docker Compose | Docker Swarm or Nomad |
| Database | PostgreSQL 16 (container) | Managed PostgreSQL |
| Storage | VPS volume | DO Spaces for files |
| CDN | None (single region) | DO CDN or Cloudflare |

## Docker Compose Services

| Service | Image | Port | Health Check | Replicas |
|---------|-------|------|-------------|----------|
| nginx | nginx:1.26-alpine | 80/443 | /health | 1 |
| api | ghcr.io/triangle-black/api | 3000 | /api/v1/health | 1 |
| web | ghcr.io/triangle-black/web | 3001 | /api/health | 1 |
| worker | ghcr.io/triangle-black/worker | — | — | 1 |
| postgres | postgres:16-alpine | 5432 | pg_isready | 1 |

## Monitoring

| Aspect | V1 Tool | V2 Tool |
|--------|---------|---------|
| Logs | Docker logs | ELK or Grafana Loki |
| Metrics | Health endpoint | Prometheus + Grafana |
| Alerts | GitHub Actions + email | PagerDuty |
| Uptime | Simple health check | UptimeRobot |

## Runbook

See `11-DEVOPS/` and `12-DEVOPS/` for incident response and operations runbooks.
