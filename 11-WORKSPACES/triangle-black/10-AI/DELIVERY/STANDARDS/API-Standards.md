# API Standards

## REST Conventions

### Base URL
```
/api/v{version}/
```

### Resource Naming
- Use plural nouns for resources: `/api/v1/orders`, `/api/v1/users`.
- Use kebab-case for multi-word resources: `/api/v1/order-items`.
- Nest resources for hierarchical relationships: `/api/v1/orders/{id}/items`.
- Avoid deep nesting (max 2 levels). Use query parameters for further filtering.

### HTTP Methods

| Method | Action | Status Codes |
|--------|--------|-------------|
| `GET` | Retrieve resource(s) | 200, 404 |
| `POST` | Create resource | 201, 400, 409 |
| `PUT` | Full replace | 200, 204, 400, 404 |
| `PATCH` | Partial update | 200, 400, 404 |
| `DELETE` | Remove resource | 204, 404 |

### Query Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `page` | Page number (offset pagination) | `?page=2` |
| `limit` | Items per page | `?limit=20` |
| `cursor` | Cursor-based pagination | `?cursor=abc123` |
| `sort` | Sort field | `?sort=createdAt` |
| `order` | Sort direction | `?order=desc` |
| `filter` | Field filter | `?filter[status]=ACTIVE` |
| `include` | Related resources | `?include=items` |
| `fields` | Sparse fieldset | `?fields=id,name,status` |

## OpenAPI Compliance

- API documentation is written in OpenAPI 3.1 (YAML) in `docs/api/openapi.yaml`.
- Every endpoint must have:
  - `summary` and `description`.
  - Request body schema for POST/PUT/PATCH.
  - Response schema for 2xx and error responses.
  - `security` requirement.
  - Example values for request/response bodies.
- Generate TypeScript client types from the OpenAPI spec.

```yaml
/orders:
  post:
    summary: Create a new order
    operationId: createOrder
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateOrderRequest'
          example:
            items: [{ productId: "prod_123", quantity: 2 }]
    responses:
      '201':
        description: Order created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Order'
```

## Versioning

- Version is in the URL path: `/api/v1/`, `/api/v2/`.
- A new version is created only when breaking changes are introduced.
- Old versions are supported for a minimum of 6 months after the new version is released.
- Deprecation is communicated via the `Deprecation` and `Sunset` HTTP headers.

```http
Deprecation: true
Sunset: Sun, 01 Jan 2027 00:00:00 GMT
```

## Error Format (RFC 7807)

All errors return the Problem Details format (`application/problem+json`):

```json
{
  "type": "https://api.example.com/errors/order-not-found",
  "title": "Order Not Found",
  "status": 404,
  "detail": "Order with ID 'ord_123' was not found.",
  "instance": "/api/v1/orders/ord_123",
  "timestamp": "2026-07-02T12:00:00Z",
  "traceId": "abc-123-def"
}
```

### Standard Error Types

| Status | `type` suffix | `title` | When |
|--------|-------------|---------|------|
| 400 | `validation-error` | Validation Error | Invalid request body |
| 401 | `unauthorized` | Unauthorized | Missing or invalid auth token |
| 403 | `forbidden` | Forbidden | Authenticated but not authorized |
| 404 | `not-found` | Not Found | Resource does not exist |
| 409 | `conflict` | Conflict | Resource state conflict |
| 422 | `unprocessable-entity` | Unprocessable Entity | Business rule violation |
| 429 | `too-many-requests` | Too Many Requests | Rate limit exceeded |
| 500 | `internal-error` | Internal Error | Unexpected server error |

## Pagination

### Offset Pagination
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Cursor Pagination (Preferred for large datasets)
```json
{
  "data": [...],
  "meta": {
    "cursor": "eyJpZCI6Im9yZF8yMCJ9",
    "hasMore": true
  }
}
```

## Authentication

- Bearer token authentication via `Authorization: Bearer <token>` header.
- Tokens are JWT with a 15-minute access token lifetime.
- Refresh tokens are HTTP-only cookies with 7-day lifetime.
- All API endpoints require authentication unless explicitly marked as public.

```yaml
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Rate Limiting

- Rate limit headers returned on every response:
  ```
  RateLimit-Limit: 100
  RateLimit-Remaining: 45
  RateLimit-Reset: 1625126400
  ```
- Default: 100 requests per minute per tenant.
- Exceeded limits return HTTP 429 with RFC 7807 error.

## Cross-Origin Resource Sharing (CORS)

- CORS is configured per environment:
  - Development: `*` (all origins allowed).
  - Staging: specific allowed origins list.
  - Production: specific allowed origins list (no wildcard).
- Preflight requests are cached for 1 hour.
