# Documentation

| Field | Value |
|---|---|
| Document ID | 17-Engineering-07 |
| Document Purpose | Define documentation standards for developers |
| Version | 1.0 |
| Status | Approved |

## Types of Documentation

| Type | Audience | Location | Format |
|---|---|---|---|
| JSDoc | API consumers, developers | Inline in source code | `/** */` comments |
| Module README | Developers onboarding to a module | `docs/modules/MODULE_NAME.md` | Markdown |
| ADR (Architecture Decision Record) | Architects, leads, future maintainers | `docs/adr/` | Markdown |
| API Docs | Frontend, third-party consumers | Generated via Swagger/OpenAPI | `@nestjs/swagger` |
| Operational Runbooks | DevOps, on-call engineers | `docs/runbooks/` | Markdown |

## JSDoc Standards

### Must Have JSDoc
- Public API methods (services, controllers)
- Interfaces and types exposed outside the module
- Complex functions with non-obvious behavior

### Should Not Have JSDoc
- Simple getters/setters
- Trivial functions (name is self-documenting)
- Internal/private methods (unless logic is complex)

### Format

```typescript
/**
 * Creates a new user in the system.
 *
 * @param dto - Validated user creation payload
 * @returns The created user entity with generated ID
 * @throws {DomainError} If email already exists
 * @throws {ValidationError} If password does not meet requirements
 */
async createUser(dto: CreateUserDto): Promise<UserEntity> {
```

- `@param` — description of parameter, include unit types if relevant
- `@returns` — what is returned, not the type (that's TypeScript's job)
- `@throws` — documented exceptions, when they occur
- `@deprecated` — reason and migration path

## Module READMEs

Each major module should have a short README:

```markdown
# User Module

## Purpose
User registration, authentication, and profile management.

## Key Classes
- `UserService` — business logic for user operations
- `UserController` — REST endpoints under /api/users
- `UserRepository` — Prisma data access

## Dependencies
- AuthService (for password hashing)
- EmailService (for verification emails)

## Events Emitted
- `user.created` — when a new user registers
- `user.deleted` — when account is removed
```

## ADRs

Architecture Decision Records capture significant decisions.

### Structure

| Field | Description |
|---|---|
| Title | Short description of the decision |
| Status | Proposed / Accepted / Deprecated / Superseded |
| Context | Why this decision was needed |
| Decision | What was decided |
| Consequences | Impact of this decision (positive & negative) |
| Alternatives | Options considered and why rejected |

### File Naming

```
docs/adr/001-use-prisma-as-orm.md
docs/adr/002-adopt-nestjs-module-structure.md
```

## Runbooks

Operational runbooks for common tasks:

- Database migration
- Certificate renewal
- Restarting services
- Rollback procedure
- Incident response

## Cross-References

- [00-Governance/Documentation-Standards.md](../00-Governance/Documentation-Standards.md) — Project-wide doc rules
- [18-Deployment/Rollback.md](../18-Deployment/Rollback.md) — Rollback runbook
- [19-Testing/Performance.md](../19-Testing/Performance.md) — Performance testing docs
