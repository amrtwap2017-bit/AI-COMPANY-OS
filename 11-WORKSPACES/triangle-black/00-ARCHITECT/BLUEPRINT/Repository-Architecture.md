# Phase 02 — Repository Architecture

> Monorepo structure and organization for Triangle Black.

## Repository Structure

```
triangle-black/
├── .github/
│   └── workflows/               # GitHub Actions CI/CD
├── apps/
│   ├── api/                     # NestJS backend
│   │   ├── prisma/              # Prisma schema + migrations
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/          # Shared decorators, guards, pipes
│   │   │   └── modules/         # Domain modules
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                     # Next.js frontend
│       ├── src/
│       │   ├── app/             # App Router pages
│       │   ├── components/      # React components
│       │   ├── lib/             # Utilities and API client
│       │   └── hooks/           # Custom hooks
│       ├── public/              # Static assets
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── shared/                  # Shared types, constants, utilities
│   │   ├── src/
│   │   └── package.json
│   └── eslint-config/           # Shared ESLint configuration
│       ├── index.js
│       └── package.json
├── docker/
│   ├── nginx/                   # Nginx config files
│   │   ├── nginx.conf
│   │   └── sites/
│   └── postgres/                # PostgreSQL init scripts
│       └── init.sql
├── scripts/                     # Build, deploy, utility scripts
│   ├── backup.sh
│   ├── deploy.sh
│   └── seed.ts
├── docker-compose.yml           # Service orchestration
├── docker-compose.prod.yml      # Production overrides
├── .env.example                 # Environment template
├── .gitignore
├── package.json                 # Root workspace config
├── turbo.json                   # Turborepo config (optional)
└── .github/                     # CI/CD workflows
```

## Package Manager

- **Root**: npm workspaces or pnpm workspaces
- **Why**: Monorepo management, shared dependencies
- **Lock file**: Single `package-lock.json` or `pnpm-lock.yaml`

## Module Organization (apps/api)

Each domain module follows a consistent structure:

```
modules/{domain}/
├── {domain}.module.ts
├── {domain}.service.ts
├── {domain}.controller.ts
├── dto/                    # Data Transfer Objects (validation)
├── entities/               # Prisma model mappings
├── interfaces/             # TypeScript interfaces
├── guards/                 # Domain-specific guards
├── strategies/             # Domain-specific strategies
└── test/                   # Unit + integration tests
```

## Dependency Management

- `packages/shared/` — Types, enums, validation schemas, constants
- All apps import from `@triangle-black/shared`
- No circular dependencies between modules
- Domain modules within api depend only on `shared` + `common`

## Related Documents

- [Monorepo Architecture](../PHASE-04-ENTERPRISE-ENGINEERING/Monorepo-Architecture.md) — Engineering monorepo standards
- [Git Strategy](../PHASE-04-ENTERPRISE-ENGINEERING/Git-Strategy.md) — Branch naming, commit conventions
- `21-Implementation Blueprint.md` — Original implementation details
