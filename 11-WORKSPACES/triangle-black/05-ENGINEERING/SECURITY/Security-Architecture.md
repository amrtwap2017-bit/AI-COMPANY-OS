# SEC-001 — Security Architecture

## Implementation Checklist

- [x] Helmet middleware (CSP, HSTS, X-Frame-Options, etc.)
- [x] CORS configured for specific origins
- [x] Rate limiting (100 req/min per user)
- [x] JWT authentication (RS256, 15min access, 7d refresh)
- [x] Password hashing (bcrypt, cost 12)
- [x] Input validation (class-validator on all DTOs)
- [x] RBAC enforcement (RolesGuard + PermissionGuard)
- [x] Tenant isolation (TenantGuard + schema-per-tenant)
- [x] Audit logging (all mutations recorded)
- [x] File upload validation (type + size limits)
- [x] SQL injection protection (Prisma parameterized queries)
- [x] No secrets in repository (.env in .gitignore)

## CSP Policy

```typescript
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", process.env.API_URL || 'http://localhost:4000'],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  }),
);
```

## Rate Limiting Config

```typescript
// In app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,     // 1 second
    limit: 3,      // 3 requests per second
  },
  {
    name: 'medium',
    ttl: 60000,    // 1 minute
    limit: 100,    // 100 requests per minute
  },
  {
    name: 'long',
    ttl: 3600000,  // 1 hour
    limit: 1000,   // 1000 requests per hour
  },
]),
```
