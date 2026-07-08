# Master Task Template

## Task Metadata

| Field        | Description                                     | Required |
|-------------|-------------------------------------------------|----------|
| Task ID     | Unique identifier (e.g., T-042-01)              | Yes      |
| Title       | Concise descriptive name of the task             | Yes      |
| Story Link  | Parent user story ID (e.g., US-042)             | Yes      |
| Type        | Task category (backend, frontend, database, etc.) | Yes    |
| Status      | Current lifecycle stage                          | Yes      |
| Created     | ISO 8601 timestamp of creation                   | Yes      |
| Assignee    | Human or AI agent assigned                       | Yes      |

## Description

Provide a clear, concise description of the work to be performed. Include the purpose of the task and how it contributes to the parent story.

```
Implement the role CRUD API endpoints for the RBAC system.
This includes endpoints for creating, reading, updating, and deleting
roles, with input validation, error handling, and audit logging.
```

## Acceptance Criteria

Specific, testable conditions that this task must satisfy.

| # | Condition                                          | Expected Result                          |
|---|----------------------------------------------------|------------------------------------------|
| 1 | POST /api/v1/roles with valid body                 | 201 response with role object            |
| 2 | POST /api/v1/roles with duplicate name             | 409 response with conflict error         |
| 3 | GET /api/v1/roles returns role list                | 200 response with paginated results      |
| 4 | GET /api/v1/roles/{id} with valid ID               | 200 response with role object            |
| 5 | GET /api/v1/roles/{id} with invalid ID             | 404 response with not found error        |
| 6 | PUT /api/v1/roles/{id} with valid update           | 200 response with updated role object    |
| 7 | DELETE /api/v1/roles/{id} with no assigned agents  | 204 response, role removed               |
| 8 | DELETE /api/v1/roles/{id} with assigned agents     | 409 response, role not removed           |

## Inputs

The documents, context, and dependencies required before work can begin.

| Input                          | Source                | Format    |
|--------------------------------|-----------------------|-----------|
| Parent story specifications    | US-042                | Story     |
| API specification for RBAC     | API Spec v2.3 §4.2    | OpenAPI   |
| Data model for agent_roles     | DB Schema v1.5        | ERD       |
| Audit logging standards        | Engineering Guide §7  | Document  |
| Existing role model code       | src/models/role.go    | Code      |

## Outputs (Deliverable Contract)

The artifacts this task must produce.

| Output                        | Location               | Format    |
|-------------------------------|------------------------|-----------|
| Role CRUD service             | src/services/role.go   | Go source |
| Role CRUD API handler         | src/handlers/role.go   | Go source |
| Role request/response DTOs    | src/dto/role.go        | Go source |
| Input validation functions    | src/validators/role.go | Go source |
| Role route registration       | src/routes.go          | Go source |
| Unit tests                    | src/services/role_test.go | Go source |

## Effort Estimate

| Field       | Value         |
|-------------|---------------|
| Effort      | 6 hours       |
| Complexity  | Medium        |
| Risk        | Low           |

## Dependencies

| Task ID     | Dependency Type | Description              |
|-------------|-----------------|--------------------------|
| T-042-01    | Depends On      | Database migration must be complete |
| T-042-03    | Blocks          | Permission logic depends on role CRUD |

## Quality Gates

| Gate                     | Criteria                                         | Verifier       |
|--------------------------|--------------------------------------------------|----------------|
| All tests pass           | Unit tests pass, ≥80% coverage on new code       | CI Pipeline    |
| Code review              | Peer review completed, no critical findings      | Reviewer       |
| API contract alignment   | API responses match OpenAPI spec                 | Contract Test  |
| Error handling           | All error cases return appropriate status codes  | Reviewer       |
| Audit logging            | All mutating operations are logged               | Reviewer       |
| Security check           | Input validation, no SQL injection, auth enforced | Security Scan  |

## Additional Notes

```
- Use the existing role model pattern from src/models/role.go as reference.
- All endpoints must support the standard request tracing header (X-Request-ID).
- Error responses must use the standard error payload format: { "error": string, "code": string, "details": object }.
```
