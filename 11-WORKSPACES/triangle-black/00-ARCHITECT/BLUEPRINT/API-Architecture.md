# Phase 02 — API Architecture

> REST API architecture and design conventions for Triangle Black.

## API Design Conventions

| Convention | Standard | Example |
|-----------|----------|---------|
| Base URL | `/api/v1/{resource}` | `/api/v1/leads` |
| Versioning | URI path (`/api/v1/`, `/api/v2/`) | — |
| Resource naming | Plural kebab-case | `/purchase-orders` |
| HTTP methods | POST (create), GET (read), PATCH (update), DELETE (delete) | — |
| Pagination | `?page=1&limit=20` | Cursor-based for large sets |
| Filtering | `?status=active&type=xxx` | Query parameters |
| Sorting | `?sort=created_at&order=desc` | Sort field + direction |
| Fields | `?fields=id,name,status` | Sparse fieldset |
| Relationships | `?include=items,attachments` | Side-loading |
| Errors | RFC 7807 Problem Details | Standard error format |

## API Categories

| Category | Prefix | Auth | Rate Limit | Examples |
|----------|--------|------|------------|----------|
| Internal | `/api/v1/{resource}` | JWT required | 100/min | Standard CRUD |
| Public | `/api/v1/public/{resource}` | None | 10/min | Health, status |
| Partner | `/api/v1/partner/{resource}` | API key | 50/min | Webhook, integration |
| Admin | `/api/v1/admin/{resource}` | JWT + Admin role | 200/min | System administration |
| Integration | `/api/v1/integration/{resource}` | API key | 30/min | ETA, bank, SMS |

## Response Format

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

## Error Format (RFC 7807)

```json
{
  "type": "/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Lead status cannot transition from 'closed' to 'active'",
  "instance": "/api/v1/leads/LD-000042/status",
  "errors": [
    { "field": "status", "message": "Invalid status transition" }
  ]
}
```

## Authentication

See [API Architecture details in Phase 3](../PHASE-03-DIGITAL-TWIN-DESIGN/07-API-Architecture/).

## Related Documents

- [API Specifications](../PHASE-03-DIGITAL-TWIN-DESIGN/API-Specifications.md) — Complete endpoint specs
- [API Gateway](../PHASE-07-ENTERPRISE-INTEGRATION/API-Gateway.md) — Gateway configuration
- [Backend Architecture](Backend-Architecture.md) — Service implementation
