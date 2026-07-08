# 11 — DevOps

## Environment Strategy

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| Production | app.triangleblack.tech | main | Live platform |
| Staging | staging.triangleblack.tech | develop | Integration testing |
| Development | localhost | feature/* | Local development |

## Docker Build Strategy

```dockerfile
# Multi-stage build — all apps follow this pattern
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
COPY pnpm-lock.yaml ./
RUN pnpm fetch

FROM deps AS build
COPY . .
RUN pnpm install --offline
RUN pnpm build --filter={target_app}

FROM base AS runner
COPY --from=build /app/{apps/{app}/dist,packages} ./
EXPOSE {port}
CMD ["node", "dist/main"]
```

## Environment Variables

```
# Required for all environments — stored in .env (git-ignored)
DATABASE_URL=postgresql://postgres:password@localhost:5432/triangle_black
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ISSUER=triangle-black-platform
JWT_AUDIENCE=triangle-black-app
NODE_ENV=development|staging|production
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
UPLOAD_DIR=/data/uploads
LOG_LEVEL=debug|info|warn|error
SENTRY_DSN=
```

## Deployment Flow

```
1. PR merged to develop (feature complete)
2. CI builds + tests on develop
3. Create release/vX.Y.Z from develop
4. CI builds + tests + deploys to staging
5. Smoke tests on staging
6. PR release/vX.Y.Z → main (production)
7. CI builds + deploys to production
8. Health check verifies deployment
```

## Rollback Procedure

```
1. Identify faulty deployment (monitoring alert)
2. Revert PR in main
3. CI deploys previous Docker image
4. Run database rollback migration (if applicable)
5. Verify health check
6. Notify stakeholders
```

## SSH Access

- Key-based authentication only
- No password SSH
- Admin users only
- Audit logged via `sshd` logs
