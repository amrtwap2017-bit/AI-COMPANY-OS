# Stage 05: Backend

## Purpose

Implement the server-side feature code including service layer, controllers, DTOs, business logic, and API endpoints according to the architecture and database specifications.

## Agent Role

**Backend Lead AI** — Responsible for all backend implementation including service logic, API exposure, and data access.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Architecture Spec | Architecture artifact with status `APPROVED` |
| Database Migration | Migration artifact with status `APPROVED` |
| Coding Standards | TypeScript coding standards are defined and accessible |
| Existing Codebase | Current backend source code is available and buildable |

## Process

### Step 1: Generate Boilerplate
- Create the feature module structure following the project's Clean Architecture layout:
  - `src/domains/<feature>/domain/` — entities, value objects, repository interfaces
  - `src/domains/<feature>/application/` — use cases, DTOs, input/output ports
  - `src/domains/<feature>/infrastructure/` — repository implementations, external adapters
  - `src/domains/<feature>/presentation/` — controllers, request/response models, routes

### Step 2: Implement Domain Layer
- Create entities with required properties, validation, and business methods.
- Define value objects for concepts that have validation rules (e.g., `Email`, `Money`).
- Define repository interfaces as TypeScript abstract classes or interfaces.
- Write domain events if the feature requires event-driven communication.

### Step 3: Implement Application Layer
- Create use case classes that orchestrate business logic.
- Implement input DTOs with class-validator or Zod schemas for validation.
- Implement output DTOs that shape data for the presentation layer.
- Wire up dependency injection (constructor injection pattern).

### Step 4: Implement Infrastructure Layer
- Implement repository adapters using Prisma client.
- Implement any external service clients (APIs, message queues, etc.).
- Register implementations in the DI container.

### Step 5: Implement Presentation Layer
- Create REST or GraphQL controllers.
- Define request validation schemas.
- Map requests to use case input DTOs and use case output to response DTOs.
- Register routes in the application's router.

### Step 6: Write Unit Tests
- Write unit tests for domain entities and value objects (100% coverage).
- Write unit tests for use cases with mocked dependencies.
- Write integration tests for repository implementations against a test database.

### Step 7: Verify Build and Lint
- Run `tsc --noEmit` to verify type correctness.
- Run `lint` and `format` to enforce code style.
- Run unit tests to confirm all tests pass.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Backend Implementation Complete | All layers (domain, application, infrastructure, presentation) implemented |
| All Tests Pass | Unit and integration tests pass |
| Type Check Passes | `tsc --noEmit` produces zero errors |
| Lint Clean | No linting violations |
| Build Succeeds | Application builds without errors |
| API Contracts Documented | OpenAPI spec updated or GraphQL schema updated |

## Artifact Template

```markdown
# Backend Implementation: <Feature Title>

**Architecture Spec**: `ARCH-<ID>`
**Database Migration**: `DB-<ID>`
**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Files Created
| Layer | File | Purpose |
|-------|------|---------|
| Domain | `entities/order.entity.ts` | Order entity |
| Application | `use-cases/process-order.usecase.ts` | Process order logic |
| Infrastructure | `repositories/order.repository.ts` | Prisma order repo |
| Presentation | `controllers/order.controller.ts` | REST endpoints |

## Files Modified
- `src/app.module.ts` — registered new module
- `src/router.ts` — added order routes

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/orders | Create order |
| GET | /api/orders/:id | Get order by ID |

## Test Summary
- Unit: 12 tests, 12 passed
- Integration: 5 tests, 5 passed
- Coverage: 85%

## Build Status
- [x] TypeScript: no errors
- [x] Lint: clean
- [x] Build: successful
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| TypeScript compilation errors | Fix type mismatches, update DTOs/interfaces |
| Tests failing | Review and fix implementation to match expectations |
| Lint violations | Run formatter and fix style issues |
| Missing DI registration | Register all new modules in the DI container |
| API contract mismatch | Align controller responses with OpenAPI spec |

## Cross-References

- [03-Architecture.md](./03-Architecture.md)
- [04-Database.md](./04-Database.md)
- [Standards: Coding Standards](../05-STANDARDS/Coding-Standards.md)
- [Standards: API Standards](../05-STANDARDS/API-Standards.md)
