# Phase 05 — API Foundation

> API framework, interceptors, filters, and response formatting.

## API Pipeline

```
Request → Rate Limiter → JwtAuthGuard → RolesGuard → PermissionGuard → TenantMiddleware → ValidationPipe → Controller → Service → Interceptor → Response
```

## Built Components

| Component | Purpose | Implementation |
|-----------|---------|---------------|
| JwtAuthGuard | Verify JWT token | Global guard |
| RolesGuard | Check user role | Decorator-based |
| PermissionGuard | Check action permission | Decorator-based |
| TenantMiddleware | Resolve tenant from subdomain/header | Middleware |
| TransformInterceptor | Standardize response format | Global interceptor |
| LoggingInterceptor | Log request/response | Global interceptor |
| ValidationPipe | DTO validation | Global pipe |
| HttpExceptionFilter | RFC 7807 errors | Global filter |

## Response Format

```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 42 },
  "error": null,
  "timestamp": "2026-01-15T10:30:00Z"
}
```

## Error Format

```json
{
  "type": "/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Invalid field value",
  "instance": "/api/v1/leads",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

See `07-API-FOUNDATION/` for complete API configuration.
