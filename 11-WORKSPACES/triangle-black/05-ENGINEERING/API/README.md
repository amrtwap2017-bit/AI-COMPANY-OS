# 07 — API Standards

## REST Conventions

| Method | Action | Response |
|--------|--------|----------|
| GET | List resources | 200 + array + pagination meta |
| GET | Get resource by ID | 200 + single resource |
| POST | Create resource | 201 + created resource |
| PUT | Full update | 200 + updated resource |
| PATCH | Partial update | 200 + updated resource |
| DELETE | Soft delete | 204 |

## URL Structure

```
/api/v1/{module}/{resource}
/api/v1/{module}/{resource}/{id}
/api/v1/{module}/{resource}/{id}/{action}
/api/v1/{module}/{parent}/{parentId}/{child}
```

## Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

## Error Response

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

## Pagination

```typescript
// Request
interface PaginationQuery {
  page?: number;    // default: 1
  limit?: number;   // default: 20, max: 100
  cursor?: string;  // for cursor-based pagination
}

// Response meta
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextCursor?: string;
}
```

## Filtering

```typescript
// Syntax
GET /api/v1/crm/leads?status=new,contacted&assignedTo=uuid

// Range filters
GET /api/v1/crm/opportunities?value.gte=100000&value.lte=500000

// Date range
GET /api/v1/crm/opportunities?closeDate.gte=2026-07-01&closeDate.lte=2026-07-31
```

## Sorting

```typescript
// Prefix with - for descending
GET /api/v1/crm/leads?sort=-createdAt
GET /api/v1/crm/opportunities?sort=-value,createdAt
```

## Searching

```typescript
// Full-text search
GET /api/v1/crm/leads?search=john+hilton
```

## HTTP Status Codes

| Code | When |
|------|------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Duplicate/conflict |
| 422 | Business rule violation |
| 429 | Rate limited |
| 500 | Internal error |
