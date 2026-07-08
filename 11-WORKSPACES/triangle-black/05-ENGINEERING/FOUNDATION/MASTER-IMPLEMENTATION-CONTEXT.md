# Master Implementation Context

## Technology Stack (Frozen)

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22 LTS |
| Package Manager | pnpm | 10+ |
| Monorepo | Turborepo | 2.x |
| Backend | NestJS | 11.x |
| Frontend | Next.js | 15.x (App Router) |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16 |
| UI Library | shadcn/ui + Tailwind CSS | Latest |
| Auth | Passport + JWT | — |
| Validation | class-validator + Zod | — |
| Testing | Jest + Supertest + Playwright | — |
| CI/CD | GitHub Actions | — |
| Containerization | Docker Compose | — |
| Proxy | Nginx | Latest |
| Infrastructure | DigitalOcean VPS | $6/mo |

## Repository Structure

```
triangle-black/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js public website + Client Portal
│   └── worker/       # Background job processor
├── packages/
│   ├── ui/           # Shared React components (shadcn/ui)
│   ├── database/     # Prisma schema, migrations, client
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   └── config/       # ESLint, TypeScript, Prettier configs
├── docker/           # Docker configuration
├── scripts/          # Build and utility scripts
└── .github/          # GitHub Actions + templates
```

## Build Rules

- `pnpm build` — Build all packages and apps (sequential order: packages → apps)
- `pnpm dev` — Start all apps in development mode
- `pnpm lint` — ESLint all packages and apps
- `pnpm typecheck` — TypeScript check all packages and apps
- `pnpm test` — Run all tests
- `pnpm format:check` — Prettier check

## Quality Gates (Per PR)

| Gate | Enforcement |
|------|-------------|
| Lint | ESLint — 0 errors, 0 warnings |
| Typecheck | TypeScript strict — 0 errors |
| Test | Jest — all passing, 80%+ coverage |
| Build | Turborepo — all packages build |
| Format | Prettier — formatted |

## Architecture Rules

1. `apps/api` is the ONLY app that speaks to the database
2. `packages/types` defines shapes shared between api and web
3. `packages/database` owns the Prisma schema and client
4. `packages/ui` is pure presentation — no business logic
5. `apps/web` calls `apps/api` via fetch — never imports Prisma directly
6. Every module in `apps/api` is independent — no circular imports

## Startup Constraints

| Constraint | Rule |
|-----------|------|
| Budget | $25-40/mo total |
| VPS | Single DigitalOcean droplet |
| Database | Self-hosted PostgreSQL |
| Cache | In-memory only (no Redis) |
| Queue | In-process events (no RabbitMQ/Kafka) |
| Search | PostgreSQL full-text (no Elasticsearch) |
| CDN | Cloudflare Free |
| CI | GitHub Free |

## Acceptance Criteria (Phase 5)

1. `git clone` → `pnpm install` → `docker compose up` → app is running
2. Login screen appears at localhost
3. User can register and login
4. Authenticated user sees dashboard shell
5. File upload works
6. Notifications appear in-app
7. Audit trail records actions
8. Health check returns 200
9. All tests pass
10. CI pipeline is green
