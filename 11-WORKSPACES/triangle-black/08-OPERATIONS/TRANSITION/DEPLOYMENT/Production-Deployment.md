# 02 — Production Deployment

> Production deployment procedure for Triangle Black.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | CI-CD.md | CI/CD pipeline |
| Phase 5 | DevOps-Foundation.md | Deployment config |
| Phase 8 | 06-INFRASTRUCTURE-READINESS | Infrastructure validation |

## Deployment Architecture

```
GitHub main branch
    │
    ▼
GitHub Actions CI/CD
    │
    ├── Build Docker images
    ├── Run tests
    ├── Lint + typecheck
    │
    ▼
Push to ghcr.io registry
    │
    ▼
SSH into VPS
    │
    ▼
docker compose pull
docker compose up -d
    │
    ▼
Health check (30s interval × 5 attempts)
    │
    ▼
Nginx reload (if config changed)
    │
    ▼
Deployment complete
```

## Prerequisites

- [ ] VPS provisioned and hardened
- [ ] Docker + Docker Compose installed
- [ ] GitHub Actions runner configured
- [ ] ghcr.io registry access configured
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificates issued (Let's Encrypt)
- [ ] PostgreSQL running (Docker or native)
- [ ] Monitoring agent installed
- [ ] `.env.production` file present on VPS
- [ ] Backup script tested

## Deployment Command

```bash
# SSH into VPS
ssh deploy@[VPS_IP]

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Deploy with zero-downtime
docker compose -f docker-compose.prod.yml up -d --wait

# Verify health
docker compose -f docker-compose.prod.yml ps
curl -f https://app.triangleblack.com/api/v1/health

# Clean up old images
docker image prune -f
```

## Zero-Downtime Deployment

Strategy: Rolling update via Docker Compose.
- API service: 1 container, brief restart (sub-second)
- Web service: 1 container, brief restart
- Database: No restart (migrations run separately)

## Post-Deployment Verification

- [ ] All services running (`docker compose ps`)
- [ ] API health endpoint returns 200
- [ ] Web application loads in browser
- [ ] Nginx passes config test
- [ ] SSL certificate valid
- [ ] Database connections working
- [ ] Logs: no errors in last 5 min

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT DEPLOYED
