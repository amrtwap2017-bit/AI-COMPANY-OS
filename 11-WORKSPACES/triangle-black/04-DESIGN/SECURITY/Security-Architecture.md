# Phase 03 — Security Architecture

> Security architecture covering authentication, authorization, data protection, and compliance.

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK SECURITY                          │
│  HTTPS (TLS 1.3) │ Firewall (UFW) │ Rate Limiting          │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION SECURITY                      │
│  JWT Auth │ RBAC │ Input Validation │ CSRF Protection       │
├─────────────────────────────────────────────────────────────┤
│                    DATA SECURITY                             │
│  Schema-per-tenant │ Encryption at Rest │ Audit Trail       │
├─────────────────────────────────────────────────────────────┤
│                    COMPLIANCE                                │
│  ETA E-Invoice │ Data Privacy │ Retention Policies          │
└─────────────────────────────────────────────────────────────┘
```

## Authentication

| Method | Implementation | Status |
|--------|---------------|--------|
| JWT Access Token | Short-lived (15 min), signed with HS256 | V1 |
| JWT Refresh Token | Long-lived (7 days), rotation on use | V1 |
| Bcrypt Password | 12 salt rounds | V1 |
| OIDC SSO (Google/Azure AD) | External IdP integration | V2 |

See `15-Security/` in Phase 3 for complete security specifications.
