# 11 — Identity Federation

> SSO, OAuth, OIDC, enterprise identity, role mapping.

## Identity Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        IDENTITY FEDERATION LAYER                    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ JWT Auth     │  │ OAuth 2.0    │  │ OIDC         │              │
│  │ (Phase 5)    │  │ Resource Srv │  │ Relying Party│              │
│  │ Internal     │  │ External API │  │ Enterprise   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│  ┌──────▼─────────────────▼─────────────────▼───────────────────┐  │
│  │                    IDENTITY BROKER                            │  │
│  │  User resolution • Tenant resolution • Role mapping          │  │
│  │  Session federation • Token translation                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Identity Sources

| Source | Type | V1/V2 | Users |
|--------|------|-------|-------|
| Internal (Phase 5) | JWT + bcrypt | V1 (MVP) | Triangle Black employees |
| Google Workspace | OIDC | V2 | Internal team |
| Microsoft Azure AD | OIDC | V2 | Enterprise clients (employees) |
| Auth0 | Universal | V2+ | Multi-tenant identity |

## V1 Identity System (Phase 5, Frozen)

| Feature | Status |
|---------|--------|
| JWT access tokens | Built |
| JWT refresh tokens | Built |
| Password hashing (bcrypt) | Built |
| RBAC (Roles + Permissions) | Built |
| Tenant isolation | Built |
| User CRUD | Built |

V1 identity is **not replaced**. Federation is added alongside.

## V2 Identity Federation

### 1. Google Workspace SSO

| Attribute | Value |
|-----------|-------|
| Protocol | OpenID Connect |
| Auth Flow | Authorization Code + PKCE |
| Client ID | Google Cloud Console credential |
| Scopes | `openid`, `email`, `profile` |
| User creation | Auto-provision on first login |
| Role mapping | Google group → internal role |

**Flow:**
```
User clicks "Sign in with Google"
    │
    ▼
Redirect to Google OAuth → User consents
    │
    ▼
Google returns authorization code
    │
    ▼
Exchange for ID token + access token
    │
    ▼
Verify ID token (JWKS) → Extract email
    │
    ▼
Match to internal user:
    ├── Found → Issue JWT (internal)
    └── Not found → Auto-create → Issue JWT
```

### 2. Microsoft Azure AD SSO

| Attribute | Value |
|-----------|-------|
| Protocol | OpenID Connect |
| Auth Flow | Authorization Code + PKCE |
| Tenant | Enterprise client's Azure AD |
| User creation | Auto-provision on first login |
| Group sync | Azure AD groups → internal roles |

**Enterprise Client Flow:**
```
Enterprise admin configures Azure AD app
    │
    ▼
Client employee visits Triangle Black → "Sign in with Microsoft"
    │
    ▼
OIDC flow → User authenticated via Azure AD
    │
    ▼
System detects tenant from email domain → Assigns tenant context
    │
    ▼
Issue JWT (internal) → User sees only their company's data
```

### 3. API Key Authentication (External Systems)

| Attribute | Value |
|-----------|-------|
| Usage | Partner API, External API |
| Key format | `tb_{prefix}_{64-char-hex}` |
| Storage | Hashed (SHA-256) in database |
| Rotation | Every 90 days |
| Permissions | Scoped to specific resources |

**API Key Validation:**
```
Request → Check X-API-Key header
    ├── Find key hash in database
    ├── Check key is active + not expired
    ├── Resolve permissions from key scopes
    └── Attach to request context (system-level, not user-level)
```

## Role Mapping Strategy

| External Identity Provider | External Group/Role | Internal Role |
|---------------------------|-------------------|---------------|
| Google Workspace | `admin@company.com` | TENANT_ADMIN |
| Google Workspace | `engineering@company.com` | ENGINEER |
| Google Workspace | `sales@company.com` | SALES_REP |
| Azure AD | `TriangleBlack.Admin` | TENANT_ADMIN |
| Azure AD | `TriangleBlack.Engineer` | ENGINEER |
| Azure AD | `TriangleBlack.Viewer` | CLIENT_VIEWER |
| API Key (Partner) | — | PARTNER_API |
| API Key (External) | — | EXTERNAL_API |

## Session Federation

| Scenario | Method |
|----------|--------|
| Internal web app ↔ Internal API | JWT in Authorization header |
| Mobile app ↔ Internal API | JWT (same as web) |
| Partner system ↔ Partner API | API Key |
| External system ↔ External API | API Key + HMAC |
| Client portal ↔ Public API | JWT (via OAuth 2.0 V2) |

## Token Strategy

| Token | Type | Lifetime | Refresh | Storage |
|-------|------|----------|---------|---------|
| Access token (internal) | JWT (RS256) | 15 min | Refresh token | HTTP-only cookie / memory |
| Refresh token (internal) | JWT (RS256) | 7 days | Rotation | Secure cookie |
| API Key (external) | Opaque string | 90 days | Manual rotation | Hashed in DB |
| OAuth 2.0 access token | JWT / Opaque | 1 hour | Refresh token | In-memory |
| OIDC ID token | JWT | 1 hour | Re-authenticate | In-memory |

## Identity Federation Security

| Requirement | Implementation |
|-------------|---------------|
| Token signing | RS256 with rotation keys |
| JWKS endpoint | `/.well-known/jwks.json` |
| Token binding | c_hash and s_hash for OIDC |
| Session fixation | Re-generate session ID on login |
| MFA (future) | Via identity provider (Google/Azure MFA) |
| Logout | OIDC RP-Initiated Logout |
| Audit | All authentication events logged |
