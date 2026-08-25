# SECURITY RULES

## Absolute Prohibitions

- NEVER expose secrets, tokens, passwords in any file
- NEVER commit .env files
- NEVER disable authentication to make tests pass
- NEVER weaken tenant isolation
- NEVER bypass authorization checks
- NEVER delete security tests
- NEVER disable input validation without architectural approval
- NEVER log sensitive data (passwords, tokens, PII)

## Security Preflight Checklist

Before every commit verify:

[ ] No secrets in diff
[ ] No credentials in logs
[ ] No .env in git status
[ ] Authentication unchanged or reviewed
[ ] Authorization unchanged or reviewed
[ ] Tenant isolation unchanged or reviewed
[ ] Input validation present
[ ] SQL injection risk reviewed
[ ] XSS risk reviewed
[ ] Path traversal risk reviewed
[ ] Sensitive data exposure reviewed
[ ] Dependency additions reviewed

## Risk Classification

LOW     — CSS, copy, UI-only, no logic
MEDIUM  — Business logic, API changes
HIGH    — Database, migrations, auth-adjacent
CRITICAL — Authentication, authorization, tenant isolation, billing, data deletion

## Triangle Black Specific Security Rules

### Tenancy (CRITICAL)
- hotel_id MUST come from JWT via get_hotel_id() in src/core/tenant.py
- NEVER accept hotel_id from request body or URL parameters alone
- Every SQLAlchemy query on operational data MUST include .filter_by(hotel_id=hotel_id)
- IDOR prevention: verify ownership before returning any resource

### Authentication
- Token key: tb_access_token in localStorage (portal)
- Use tbFetch from portal/lib/api/tb-client.ts for all portal API calls
- Never create new login fixtures in tests — use auth_headers from conftest.py

### Known Pre-existing Issues (do not regress)
- portal/components/ui/GlobalSearch.tsx — TypeScript syntax errors (tracked)
- portal/components/ui/icons.tsx — TypeScript syntax errors (tracked)
