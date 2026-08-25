# ARCHITECTURE RULES

## Violations That Must Be Detected

- Duplicated business logic across domains
- Domain leakage between bounded contexts
- Raw SQL where ORM/repository layer is required
- API logic placed in wrong architectural layer
- Circular dependencies between modules
- Security boundary violations
- Excessive coupling between unrelated domains
- Undocumented architectural decisions
- Missing repository abstraction
- Direct database access from controllers/routes

## ADR Protocol

Every significant architectural decision must produce:

ADR-XXX-title.md containing:
- Context
- Decision
- Alternatives considered
- Consequences
- Status: PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED

## Forbidden Without Explicit Architectural Approval

- New external dependencies added to core domain
- Database schema changes without migration review
- API contract changes without versioning review
- Authentication/authorization changes
- Tenant isolation model changes
