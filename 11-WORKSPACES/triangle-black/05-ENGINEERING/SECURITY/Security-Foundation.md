# Phase 05 — Security Foundation

> Security infrastructure — guards, rate limiting, and protection mechanisms.

## Guard Stack

| Guard | Order | Purpose | Applied |
|-------|-------|---------|---------|
| JwtAuthGuard | 1 | Verify JWT token and extract user | Global |
| RolesGuard | 2 | Verify user has required role | Per-endpoint |
| PermissionGuard | 3 | Verify user has required permission | Per-endpoint |
| TenantGuard | 4 | Verify user belongs to tenant | Global |
| ThrottlerGuard | 5 | Rate limiting | Global |

## Rate Limiting

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| Auth (login, register) | 5 requests | 15 minutes |
| Standard API | 100 requests | 1 minute |
| Reports (heavy queries) | 20 requests | 1 minute |
| File upload | 10 requests | 1 minute |

## Secrets Management

- All secrets in environment variables (not code)
- `.env.example` with placeholder values in repo
- Production secrets injected via CI/CD secrets
- No secrets in logs or error messages
- JWT secret rotated on each production deploy

## CORS

- Allowed origins: `https://app.triangleblack.com`, `https://*.triangleblack.com`
- Methods: GET, POST, PATCH, DELETE
- Headers: Authorization, Content-Type, X-Tenant-Id
- Credentials: true (for refresh token cookie)

See `10-SECURITY/` for complete security configuration.
