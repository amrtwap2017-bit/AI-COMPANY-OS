# Staging

| Field | Value |
|---|---|
| Document ID | 18-Deployment-02 |
| Document Purpose | Define the staging environment purpose, setup, and validation process |
| Version | 1.0 |
| Status | Approved |

## Purpose

The staging environment is a production-like environment used for:

- Pre-release validation of features and fixes
- Integration testing with real external services (sandbox mode)
- Performance baseline measurement
- QA and UAT sign-off
- Release candidate verification

URL: `https://staging.triangleblack.com`

## Infrastructure

| Component | Spec |
|---|---|
| Compute | Single VM (2 vCPU, 4 GB RAM) or container |
| Database | PostgreSQL 16, separate from production |
| Storage | Object storage (sandbox bucket) |
| CI/CD | GitHub Actions auto-deploy on merge to `develop` |

## Setup

Staging is deployed automatically by the CI/CD pipeline:

1. Merge PR to `develop`
2. GitHub Actions runs `ci.yml` (lint, test, build)
3. On success, `docker.yml` builds and pushes Docker image with `staging` tag
4. `deploy.yml` deploys to staging environment

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: |
          # Pull latest image, run migrations, restart services
          docker compose -f docker-compose.staging.yml pull
          docker compose -f docker-compose.staging.yml up -d --force-recreate
```

## Data

- Staging uses a sanitized copy of production data (no PII)
- Data refresh: weekly from production with anonymization
- Test data fixtures available for specific scenarios
- Database is reset on each major release deploy

## Test Process

Before a release is promoted from staging to production:

1. **Automated tests pass** on the staging deploy commit
2. **QA manual smoke test** of critical user journeys
3. **Performance check** — API response times within baseline
4. **Regression check** — key existing flows unaffected
5. **Stakeholder demo** (optional) for UAT sign-off

## Environment Variables

```env
NODE_ENV=staging
DATABASE_URL=postgresql://user:password@staging-db:5432/triangle_staging
JWT_SECRET=<managed-secret>
API_URL=https://staging.triangleblack.com
```

Secrets are stored in GitHub Actions secrets and injected at deploy time.

## Cross-References

- [17-Engineering/CI-CD.md](../17-Engineering/CI-CD.md) — Staging deploy workflow
- [18-Deployment/Production.md](Production.md) — Production differences
- [18-Deployment/Release.md](Release.md) — Release promotion from staging
