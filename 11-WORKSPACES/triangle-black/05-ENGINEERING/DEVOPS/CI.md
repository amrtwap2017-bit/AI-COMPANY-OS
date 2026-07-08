# DEV-001 — CI/CD Pipeline

## `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Gates
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: triangle_black_test
          POSTGRES_PASSWORD: testpassword
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint
        env:
          NODE_ENV: test

      - name: TypeScript check
        run: pnpm typecheck

      - name: Build
        run: pnpm build

      - name: Generate Prisma client
        run: pnpm db:generate
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/triangle_black_test

      - name: Run migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/triangle_black_test

      - name: Unit tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/triangle_black_test
          JWT_SECRET: test-jwt-secret
          JWT_REFRESH_SECRET: test-jwt-refresh-secret

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/
```

## `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy Staging
on:
  push:
    branches: [develop]

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install and build
        run: |
          pnpm install --frozen-lockfile
          pnpm build

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/triangle-black
            git pull origin develop
            docker compose -f docker-compose.staging.yml build
            docker compose -f docker-compose.staging.yml up -d
            docker system prune -f
```

## `.github/workflows/deploy-production.yml`

```yaml
name: Deploy Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install and build
        run: |
          pnpm install --frozen-lockfile
          pnpm build

      - name: Run production migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/triangle-black
            git pull origin main
            docker compose -f docker-compose.prod.yml build
            docker compose -f docker-compose.prod.yml up -d
            docker system prune -f

      - name: Health check
        run: |
          sleep 10
          curl -f https://app.triangleblack.tech/api/v1/health || exit 1

      - name: Notify success
        run: echo "Production deployment completed successfully"
```

## `scripts/setup.sh`

```bash
#!/bin/bash
# First-time setup script for Triangle Black

echo "=== Triangle Black Setup ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

# Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — update secrets before production"
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
pnpm db:generate

# Run migrations
echo "Running database migrations..."
pnpm db:migrate

# Seed database
echo "Seeding database..."
pnpm db:seed

echo ""
echo "=== Setup complete ==="
echo "Run 'pnpm dev' to start development"
echo "Admin login: admin@triangleblack.tech / Admin@123"
```
