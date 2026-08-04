# Enterprise Repository Transformation Program v4

## Scope and non-negotiables

This program transforms the existing FastAPI/Next.js modular-monolith candidate incrementally. It does not authorize a rewrite, deletion, endpoint removal, URL breakage, import breakage or database incompatibility. Architecture wins through adapters, facades, migration paths and explicit deprecation—not replacement by fiat.

## Authority resolution

The eight named root authority files are absent. Until approved replacements are introduced, the precedence order is: approved decisions; `docs/enterprise-blueprint-v4`; `docs/inventory`; existing governance and domain documentation; executable behavior. The documented NestJS/Prisma model conflicts with the FastAPI/SQLAlchemy implementation and is classified as target/historical intent, not current runtime fact.

## Transformation workstreams

1. Foundation and release engineering
2. Identity, authorization and tenant isolation
3. API governance and compatibility
4. Domain modularization and workflow engine
5. Configuration/SaaS platform
6. Enterprise UX/design system
7. Data/migration governance
8. AI, knowledge and digital twin
9. Observability, security and resilience
10. Integrations, mobile/offline and marketplace readiness

## Recommendation record standard

Every item in the detailed workstreams must provide: Current State, Problem, Impact, Target State, Migration Strategy, Compatibility Strategy, Risk, Priority, Complexity, Dependencies and Acceptance Criteria. No item progresses from design to implementation without an ADR, owner, rollback plan, contract tests and operational acceptance evidence.

## Program control plane

- Architecture Review Board approves ADRs, context boundaries, data migrations and exceptions.
- A compatibility register owns routes, schemas, UI URLs, table semantics, configuration and events.
- A workflow/page registry establishes one workflow/state owner for every action.
- Feature flags control rollout; telemetry determines migration completion.
- Quarterly blueprint reconciliation prevents documentation drift.

