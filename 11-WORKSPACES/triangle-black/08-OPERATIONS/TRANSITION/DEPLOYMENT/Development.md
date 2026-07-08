# Development

| Field | Value |
|---|---|
| Document ID | 18-Deployment-01 |
| Document Purpose | Define the local development environment setup and workflow |
| Version | 1.0 |
| Status | Approved |

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Runtime |
| npm | 10.x | Package manager |
| Docker | 24+ | PostgreSQL, Redis (if used) |
| Git | 2.40+ | Version control |
| VS Code | Latest | Recommended IDE |

## Local Setup

```bash
# Clone repository
git clone https://github.com/triangleblack/digital-operations-ecosystem.git
cd digital-operations-ecosystem

# Install dependencies
npm ci

# Copy environment file
cp .env.example .env

# Start dependent services (PostgreSQL, etc.)
docker compose up -d postgres

# Run database migrations
npx prisma migrate dev

# Start development servers (API + frontend)
npm run dev
```

## Docker Compose for Development

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: triangle_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  pgdata:
```

Start with:

```bash
docker compose -f docker-compose.dev.yml up -d
```

## Hot Reload

| Project | Command | Watch Mode |
|---|---|---|
| Backend (NestJS) | `npm run start:dev` | `tsc --watch` + `nodemon` |
| Frontend (Next.js) | `npm run dev` | Built-in |

Both support hot reload on file save. No manual restart needed for code changes.

## Debugging

### VS Code Launch Configurations

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

### NestJS Debug Mode

```bash
npm run start:debug
# Attach debugger at localhost:9229
```

## Environment Variables

```env
# .env (example — do not commit secrets)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://dev:dev@localhost:5432/triangle_dev
JWT_SECRET=dev-secret-do-not-use-in-production
REDIS_URL=redis://localhost:6379
```

## Useful Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start API + frontend in watch mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run test` | Run unit tests in watch mode |
| `npm run test:e2e` | Run E2E tests |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Create and apply migrations |

## Cross-References

- [17-Engineering/Coding-Standards.md](../17-Engineering/Coding-Standards.md) — Code conventions
- [17-Engineering/CI-CD.md](../17-Engineering/CI-CD.md) — CI pipeline matching local dev
- [10-Database/](../10-Database/) — Database schema and migrations
