# Engineering Constitution

## Preamble

The Triangle Black engineering organization exists to deliver a platform that enables hospitality engineering businesses to win more deals, deliver better projects, and retain clients. Everything in this constitution serves that mission.

## Engineering Principles

### E1. Convention Over Configuration
Every project follows identical patterns. There is one way to structure a module, one way to name a file, one way to write an API. No team-specific conventions.

### E2. Traceability Above All
Every line of code traces to a requirement. Every requirement traces to a business need. Every API endpoint traces to a screen. Traceability is enforced, not encouraged.

### E3. Simplicity by Default, Complexity by Exception
Start with the simplest solution that works. Add complexity only when measurable business metrics justify it. No Redis because "we might need it later."

### E4. Cost-Conscious Engineering
Every architectural decision accounts for infrastructure cost. The default is free. The second default is cheap. Paid services require written justification.

### E5. Design Freeze, Then Build
Phase 3 is frozen. Phase 4 is frozen after approval. No redesign during implementation. Changes require an Architecture Decision Record.

### E6. AI-Augmented, Human-Verified
AI agents draft, review, test, and document. Humans approve architecture decisions, security boundaries, and production releases. No AI code goes to production without human review.

### E7. Quality Is Not Optional
Linting, testing, type checking, and security scanning are not "nice to haves." They are enforced at the CI gate. No PR merges without passing all gates.

### E8. Documentation Is Code
README files, ADRs, API docs, and database schemas live in the repository, follow review process, and version alongside code.

### E9. Monorepo Discipline
All code lives in one repository. Shared packages are versioned internally. No separate repos for frontend, backend, or shared libraries.

### E10. Startup-Enterprise Balance
Operate with startup velocity and enterprise discipline. Move fast with guardrails, not without them.

## Architecture Principles

### A1. Modular Monolith (V1)
One deployment. One database. Well-defined module boundaries. The architecture is structured for future extraction into microservices, but extraction only happens when metrics prove it necessary.

### A2. Schema-Per-Tenant Isolation
Every tenant's data lives in a separate PostgreSQL schema. Cross-tenant data access is structurally impossible at the database level.

### A3. API-First Design
Every feature is defined by its API contract before any UI or backend code is written. The API contract is the source of truth.

### A4. Stateless Application Layer
All application instances are stateless. Session state, file storage, and configuration live outside the application process.

### A5. Synchronous by Default, Async by Exception
Request-response is the default. Background jobs and events are used only when request-response creates unacceptable latency or coupling.

### A6. Prisma Data Layer
All database access goes through Prisma. No raw SQL outside migrations. No ORM bypass.

### A7. Next.js App Router + Server Components
Server Components by default. Client Components only for interactivity. App Router patterns only.

## Coding Philosophy

- Write code for humans first, computers second.
- Prefer flat over nested.
- Prefer explicit over implicit.
- Prefer pure functions over side effects.
- Name things by what they do, not what they are.
- Delete code before writing new code.
- A function does one thing.
- A module owns one domain.

## Startup Principles

- Run on $25-40/mo infrastructure for V1.
- Use free tiers aggressively.
- Pay only for PostgreSQL and VPS compute.
- No paid monitoring, no paid CI, no paid CDN.
- Every dollar spent must trace to a user-facing feature.

## Scalability Principles

- Design for 100 tenants on a single VPS.
- Design for extraction, not scale.
- When to scale: only when a specific bottleneck is measured and proven.
- Scaling order: optimize queries → add indexes → add read replicas → add cache → add worker processes → extract services.

## Review Rules

- Every PR requires at least one human review before merge.
- Architecture changes require architecture review.
- Database migrations require database review.
- Security boundaries require security review.
- AI-generated code requires the same reviews as human code.

## Quality Rules

- 80%+ test coverage on new code.
- 0 lint errors, 0 type errors, 0 security warnings.
- Every error state must be handled.
- Accessibility: WCAG 2.1 AA minimum.
- Performance: Lighthouse 90+ on all metrics.

## The Triangle Black Engineering Oath

> I will not ship code I cannot trace to a requirement.
> I will not add infrastructure I cannot justify with metrics.
> I will not bypass a quality gate.
> I will not commit a secret.
> I will not merge my own PR.
> I will document what I build and build what I documented.
