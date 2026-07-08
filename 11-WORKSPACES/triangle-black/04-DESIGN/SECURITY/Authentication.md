# Authentication

## JWT Strategy

| Setting | Value |
|---------|-------|
| Algorithm | RS256 (asymmetric) |
| Access token expiry | 15 minutes |
| Refresh token expiry | 7 days |
| Issuer | triangle-black-platform |
| Audience | triangle-black-app |

### Access Token Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "manager",
  "tenantId": "tenant-uuid",
  "iat": 1680000000,
  "exp": 1680000900
}
```

### Token Flow

```
1. POST /auth/login → { accessToken (15m), refreshToken (7d) }
2. Client stores accessToken in memory, refreshToken in httpOnly cookie
3. API calls use Authorization: Bearer {accessToken}
4. On 401, POST /auth/refresh → new accessToken
5. On /auth/refresh failure → redirect to login
```

## Password Policy

| Rule | Value |
|------|-------|
| Minimum length | 8 characters |
| Complexity | 2 of: uppercase, lowercase, digit, special |
| Max age | 90 days |
| History | 5 passwords |
| Lockout | 5 attempts → 15 min lockout |
| Hash algorithm | bcrypt (cost factor 12) |

## MFA (V2)

- Time-based One-Time Password (TOTP)
- Optional, per-user setting
- QR code provisioning via authenticator app
- Backup codes: 8 single-use codes on setup
