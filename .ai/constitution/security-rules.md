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
