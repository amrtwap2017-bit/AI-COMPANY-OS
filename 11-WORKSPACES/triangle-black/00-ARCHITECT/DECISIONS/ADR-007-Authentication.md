# ADR-007: Authentication

**Status:** Accepted

**Context:** Triangle Black needs an authentication system that supports multiple user types (platform admins, tenant staff, guests), works with schema-per-tenant isolation (users belong to tenants), provides stateless auth for horizontal scalability, and supports session refresh without forcing frequent logins. The system must be secure (OWASP best practices) and support API access for external integrations.

**Decision:**

We will use **JWT (access token) + refresh token** authentication.

Architecture:
```
Login:
  1. User submits credentials (email + password)
  2. Server validates against user record (bcrypt password hash)
  3. Server issues:
     - Access token (JWT, 15 min expiry)
     - Refresh token (opaque or JWT, 7 day expiry, stored in DB)
  4. Client stores access token in memory, refresh token in httpOnly cookie

Request flow:
  [Client] ──Authorization: Bearer <access_token>──► [Server]
                                                          │
                ┌── Valid? ──► Proceed with request        │
                │                                         │
                └── Expired? ◄── 401 response             │
                       │                                  │
  [Client] ◄── Set-Cookie: refresh_token ◄── POST /auth/refresh
                       │
  [Client] ──Cookie: refresh_token ──► Server validates, issues new pair
```

JWT payload:
```json
{
  "sub": "user_abc123",
  "tenantId": "tenant_xyz789",
  "role": "property_admin",
  "permissions": ["reservations:write", "guests:read"],
  "iat": 1680000000,
  "exp": 1680000900
}
```

**Consequences:**

*Positive:*
- Stateless auth — no server-side session storage (scales horizontally)
- JWT contains tenant context — no extra DB lookup for tenant resolution
- Refresh tokens allow long-lived sessions without storing access tokens
- httpOnly cookies for refresh tokens prevent XSS token theft
- Role and permissions in JWT enable middleware-based authorization without DB queries

*Negative:*
- JWT revocation is not immediate (must wait for expiry, or maintain a blacklist in Redis)
- JWT size can grow with permissions; each request carries the full token
- Refresh token rotation adds complexity (old refresh tokens must be invalidated)
- httpOnly cookie-based refresh tokens require careful CORS configuration
- Token storage in browser memory means loss on page refresh (mitigated by silent refresh)

**Security measures:**
- Access tokens: 15 min expiry; short window for misuse
- Refresh tokens: 7 day expiry; stored hashed in database
- Password hashing: bcrypt with cost factor 12
- Rate limiting: 5 login attempts per minute per IP
- JWT signing: RS256 (asymmetric) or HS256 with strong secret
- Logout: delete refresh token from database; client discards access token

**Alternatives:**
- **Session-based auth (server-side sessions)** — rejected: requires stateful storage; poor horizontal scaling without Redis
- **OAuth2 + OpenID Connect** — rejected: over-engineering for V1; complex flow for first-party app; may add in V3 for third-party integrations
- **Magic link / passwordless** — rejected: added friction for daily-use staff; good for guest portal (may add later)
- **API keys only** — rejected: no user-level auth, no refresh mechanism, poor UX
- **Firebase Auth** — rejected: vendor lock-in, cost at scale, limited control

**Related ADRs:** ADR-004 (Backend), ADR-005 (Multi-tenancy), ADR-006 (API Design)
