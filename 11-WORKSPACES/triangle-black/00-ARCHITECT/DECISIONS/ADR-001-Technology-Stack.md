# ADR-001: Technology Stack

**Status:** Accepted

**Context:** We need to select a technology stack for Triangle Black, a multi-tenant hospitality operations platform. The stack must support rapid development, strong typing, cost-effective hosting, schema-per-tenant multi-tenancy, and the ability to scale from a single VPS to a distributed architecture. The team is proficient in TypeScript.

**Decision:**

We will use the following core stack:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js (App Router) | SSR, file-based routing, React ecosystem, ISR support |
| Backend | NestJS | Modular architecture, TypeScript-native, decorator pattern |
| Database | PostgreSQL | Schema-per-tenant support, JSONB, reliability |
| ORM | Prisma | Type-safe queries, declarative schema, migration tooling |
| Deployment | Docker Compose | Simple orchestration, reproducible environments |
| Proxy | Nginx | Battle-tested, lightweight, flexible routing |

**Consequences:**

*Positive:*
- Single language (TypeScript) across the entire stack reduces context switching
- Strong typing catches errors at compile time
- Large ecosystem with mature libraries for all concerns
- PostgreSQL provides the schema isolation needed for multi-tenancy
- Docker Compose keeps operations simple for a small team

*Negative:*
- Node.js may not be optimal for CPU-intensive computation (but this is not our workload)
- Prisma adds an abstraction layer over SQL; complex queries may need raw SQL
- Schema-per-tenant with many schemas can strain connection pooling at scale
- Single-language stack creates a single point of failure in TypeScript ecosystem

**Alternatives:**
- **Blazor / .NET Core** — rejected: team lacks .NET expertise
- **Python + Django** — rejected: less ideal for real-time, weaker typing
- **Java + Spring Boot** — rejected: heavier infrastructure, slower iteration
- **Ruby on Rails** — rejected: lower performance, fewer hosting options
- **MySQL + Flyway** — rejected: weaker schema-per-tenant support than PostgreSQL
- **Kubernetes** — rejected: overkill for launch; Docker Compose sufficient

**Related ADRs:** ADR-002 (Database), ADR-003 (Frontend), ADR-004 (Backend), ADR-009 (Deployment)
