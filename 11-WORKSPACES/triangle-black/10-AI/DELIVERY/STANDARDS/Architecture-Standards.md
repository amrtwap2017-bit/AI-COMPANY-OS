# Architecture Standards

## Architectural Style

This project follows **Clean Architecture** with a modular monolith deployment. Each feature is a self-contained module with clear boundaries and dependencies flowing inward.

## Layered Architecture

```
┌──────────────────────────────────────────┐
│           Presentation Layer             │
│   (Controllers, Middleware, Routes)      │
│         Depends on: Application          │
└──────────────────────┬───────────────────┘
                       │
┌──────────────────────▼───────────────────┐
│           Application Layer              │
│   (Use Cases, DTOs, Ports)              │
│         Depends on: Domain               │
└──────────────────────┬───────────────────┘
                       │
┌──────────────────────▼───────────────────┐
│            Domain Layer                  │
│   (Entities, Value Objects, Events)      │
│         Depends on: Nothing              │
└──────────────────────┬───────────────────┘
                       │
┌──────────────────────▼───────────────────┐
│         Infrastructure Layer             │
│   (Repositories, External Adapters)      │
│         Depends on: Domain, Application  │
└──────────────────────────────────────────┘
```

### Dependency Rule
- Dependencies point **inward** only.
- Domain layer has zero dependencies on external frameworks.
- Application layer depends only on Domain.
- Presentation layer depends only on Application.
- Infrastructure layer depends on Domain and Application (through ports).

### Layer Responsibilities

| Layer | Responsibilities | Forbidden |
|-------|-----------------|-----------|
| Domain | Business logic, entities, value objects, repository interfaces, domain events | Database access, HTTP, framework imports |
| Application | Use case orchestration, DTOs, input validation, transaction management | Direct DB access, HTTP concerns, framework-specific code |
| Infrastructure | Database repositories, external API clients, filesystem, message queues | Business logic, domain rules |
| Presentation | HTTP handling, request parsing, response formatting, middleware | Business logic, direct DB access |

## Module Boundaries

- One module per domain concept (e.g., `orders`, `payments`, `users`).
- Modules communicate through **ports/adapters** (interfaces), never through direct imports.
- Shared kernel (common types, base classes, utilities) lives in `src/shared/`.
- No circular dependencies between modules. Enforce with `madge` or `dependency-cruiser`.

## C4 Model Compliance

All architectural documentation must use the C4 model:

### Context Diagram (Level 1)
- Shows the system as a box in the center.
- Shows external actors (users, external systems) as boxes around it.
- Documents interactions as labeled arrows.

### Container Diagram (Level 2)
- Shows the application's runtime containers (API server, worker, database, cache).
- Shows technology choices (Node.js, PostgreSQL, Redis).
- Documents communication protocols (HTTP, gRPC, message queues).

### Component Diagram (Level 3)
- Shows major components within each container.
- Maps to Clean Architecture layers.
- Documents interfaces between components.

### Code Diagram (Level 4)
- Generated from code (class diagrams per module).
- Maintained in code (PlantUML or Mermaid in ADRs).

## Architecture Decision Records (ADRs)

- Create an ADR for any decision that affects the system's structure, technology, or significant behavior.
- ADRs are stored in `docs/adr/` with sequential numbering.
- Directory: `docs/adr/ADR-<NNN>-<title>.md`.

### ADR Template

```markdown
# ADR-<NNN>: <Title>

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue driving this decision? What constraints exist?

## Decision
What was decided? Be specific about the approach and rationale.

## Consequences
- Positive: benefits and advantages
- Negative: trade-offs and costs
- Neutral: changes to processes, documentation, etc.
```

## Dependency Rules (Enforced)

| Rule | Enforcement |
|------|------------|
| Domain imports nothing external | ESLint `import/no-restricted-paths` |
| Application imports only Domain | ESLint `import/no-restricted-paths` |
| Infrastructure may import Domain + Application | Allowed |
| Presentation imports only Application | ESLint `import/no-restricted-paths` |
| No circular module imports | `dependency-cruiser` |
| No barrel/index.ts re-exports | Manual review |

## Technology Stack

| Concern | Technology |
|---------|-----------|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5.x (strict) |
| Framework (API) | Express.js or Hono |
| ORM | Prisma |
| Validation | Zod |
| DI | tsyringe or manual DI |
| Testing | Vitest |
| E2E Testing | Playwright |
| Containerization | Docker |
| API Documentation | OpenAPI 3.1 (Swagger) |
