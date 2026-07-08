# API Architecture

## Base URL

```
Development:  http://localhost:4000/api/v1
Staging:      https://staging.triangleblack.tech/api/v1
Production:   https://app.triangleblack.tech/api/v1
```

## URL Conventions

```
GET    /api/v1/{module}/{resource}          — List (paginated)
GET    /api/v1/{module}/{resource}/:id      — Get by ID
POST   /api/v1/{module}/{resource}          — Create
PUT    /api/v1/{module}/{resource}/:id      — Full update
PATCH  /api/v1/{module}/{resource}/:id      — Partial update
DELETE /api/v1/{module}/{resource}/:id      — Soft delete
```

## Module Prefixes

| Module | Base Path |
|--------|-----------|
| Auth | /api/v1/auth |
| CRM | /api/v1/crm |
| Quotations | /api/v1/quotations |
| Projects | /api/v1/projects |
| Client Portal | /api/v1/portal |
| Administration | /api/v1/admin |
| Documents | /api/v1/documents |
| Executive | /api/v1/executive |
| Reports | /api/v1/reports |

## Resource Naming

- Plural nouns: `/leads`, `/opportunities`, `/companies`
- Nested for sub-resources: `/opportunities/:id/quotations`
- Actions for non-CRUD: `/:id/approve`, `/:id/submit`, `/bulk`

## Pagination

### Request

```
GET /api/v1/crm/leads?page=1&limit=20
GET /api/v1/crm/leads?cursor=abc123&limit=20
```

### Response

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

For cursor-based pagination (activity feeds, notifications):

```json
{
  "data": [...],
  "meta": {
    "nextCursor": "xyz789",
    "hasMore": true
  }
}
```

## Filtering, Sorting, Searching

```
GET /api/v1/crm/leads?status=new,contacted&assignedTo=uuid
GET /api/v1/crm/opportunities?sort=-value,createdAt
GET /api/v1/crm/leads?search=john+doe+hilton
```

## API Versioning

- Version via URL path: `/api/v1/`, `/api/v2/`
- Version header: `Accept: application/vnd.triangleblack.v1+json`
- Deprecation header: `Sunset: Sat, 01 Jan 2027 00:00:00 GMT`
- Minimum 6 months deprecation notice

## Standard Response Envelope

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Email is required", "code": "REQUIRED" }
    ]
  }
}
```

### List

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | GET, PUT, PATCH success |
| 201 | POST created |
| 204 | DELETE success |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 422 | Business rule violation |
| 429 | Rate limited |
| 500 | Internal server error |

## Authentication

- JWT Bearer token in Authorization header
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (HTTP-only cookie)
- Token in header: `Authorization: Bearer {token}`

## Tenant Resolution

- JWT contains `tenant_id` claim
- All tenant-scoped requests resolve schema from `tenant_id` claim
- Admin endpoints use `x-tenant-id` header for cross-tenant operations
