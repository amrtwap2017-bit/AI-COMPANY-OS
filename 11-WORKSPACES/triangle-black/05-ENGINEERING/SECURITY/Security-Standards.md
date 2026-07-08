# Phase 04 — Security Standards

> Application security standards and requirements.

## Authentication

| Method | Status | Implementation |
|--------|--------|---------------|
| JWT Access Token | V1 | 15-min expiry, HS256, stored in memory |
| JWT Refresh Token | V1 | 7-day expiry, rotation, httpOnly cookie |
| Password Hashing | V1 | bcrypt, 12 rounds |
| Rate Limiting | V1 | Per-IP, per-endpoint, per-user |
| OIDC SSO | V2 | Google, Azure AD |

## Authorization

| Mechanism | Scope | Implementation |
|-----------|-------|---------------|
| Roles | Global (Admin, Manager, User) | RolesGuard |
| Permissions | Per-action (create:lead, approve:po) | PermissionGuard |
| Tenants | Per-request schema isolation | TenantMiddleware |

## Data Protection

| Measure | Implementation |
|---------|---------------|
| Encryption in transit | TLS 1.3 (Nginx) |
| Encryption at rest | PostgreSQL TDE (V2) or filesystem encryption |
| Secrets management | Environment variables (V1), Vault (V2) |
| Password storage | bcrypt, never plaintext |
| API keys | Hashed before storage, partial display |

## Vulnerability Management

- `npm audit` on every CI run
- Weekly dependency updates via Renovate
- No secrets in code (git-secrets pre-commit hook)
- HTTPS enforced (HTTP redirected to HTTPS)

See `14-SECURITY/` for complete security standards and audit procedures.
