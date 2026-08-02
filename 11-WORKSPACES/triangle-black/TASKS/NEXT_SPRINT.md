# NEXT_SPRINT.md — Triangle Black

## Proposed: Security Sprint

### Goal
Verify multi-tenant isolation across all 70+ modules.
Fix all P0 security issues.

### Proposed Tasks

| ID | Task | Owner | Priority |
|----|------|-------|----------|
| SEC-001 | Audit all service.py for tenant_id | Security Agent | P0 |
| SEC-002 | Admin portal auth review | Security Agent | P0 |
| SEC-003 | File upload validation | Security Agent | P1 |
| SEC-004 | Add tenant isolation tests | Testing Agent | P0 |
| TC-001 | Auth module tests to 95% | Testing Agent | P0 |

### Acceptance Criteria

- Every service.py verified for tenant_id
- Zero P0 security issues open
- Auth tests at 95% coverage

### Requires Amr Approval Before Start
