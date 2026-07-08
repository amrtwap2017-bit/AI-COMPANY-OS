# RESTful Design Principles

## Resource Naming

| Convention            | Example                          |
| --------------------- | -------------------------------- |
| Plural nouns          | `/v1/bookings`, `/v1/properties` |
| CamelCase properties  | `guestName`, `checkIn`           |
| Nested resources      | `/v1/properties/:id/bookings`    |
| Actions as resources  | `/v1/guests/:id/check-in`        |

## HTTP Methods

| Method   | Purpose        | Idempotent | Safe | Body Required |
| -------- | -------------- | ---------- | ---- | ------------- |
| `GET`    | Retrieve       | Yes        | Yes  | No            |
| `POST`   | Create / action| No         | No   | Yes           |
| `PATCH`  | Partial update | Yes        | No   | Yes           |
| `DELETE` | Remove         | Yes        | No   | No            |

**Why PATCH over PUT?** PATCH allows partial updates. The client sends only the fields to change. This is more efficient and less error-prone than sending the full resource.

## Status Codes

| Code  | Meaning                     | When to Use                                  |
| ----- | --------------------------- | -------------------------------------------- |
| 200   | OK                          | Successful GET, PATCH, POST (with response)  |
| 201   | Created                     | POST that creates a resource                 |
| 204   | No Content                  | DELETE, POST that returns no body            |
| 400   | Bad Request                 | Validation error, malformed input            |
| 401   | Unauthorized                | Missing or invalid JWT                       |
| 403   | Forbidden                   | Authenticated but insufficient permissions   |
| 404   | Not Found                   | Resource does not exist                      |
| 409   | Conflict                    | Duplicate, state conflict (double booking)   |
| 422   | Unprocessable Entity        | Business rule violation                      |
| 429   | Too Many Requests           | Rate limit exceeded                          |
| 500   | Internal Server Error       | Unexpected server error                      |
| 503   | Service Unavailable         | Maintenance / degraded state                 |

## Idempotency

Mutations on critical resources (payments, bookings) support idempotency via the `Idempotency-Key` header:

```http
POST /v1/payments
Idempotency-Key: 7b8a9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d
Content-Type: application/json

{ "bookingId": "...", "amount": 500.00 }
```

If the same key is sent again within 24 hours, the server returns the original response without re-processing.

## Query Conventions

| Parameter      | Type     | Example                    | Description                |
| -------------- | -------- | -------------------------- | -------------------------- |
| `page`         | integer  | `?page=1`                  | Page number (starts at 1)  |
| `limit`        | integer  | `?limit=20`                | Items per page (max 100)   |
| `sort`         | string   | `?sort=createdAt`          | Sort field                 |
| `direction`    | string   | `?direction=desc`          | Sort direction             |
| `search`       | string   | `?search=John`             | Full-text search           |
| `status`       | string   | `?status=CONFIRMED`        | Filter by status           |
| `dateFrom`     | string   | `?dateFrom=2026-06-01`     | Date range start           |
| `dateTo`       | string   | `?dateTo=2026-06-30`       | Date range end             |
| `include`      | string   | `?include=guest,property`  | Comma-separated relations  |

## Response Envelope

All responses are wrapped in a consistent envelope:

```json
{
  "data": { ... },
  "meta": {
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-06-30T14:30:00Z"
  }
}
```

For paginated responses:

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "requestId": "a1b2c3d4-...",
    "timestamp": "2026-06-30T14:30:00Z"
  }
}
```
