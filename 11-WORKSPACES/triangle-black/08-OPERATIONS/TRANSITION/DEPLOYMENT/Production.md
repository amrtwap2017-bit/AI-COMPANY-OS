# Production

| Field | Value |
|---|---|
| Document ID | 18-Deployment-03 |
| Document Purpose | Define the production environment architecture and deployment process |
| Version | 1.0 |
| Status | Approved |

## Architecture

```
[Cloud Load Balancer]
       |
       v
[Application Server(s)]  <- Docker containers
       |
       v
[PostgreSQL Database]    <- Managed or containerized
       |
       v
[Object Storage]         <- File uploads, backups
```

| Component | Technology | Scaling |
|---|---|---|
| Load balancer | Nginx / Cloud LB | Single (managed) |
| Application | NestJS (API) + Next.js (frontend) | Horizontal (2+ replicas) |
| Database | PostgreSQL 16 | Vertical (4+ GB RAM) |
| Cache | Redis 7 (if needed) | Single (managed) |
| Storage | S3-compatible object storage | Managed |

## Deployment Process

1. Release branch merged to `main`
2. GitHub Actions `ci.yml` runs full test suite
3. `docker.yml` builds Docker image with semver tag (`v1.2.3`)
4. Image pushed to Docker Hub
5. Zero-downtime deployment:

```bash
# Pull new image
docker compose pull api

# Run database migrations (backward-compatible)
docker compose run --rm api npx prisma migrate deploy

# Rotate containers (blue-green)
docker compose up -d --no-deps --scale api=2 api
# Wait for health check
docker compose up -d --no-deps --scale api=1 api_old
docker rm -f api_old
```

## Verification

After deployment, verify:

1. **Health endpoint** returns 200: `GET /health`
2. **Database migration** applied: `npx prisma migrate status`
3. **Smoke test** — automated Playwright test hits critical endpoints
4. **Logs** — check for errors in first 5 minutes
5. **Monitoring** — CPU, memory, response times within normal range

## Monitoring & Alerts

| Metric | Threshold | Action |
|---|---|---|
| CPU usage | >80% for 5 min | Scale up |
| Memory usage | >85% | Investigate leak |
| API response time (p95) | >500ms | Performance review |
| Error rate (5xx) | >1% | Rollback if sustained |
| Disk usage | >80% | Cleanup / increase volume |

## Backup Strategy

| Item | Frequency | Retention |
|---|---|---|
| Database dump | Daily | 30 days |
| Database WAL | Continuous | 7 days |
| Application logs | Real-time stream | 7 days hot, 30 cold |
| File uploads | Real-time replication | Indefinite |

## Environment Variables

```env
NODE_ENV=production
DATABASE_URL=<managed-secret>
JWT_SECRET=<managed-secret>
REDIS_URL=<managed-secret>
S3_ENDPOINT=<managed-secret>
S3_BUCKET=triangleblack-prod
LOG_LEVEL=info
```

## Cross-References

- [14-Infrastructure/](../14-Infrastructure/) — Server and network config
- [18-Deployment/Staging.md](Staging.md) — Staging mirror of production
- [18-Deployment/Rollback.md](Rollback.md) — Rollback procedure
- [17-Engineering/CI-CD.md](../17-Engineering/CI-CD.md) — Deploy pipeline
