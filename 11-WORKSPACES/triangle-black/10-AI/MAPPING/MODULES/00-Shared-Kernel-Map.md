# Shared Kernel Module Map

## Scope
Base entities, value objects, enums, shared events, base services, utility functions, and cross-cutting concerns shared across all domain modules.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Base Entities | 5 | 200 |
| Value Objects | 10 | 150 |
| Enums | 15 | 100 |
| Shared Events | 8 | 120 |
| Base Services | 6 | 180 |
| Utilities | 12 | 90 |
| Exceptions & Filters | 4 | 80 |
| Guards & Interceptors | 6 | 110 |

## Documents Consumed (from Program 1)
- `01-ARCHITECTURE/01-Next.js-Architecture.md` — Folder structure, component patterns
- `01-ARCHITECTURE/02-NestJS-Architecture.md` — Module structure, service patterns
- `01-ARCHITECTURE/03-Database-Architecture.md` — Prisma schema patterns, naming conventions
- `01-ARCHITECTURE/04-Shared-Modules.md` — Shared kernel design

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 8 |
| Frontend pages | Next.js pages | 0 |
| Database tables | Prisma models | 0 |
| API endpoints | REST routes | 0 |
| Test files | spec/test files | 24 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| BaseEntity | - | Abstract base with id, timestamps, version |
| AuditableEntity | - | Extends BaseEntity with createdBy, updatedBy |
| SoftDeletableEntity | - | Extends BaseEntity with deletedAt |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| N/A — Shared kernel exposes no endpoints directly | | |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| N/A — No screens in shared kernel | | |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| None — AI agents are domain-specific | |

## Estimated Sprint Allocation: 2 sprints

## Dependencies
- None — Shared kernel has no internal dependencies

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 90%
- Prisma — Schema validation
