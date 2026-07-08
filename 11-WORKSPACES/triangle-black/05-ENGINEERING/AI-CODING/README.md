# 17 — AI Coding Framework

## Purpose
Define how AI agents operate within the Triangle Black engineering process. AI is a force multiplier, not a replacement for human judgment.

## Agent Roles

| Agent | Role | Reports To |
|-------|------|------------|
| Chief Architect | System architecture, module boundaries, ADRs | Engineering Lead |
| Backend AI | NestJS controllers, services, DTOs, Prisma | Chief Architect |
| Frontend AI | Next.js pages, components, forms, states | Chief Architect |
| Database AI | Prisma schema, migrations, indexes, seeds | Chief Architect |
| DevOps AI | Docker, CI/CD, deployment, environment config | Engineering Lead |
| QA AI | Test generation, coverage analysis, test data | Backend/Frontend AI |
| Security AI | Security review, OWASP checks, dependency audit | Engineering Lead |
| Reviewer AI | Code review, standard compliance, quality gates | Engineering Lead |
| Documentation AI | READMEs, ADRs, API docs, runbooks | Engineering Lead |

## Operating Principles

1. **AI is horizontal** — agents integrate across modules, not siloed
2. **Draft, don't decide** — AI drafts code, humans approve decisions
3. **Context-aware** — every agent loads relevant Phase 3-4 context before generating
4. **Standard-bound** — AI output must conform to Phase 4 standards
5. **Verified output** — all AI-generated code passes same gates as human code

## Agent Responsibility Matrix

| Agent | Creates | Reviews | Cannot Do |
|-------|---------|---------|-----------|
| Chief Architect | ADRs, module boundaries | All architecture changes | Code implementation |
| Backend AI | Controllers, services, DTOs | Backend code | Schema design decisions |
| Frontend AI | Pages, components, forms | Frontend code | API design decisions |
| Database AI | Migrations, indexes | Schema changes | Business logic |
| DevOps AI | Dockerfiles, CI YAML | Infrastructure | Production access |
| QA AI | Test files, test data | Test coverage | Go-live decisions |
| Security AI | — | Security scan results | Override security rules |
| Reviewer AI | Review comments | All PRs | Merge without approval |
| Documentation AI | READMEs, API docs | Documentation | Code changes |

## AI Input/Output Contracts

### Backend AI

```
INPUT:
  - Requirement ID (e.g., TB-123)
  - Phase 3 Screen Registry reference (e.g., LS-01)
  - Phase 3 API Contract
  - Phase 3 Table Specification
  - Phase 4 Module boundary

OUTPUT:
  - NestJS controller + service + DTO
  - Unit tests
  - Integration tests
  - OpenAPI annotations

STANDARDS:
  - 05-CODING-STANDARDS (TypeScript + NestJS)
  - 07-API-STANDARDS
  - 09-BACKEND-STANDARDS
  - 13-TESTING
```

### Frontend AI

```
INPUT:
  - Requirement ID
  - Phase 3 Screen Registry reference
  - Phase 3 UX Flow reference
  - API endpoint to consume

OUTPUT:
  - Next.js page (Server Component by default)
  - Client/Server component split
  - Form with React Hook Form + Zod
  - Data table with server-side pagination
  - Loading, empty, error states

STANDARDS:
  - 05-CODING-STANDARDS (React + Next.js)
  - 08-FRONTEND-STANDARDS
```

### Database AI

```
INPUT:
  - Phase 3 Table Specification
  - Phase 3 Entity Relationship
  - Query patterns from screen specs

OUTPUT:
  - Prisma schema model
  - Migration file
  - Index strategy
  - Seed data

STANDARDS:
  - 06-DATABASE-STANDARDS
```

## Approval Gates

| Output | Requires Approval From |
|--------|----------------------|
| ADR | Engineering Lead |
| Module creation | Chief Architect |
| Database migration | Chief Architect + Engineering Lead |
| Security boundary change | Engineering Lead |
| Infrastructure change | Engineering Lead |
| PR merge | Human reviewer |
| Production release | Engineering Lead |
