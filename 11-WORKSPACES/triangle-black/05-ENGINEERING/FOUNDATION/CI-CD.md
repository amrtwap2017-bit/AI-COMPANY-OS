# CI/CD

| Field | Value |
|---|---|
| Document ID | 17-Engineering-08 |
| Document Purpose | Define CI/CD pipeline using GitHub Actions |
| Version | 1.0 |
| Status | Approved |

## Pipeline Overview

```
[Push/PR] -> [Lint] -> [Unit Tests] -> [Build] -> [Integration Tests] -> [Docker Build & Push] -> [Deploy]
```

## Workflows

### 1. ci.yml — Lint, Test, Build

Triggers on: push to any branch, pull request to `develop` or `main`

```yaml
name: CI

on:
  push:
    branches: [main, develop, 'feat/**', 'fix/**', 'hotfix/**']
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: triangle_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/triangle_test
      - run: npm run test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/triangle_test
      - run: npm run test:integration:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/triangle_test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

### 2. docker.yml — Docker Build and Push

Triggers on: merge to `main`, push semver tag

```yaml
name: Docker Build & Push

on:
  push:
    branches: [main]
    tags: ['v*.*.*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: triangleblack/api
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix=
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 3. deploy.yml — Deploy to Environment

Triggers on: workflow_dispatch (manual) with environment selection

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment target'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      tag:
        description: 'Docker image tag'
        required: true
        default: 'latest'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to ${{ inputs.environment }}
        run: |
          echo "Deploying ${{ inputs.tag }} to ${{ inputs.environment }}"
          # Add deployment script call here (Ansible, SSH, or k8s apply)
```

## Workflow Checks

| Check | Required for Merge to develop | Required for Merge to main |
|---|---|---|
| `lint` | Yes | Yes |
| `test` | Yes | Yes |
| `build` | Yes | Yes |
| `docker` | No | Yes |
| Coverage threshold | 80% | 80% |

## Secrets

| Secret | Used By | Value |
|---|---|---|
| `DOCKER_USERNAME` | docker.yml | Docker Hub username |
| `DOCKER_PASSWORD` | docker.yml | Docker Hub token |
| `STAGING_SSH_KEY` | deploy.yml | SSH key for staging server |
| `PROD_SSH_KEY` | deploy.yml | SSH key for production server |

Secrets are managed in GitHub repository Settings > Secrets and Variables > Actions.

## Cross-References

- [Branching.md](Branching.md) — Branch triggers for workflows
- [18-Deployment/Development.md](../18-Deployment/Development.md) — Local dev setup
- [18-Deployment/Staging.md](../18-Deployment/Staging.md) — Staging deployment
- [18-Deployment/Production.md](../18-Deployment/Production.md) — Production deployment
