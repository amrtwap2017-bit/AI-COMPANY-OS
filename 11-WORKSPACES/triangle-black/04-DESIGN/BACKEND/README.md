# 11-Backend — NestJS API

The Triangle Black backend is a **NestJS** monolith organized around **CQRS** and **Domain-Driven Design**. It exposes a RESTful API consumed by the Next.js frontend and external integrations.

## Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Runtime          | Node.js 20 LTS                      |
| Framework        | NestJS v10                          |
| Language         | TypeScript 5                        |
| ORM              | Prisma 5                            |
| Database         | PostgreSQL 16                       |
| Validation       | class-validator + class-transformer |
| Auth             | @nestjs/jwt + @nestjs/passport      |
| Logging          | Pino (via nestjs-pino)              |
| Testing          | Jest + Supertest                    |
| Documentation    | Compodoc + OpenAPI (Swagger)        |

## Getting Started

```bash
# Install dependencies
pnpm install

# Generate Prisma client and apply migrations
pnpm prisma:generate
pnpm prisma:migrate

# Start development server (watch mode)
pnpm start:dev

# Run tests
pnpm test
pnpm test:e2e
```

## Key Principles

- **CQRS** — Commands (write) and Queries (read) are separated via the NestJS CQRS package
- **Repository Pattern** — Prisma is wrapped in typed repositories; no raw Prisma calls in controllers or services
- **Validation** — Every input (body, query, param) is validated with DTOs and class-validator
- **Auth** — Stateless JWT access tokens (15 min) + signed refresh tokens (7 days)
- **RBAC** — Role-based access control with fine-grained permission checks
- **Defensive coding** — All services return `Result<T>` or throw typed HTTP exceptions

## Directory Layout

```
src/
├── commands/          # CQRS command definitions & handlers
├── queries/           # CQRS query definitions & handlers
├── events/            # Domain event classes & handlers
├── modules/           # Feature modules (auth, users, properties, bookings...)
├── common/            # Shared decorators, filters, pipes, interceptors, guards
└── main.ts            # Application entry point
```

See [Folder-Structure.md](./Folder-Structure.md) for the full tree.
