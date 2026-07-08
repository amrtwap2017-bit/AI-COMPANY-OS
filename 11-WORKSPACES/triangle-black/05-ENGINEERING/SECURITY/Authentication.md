# Authentication Architecture

## Overview

Authentication uses JWT (JSON Web Tokens) with short-lived access tokens and longer-lived refresh tokens. Passwords are hashed with bcrypt. MFA is designed but deferred to V2.

## Authentication Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Browser  │                    │  Backend  │                    │    DB     │
└─────┬────┘                    └─────┬────┘                    └─────┬────┘
      │                               │                               │
      │  POST /auth/login             │                               │
      │  { email, password }          │                               │
      │──────────────────────────────►│                               │
      │                               │  SELECT user WHERE email=?    │
      │                               │──────────────────────────────►│
      │                               │  user record                  │
      │                               │◄──────────────────────────────│
      │                               │                               │
      │                               │  bcrypt.verify(password, hash)│
      │                               │                               │
      │                               │  Generate:                    │
      │                               │  ├─ access_token (15 min)    │
      │                               │  └─ refresh_token (7 days)   │
      │                               │  Store refresh_token hash     │
      │                               │──────────────────────────────►│
      │                               │                               │
      │  { access_token,              │                               │
      │    refresh_token,             │                               │
      │    expires_in: 900 }          │                               │
      │◄──────────────────────────────│                               │
      │                               │                               │
      │  ─── Subsequent Requests ───  │                               │
      │  GET /api/reservations        │                               │
      │  Authorization: Bearer <jwt>  │                               │
      │──────────────────────────────►│                               │
      │                               │  Verify JWT signature         │
      │                               │  Extract user_id, tenant_id   │
      │                               │  Check expiration             │
      │                               │  ─────────────────            │
      │                               │  Process request              │
      │◄──────────────────────────────│                               │
```

## Password Policy

| Policy | Value | Enforcement |
|--------|-------|-------------|
| Minimum length | 12 characters | Client + Server validation |
| Complexity | Upper, lower, number, special | Server validation |
| Common password check | Yes (200 most common) | Server validation (haveibeenpwned API optional) |
| Maximum length | 128 characters | Server validation |
| Password history | 5 previous passwords | Server validation |
| Expiry | 90 days | Server (configurable per tenant) |
| Account lockout | 5 attempts, 15 min lockout | Server (brute force protection) |
| Lockout duration | 15 minutes (doubles each incident) | Server |
| Password reset | Email link, 1-hour expiry | Server |

## JWT Implementation

### Access Token

```typescript
// Token payload
interface AccessTokenPayload {
  sub: string;          // user UUID
  tenant_id: string;    // tenant UUID (schema identifier)
  role: string;         // user role
  permissions: string[]; // explicit permission list
  iat: number;          // issued at
  exp: number;          // expiration (15 minutes)
}

// Signing
const accessToken = jwt.sign(
  payload,
  process.env.JWT_SECRET,
  { algorithm: 'HS256', expiresIn: '15m' }
);
```

### Refresh Token

```typescript
// Token payload
interface RefreshTokenPayload {
  sub: string;          // user UUID
  token_id: string;     // unique token identifier (for revocation)
  iat: number;
  exp: number;          // expiration (7 days)
}

// Signing
const refreshToken = jwt.sign(
  { sub: user.id, token_id: uuid() },
  process.env.JWT_REFRESH_SECRET,
  { algorithm: 'HS256', expiresIn: '7d' }
);

// Store hash in database for revocation
await prisma.refreshToken.create({
  data: {
    token_id: tokenId,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
  },
});
```

### Token Validation Middleware

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user info to request
      request.user = {
        id: payload.sub,
        tenantId: payload.tenant_id,
        role: payload.role,
        permissions: payload.permissions,
      };

      return true;
    } catch {
      return false;
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## Security Measures

| Measure | Implementation |
|---------|---------------|
| Token storage | HttpOnly, Secure, SameSite=Strict cookies (SPA) + memory |
| Refresh token rotation | Old refresh token invalidated when new one issued |
| Token revocation | On password change, logout all sessions, or admin action |
| Algorithm | HS256 (HMAC-SHA256) — symmetric, fast |
| Secret strength | 256-bit random key, stored in environment variable |
| Clock skew | 30 seconds tolerance for token validation |
| Rate limiting | 10 requests/min on `/api/auth/login` per IP |

## Endpoints

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| `/api/auth/login` | POST | Authenticate with email + password | 10/min/IP |
| `/api/auth/refresh` | POST | Exchange refresh token for new access token | 20/min/IP |
| `/api/auth/logout` | POST | Invalidate refresh token | 20/min/IP |
| `/api/auth/register` | POST | Create new user account (admin only) | 5/min/IP |
| `/api/auth/forgot-password` | POST | Send password reset email | 3/min/IP |
| `/api/auth/reset-password` | POST | Reset password with token | 5/min/IP |
| `/api/auth/change-password` | POST | Change password (authenticated) | 5/min/user |

## MFA Roadmap (V2)

```typescript
// Design ready for V2 implementation
interface MFAConfig {
  method: 'totp' | 'sms' | 'email';  // TOTP is primary
  enabled: boolean;
  secret?: string;                      // TOTP secret (encrypted)
  backup_codes: string[];               // 8 single-use backup codes
  last_verified: Date;
}

// MFA flow extension
// POST /auth/login → { mfa_required: true, mfa_token: "..." }
// POST /auth/mfa/verify → { mfa_token, code } → { access_token, refresh_token }
```

## Security Headers for Auth Endpoints

```http
Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=604800
X-Auth-Token-Expires: 900
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1698765432
```

## Brute Force Protection

```typescript
// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                       // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

// Account lockout (after 5 failed attempts)
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

async function handleFailedLogin(email: string) {
  await prisma.$executeRaw`
    UPDATE users
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE
          WHEN failed_attempts + 1 >= ${MAX_FAILED_ATTEMPTS}
          THEN NOW() + interval '15 minutes'
          ELSE locked_until
        END
    WHERE email = ${email}
  `;
}
```
