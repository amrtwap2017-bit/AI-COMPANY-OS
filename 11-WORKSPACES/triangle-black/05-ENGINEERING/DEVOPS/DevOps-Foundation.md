# Phase 05 — DevOps Foundation

> Docker Compose configuration, CI/CD workflows, and deployment setup.

## Docker Compose

```yaml
services:
  nginx:
    image: nginx:1.26-alpine
    ports: ["80:80", "443:443"]
    volumes: ["./docker/nginx:/etc/nginx/conf.d"]
    depends_on: [api, web]

  api:
    build: ./apps/api
    environment:
      - DATABASE_URL
      - JWT_SECRET
    depends_on: [postgres]

  web:
    build: ./apps/web
    environment:
      - NEXT_PUBLIC_API_URL
    depends_on: [api]

  worker:
    build: ./apps/api
    command: node dist/worker.js
    depends_on: [postgres]

  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      - POSTGRES_PASSWORD
```

## CI/CD Pipeline

| Step | Tool | Duration |
|------|------|----------|
| Lint | ESLint | 30s |
| Typecheck | tsc --noEmit | 60s |
| Test | Jest/Vitest | 120s |
| Build | Docker build | 180s |
| Deploy | SSH + docker compose | 60s |

## Environments

| Environment | Host | SSL | DB Connection |
|-------------|------|-----|---------------|
| Local | localhost:3000 | No | Local Postgres container |
| Staging | staging.triangleblack.com | Let's Encrypt | Staging VPS Postgres |
| Production | app.triangleblack.com | Let's Encrypt | Production VPS Postgres |

See `12-DEVOPS/` and `01-INFRASTRUCTURE/` for complete DevOps configuration.
