# 03 — API Gateway Strategy

> Unified API layer for internal, external, partner, and public interfaces.

## API Gateway Architecture

```
                          ┌────────────────────────────────────┐
                          │         API GATEWAY LAYER          │
                          │      (NestJS Gateway Module)       │
                          │                                    │
  External Clients ──────►│  ┌──────────────────────────────┐  │
  (Browser, Mobile,       │  │     Authentication Layer     │  │
   Partner, Public)       │  │  JWT / OAuth / API Key       │  │
                          │  └──────────────┬───────────────┘  │
                          │                 │                  │
                          │  ┌──────────────▼───────────────┐  │
                          │  │     Rate Limiting Layer      │  │
                          │  │  Per-key / Per-IP / Per-Plan │  │
                          │  └──────────────┬───────────────┘  │
                          │                 │                  │
                          │  ┌──────────────▼───────────────┐  │
                          │  │     Request Validation       │  │
                          │  │  OpenAPI schema enforcement  │  │
                          │  └──────────────┬───────────────┘  │
                          │                 │                  │
                          │  ┌──────────────▼───────────────┐  │
                          │  │     Routing Layer            │  │
                          │  │  Internal / External / Admin │  │
                          │  └──────────────┬───────────────┘  │
                          │                 │                  │
                          │  ┌──────────────▼───────────────┐  │
                          │  │     Response Transformation  │  │
                          │  │  Envelope / Pagination / Err │  │
                          │  └──────────────────────────────┘  │
                          └────────────────────────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                   ┌─────▼─────┐             ┌───────▼──────┐
                   │  Internal  │             │   External   │
                   │  Services │             │  Integrations│
                   │ (Phase 5-6)│             │  (Phase 7)   │
                   └───────────┘             └──────────────┘
```

## API Types

### Internal API

| Attribute | Value |
|-----------|-------|
| Audience | First-party web application (Next.js) |
| Authentication | JWT (access + refresh tokens) |
| Base Path | `/api/v1/{domain}` |
| Consumers | Triangle Black web app (Phase 5 frontend) |
| Rate Limit | 1000 req/min per user |
| Documentation | Auto-generated from NestJS decorators |

### External API

| Attribute | Value |
|-----------|-------|
| Audience | Third-party systems integrating with Triangle Black |
| Authentication | API Key (OAuth for V2) |
| Base Path | `/api/v1/ext/{resource}` |
| Consumers | PMS systems, ERP, partners |
| Rate Limit | 100 req/min per API key |
| Documentation | OpenAPI 3.0 spec |
| Backward Compatibility | Semantic versioning in URL `/api/v1/ext/` |
| Deprecation | 6-month notice, sunset header |

### Partner API

| Attribute | Value |
|-----------|-------|
| Audience | Approved suppliers, contractors, consultants |
| Authentication | API Key + IP whitelist |
| Base Path | `/api/v1/partner/{resource}` |
| Consumers | Supplier portal, contractor portal |
| Rate Limit | 60 req/min per key |
| Scopes | Limited to own data only |

### Public API (Future)

| Attribute | Value |
|-----------|-------|
| Audience | Open developer ecosystem |
| Authentication | OAuth 2.0 (Authorization Code + PKCE) |
| Base Path | `/api/v1/public/{resource}` |
| Rate Limit | 20 req/min (unauthenticated), 200 req/min (authenticated) |

### Admin API

| Attribute | Value |
|-----------|-------|
| Audience | System administrators, internal tools |
| Authentication | JWT + admin role check |
| Base Path | `/api/v1/admin/{resource}` |
| Consumers | Tenant admin, system admin |
| Rate Limit | 500 req/min per admin user |

## Authentication Matrix

| API Type | Method | V1 Implementation | V2 Evolution |
|----------|--------|-------------------|--------------|
| Internal | JWT | Access + Refresh tokens | + MFA |
| External | API Key | Static key in header | + OAuth 2.0 |
| Partner | API Key + HMAC | Key + signature verification | + mTLS |
| Public | OAuth 2.0 | — | V2 only |
| Admin | JWT + Role | RBAC from Phase 5 | + Audit context |

## Authorization Pattern

```
Request → Gateway → Authenticate → Resolve Identity → Authorize → Route to Service
                              │            │               │
                         JWT/Key/OAuth  User+Tenant    Permission check
                                          Context       (Phase 5 RBAC)
```

## Versioning Strategy

| Component | Strategy | Example |
|-----------|----------|---------|
| Internal API | URL versioning (major only) | `/api/v1/leads` |
| External API | URL versioning (major.minor) | `/api/v1/ext/v2.1/invoices` |
| Partner API | Header versioning | `Accept-Version: 1` |
| Webhook Payloads | Schema version in payload | `{ "version": "1.0", ... }` |
| Integration ACL | Internal translation (no version) | Transforms any version to domain model |

### Backward Compatibility Rules

1. **Adding fields**: Always backward compatible
2. **Removing fields**: Deprecate first (6-month notice), then remove in next major
3. **Changing field types**: New major version
4. **Changing required to optional**: Backward compatible
5. **Changing optional to required**: New major version
6. **Old versions**: Maintained for 6 months after deprecation notice
7. **Sunset header**: `Sunset: Sat, 01 Jan 2027 00:00:00 GMT`

## Rate Limiting Strategy

| Tier | Limit | Burst | Applied To |
|------|-------|-------|------------|
| Free (unauthenticated) | 20 req/min | 5 | Public endpoints |
| Standard (authenticated) | 200 req/min | 20 | Internal API users |
| Premium (API key) | 1000 req/min | 50 | Partners, external |
| Admin | 2000 req/min | 100 | Admin endpoints |
| Integration (webhook) | 500 req/min | 50 | Webhook dispatch |

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Response Format (RFC 7807)

```json
{
  "type": "https://api.triangleblack.com/errors/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "API key 'abc123' exceeded 200 requests per minute",
  "instance": "/api/v1/leads",
  "retry_after": 45
}
```

## API Documentation Strategy

| Tool | Purpose |
|------|---------|
| OpenAPI 3.0 | Contract-first API specification |
| Swagger UI | Developer exploration (NestJS Swagger module) |
| Stoplight (future) | Design-first API documentation portal |

## Gateway Implementation (V1)

V1 gateway uses NestJS built-in features — no separate gateway proxy:

| Feature | Implementation |
|---------|---------------|
| Authentication | NestJS Guards (JwtAuthGuard, ApiKeyGuard) |
| Rate Limiting | `@nestjs/throttler` module |
| Validation | NestJS ValidationPipe + class-validator |
| Routing | NestJS modules with path prefixes |
| Documentation | `@nestjs/swagger` |
| CORS | Configured per environment |

No additional infrastructure cost. Runs on existing VPS.

## Gateway Implementation (V2+)

| Feature | Tool | Cost |
|---------|------|------|
| Dedicated API Gateway | Kong / Traefik / Envoy | Free (self-hosted) |
| API Key Management | Kong Manager | Free |
| Developer Portal | Kong Dev Portal / Stoplight | Free-$50/mo |
| mTLS | Envoy / Kong | Free |
| OAuth 2.0 | Kong OAuth / Auth0 | Free-$200/mo |
