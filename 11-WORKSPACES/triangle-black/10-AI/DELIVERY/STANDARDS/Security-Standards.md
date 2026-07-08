# Security Standards

## Authentication

### Token-Based Authentication
- Use JWT (JSON Web Tokens) for stateless authentication.
- Access token: 15-minute expiry, stored in memory only.
- Refresh token: 7-day expiry, stored as HTTP-only, Secure, SameSite=Strict cookie.
- JWT signing algorithm: `RS256` (asymmetric) — never `HS256` in production.
- Private key stored in secrets manager, never in the repository.

### Implementation Requirements
```typescript
// ✅ Correct — JWT with short-lived access token
const accessToken = jwt.sign(
  { sub: userId, role: user.role, tenantId: user.tenantId },
  privateKey,
  { algorithm: 'RS256', expiresIn: '15m' }
);

// ❌ Wrong — no secrets in code
const secret = 'hardcoded-secret-key'; // NEVER DO THIS
```

## Authorization

### Role-Based Access Control (RBAC)
- Predefined roles: `admin`, `manager`, `user`, `readonly`.
- Permissions are assigned to roles, not directly to users.
- Enforce at the application layer, not just the UI layer.

### Authorization Pattern
```typescript
// ✅ Correct — guard at controller level
@Authorize('orders:create')
async createOrder(req: AuthRequest, res: Response) {
  // only users with 'orders:create' permission can access
}

// ❌ Wrong — authorization in business layer
async createOrder(userId: string) {
  if (user.role !== 'admin') throw new Error(); // mixed concerns
}
```

## Input Validation

### API Boundary Validation
- Validate all inputs at the API boundary using Zod schemas.
- Validate on every endpoint — never trust client-side validation.
- Use DTOs with Zod schemas for request bodies, query params, and path params.

```typescript
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().max(100),
  })).min(1).max(50),
  shippingAddress: z.string().max(500),
  couponCode: z.string().optional(),
});

// Validate at the controller boundary
const validated = createOrderSchema.parse(req.body);
```

## SQL Injection Prevention

- **Always use parameterized queries** — never concatenate user input into SQL strings.
- Prisma provides parameterized queries by default — never use `$queryRawUnsafe`.
- If raw SQL is necessary, use `$queryRaw` with template literals (Prisma escapes parameters).

```typescript
// ✅ Correct — Prisma parameterized query
await prisma.order.findMany({ where: { id: orderId } });

// ✅ Correct — raw query with parameter binding
await prisma.$queryRaw`SELECT * FROM orders WHERE id = ${orderId}`;

// ❌ Wrong — raw string concatenation
await prisma.$queryRawUnsafe(`SELECT * FROM orders WHERE id = '${orderId}'`);
```

## Cross-Site Scripting (XSS) Prevention

- Use React's built-in JSX escaping (auto-escapes by default).
- Never use `dangerouslySetInnerHTML` without explicit sanitization with DOMPurify.
- When rendering user-generated content, sanitize it:

```typescript
import DOMPurify from 'dompurify';

function UserComment({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

- CSP (Content Security Policy) headers must be set:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
  ```

## Cross-Site Request Forgery (CSRF)

- Use `SameSite=Strict` or `SameSite=Lax` on all cookies.
- For state-changing requests, include a CSRF token in custom headers.
- Verify `Origin` or `Referer` headers for sensitive operations.

## Secrets Management

| Secret Type | Storage | Access |
|------------|---------|--------|
| JWT private keys | Vault / AWS Secrets Manager | Application startup |
| Database credentials | Vault / environment variables | Runtime |
| API keys (third-party) | Vault / AWS Secrets Manager | Runtime |
| TLS certificates | Vault / ACM | Application startup |
| Encryption keys | KMS / Vault's transit engine | Runtime |

### Rules
- Never commit secrets to version control.
- Use `.env.example` with placeholder values (no real secrets).
- Scan with `trufflehog` or `git-secrets` to prevent secret leakage.
- Rotate secrets every 90 days (or immediately on suspected compromise).

## Dependency Security

### Scanning
- Run `npm audit` or `yarn audit` on every build.
- Integrate Snyk or Dependabot for automated vulnerability scanning.
- Block builds that have critical or high severity vulnerabilities.
- Monthly review of all dependencies for updates and removals.

### Policy
| Severity | Action | Timeline |
|----------|--------|----------|
| Critical | Immediate fix or dependency replacement | < 24 hours |
| High | Fix in current sprint | < 7 days |
| Medium | Fix in next sprint | < 30 days |
| Low | Review and schedule | < 90 days |

## HTTP Security Headers

All responses must include:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0  # (deprecated but still recommended to be explicit)
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Data Protection

- All data in transit: TLS 1.3 minimum.
- All data at rest: encrypted at the storage layer (AES-256).
- PII (Personally Identifiable Information) is encrypted at the application layer before storage.
- Logging never includes PII, secrets, or tokens.
- Database backups are encrypted.

## Rate Limiting

- Apply rate limiting to all API endpoints.
- More restrictive limits on auth endpoints (5 attempts per minute for login).
- Rate limit by IP and/or tenant ID.
- Return `Retry-After` header when rate limited.
