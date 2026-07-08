# ADR-004: Backend Framework

**Status:** Accepted

**Context:** Triangle Black requires a backend framework that enforces clean architecture, supports modular development, provides built-in dependency injection, has strong TypeScript support, and can run as a monolith today but be split into microservices later. The framework must handle authentication, validation, serialization, and WebSocket connections for real-time updates.

**Decision:**

We will use **NestJS** as the backend framework.

Key factors:
- **Modular architecture** — modules map directly to bounded contexts
- **Dependency injection** — built-in, testable, promotes clean separation
- **Decorator pattern** — clean controller/service definitions with OpenAPI integration
- **HTTP adapters** — Express (default) with easy switch to Fastify for higher throughput
- **Middleware pipeline** — guards, interceptors, pipes, filters for cross-cutting concerns
- **Event bus** — built-in `@nestjs/event-emitter` for domain events
- **CLI** — generates modules, controllers, services consistently
- **Testing utilities** — TestFactory, mocks, integration test support

**Consequences:**

*Positive:*
- Modules with clear boundaries map directly to DDD bounded contexts
- DI makes unit testing straightforward (mock providers)
- Decorators keep controllers clean and declarative
- Event bus supports domain events for cross-module communication
- Guards and interceptors handle auth, logging, and error handling centrally

*Negative:*
- NestJS is opinionated; working against the framework is painful
- Decorator-heavy code can be harder to debug
- Module boilerplate (module class, providers, exports, imports) is verbose
- NestJS adds overhead over raw Express; startup time is slower
- Learning curve for developers new to NestJS patterns

**Alternatives:**
- **Express** — rejected: no structure, no DI, no modular enforcement (leads to spaghetti)
- **Fastify** — rejected: faster but less ecosystem support; NestJS can use Fastify adapter
- **Koa** — rejected: smaller ecosystem, no built-in structure
- **Hono** — rejected: newer, smaller ecosystem, less suitable for monolith
- **tRPC** — rejected: tight coupling between frontend and backend; better for single-purpose APIs
- **AdonisJS** — rejected: smaller community, less enterprise adoption
- **FeathersJS** — rejected: too opinionated toward real-time, less suitable for REST-heavy workloads

**Related ADRs:** ADR-001 (Tech Stack), ADR-003 (Frontend), ADR-006 (API Design), ADR-007 (Auth)
