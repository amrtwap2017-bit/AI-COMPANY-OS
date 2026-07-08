# Phase 02 — Backend Architecture

> NestJS backend architecture for Triangle Black.

## Module Structure

```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/        # @CurrentUser, @Roles, @Permissions
│   ├── guards/            # JwtAuthGuard, RolesGuard, PermissionGuard, TenantGuard
│   ├── interceptors/      # LoggingInterceptor, TransformInterceptor
│   ├── filters/           # HttpExceptionFilter, AllExceptionsFilter
│   ├── pipes/             # ValidationPipe, ParseUUIDPipe
│   ├── middleware/        # TenantMiddleware
│   ├── dto/               # PaginatedDto, ApiResponseDto
│   └── utils/             # Common utilities
├── modules/
│   ├── auth/              # JWT, bcrypt, refresh, registration
│   ├── users/             # User CRUD, profile management
│   ├── tenants/           # Tenant provisioning, schema management
│   ├── roles/             # Role definition, assignment
│   ├── permissions/       # Permission definitions
│   ├── audit/             # Audit trail
│   ├── notifications/     # In-app + event-driven notifications
│   ├── files/             # File upload, DO Spaces integration
│   ├── health/            # Health check endpoints
│   └── ...business modules from Phase 6
└── events/                # Event definitions, handlers
```

## Key Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| CQRS | NestJS CQRS module | Separate read/write for complex domains |
| Event Sourcing | Domain events + audit store | Traceability across domain operations |
| Repository | Prisma service wrappers | Data access abstraction |
| Factory | Complex object construction | Quotation, Contract creation |
| Strategy | Configurable algorithms | Lead scoring, margin calculation |
| Decorator | Custom NestJS decorators | Auth, logging, validation |

## Middleware Pipeline

```
Request → TenantMiddleware → JwtAuthGuard → RolesGuard → PermissionGuard → ValidationPipe → Controller → Service → Prisma → Response
```

## Error Handling

- All exceptions caught by global `HttpExceptionFilter`
- Returns RFC 7807 Problem Details format
- Domain-specific exceptions with error codes
- Audit log on all domain exceptions

## Related Documents

- `21-Implementation Blueprint.md` — Existing implementation details
- [API Architecture](API-Architecture.md) — API design conventions
- [Security Architecture](../PHASE-03-DIGITAL-TWIN-DESIGN/Security-Architecture.md)
