# API Endpoint Specification

## Endpoint
`[METHOD] /api/v[version]/[resource]/[:id]/[action]`

## Summary
[One-line summary of what this endpoint does.]

## Method
`[GET / POST / PUT / PATCH / DELETE]`

## Request

### Headers
| Header | Required | Value / Format | Description |
|---|---|---|---|
| `Authorization` | Yes | `Bearer [token]` | Authentication token |
| `Content-Type` | Yes | `application/json` | Media type of request body |
| `X-Request-Id` | No | `[uuid]` | Idempotency / tracing key |
| `Accept-Language` | No | `[en-US]` | Localization preference |

### Path Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `[UUID/Integer]` | Yes | Unique identifier of the resource |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | `[Integer]` | No | `1` | Page number for pagination |
| `limit` | `[Integer]` | No | `20` | Items per page (max 100) |
| `sort` | `[String]` | No | `-created_at` | Sort field with direction prefix (+/-) |
| `filter` | `[String]` | No | — | Filter expression in RQL format |

### Request Body (for POST/PUT/PATCH)
```json
{
    "field_1": "[value_1]",
    "field_2": "[value_2]",
    "nested_object": {
        "sub_field_1": "[sub_value_1]"
    }
}
```

## Response

### Success Response (`[200 / 201 / 204]`)
```json
{
    "status": "success",
    "data": {
        "id": "[uuid]",
        "field_1": "[value_1]",
        "field_2": "[value_2]",
        "created_at": "[ISO-8601 timestamp]",
        "updated_at": "[ISO-8601 timestamp]"
    },
    "meta": {
        "request_id": "[uuid]",
        "timestamp": "[ISO-8601 timestamp]"
    }
}
```

### Paginated Response (`[200]`)
```json
{
    "status": "success",
    "data": [
        { "...resource_1..." },
        { "...resource_2..." }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total_items": 150,
        "total_pages": 8,
        "next_page": "/api/v1/resource?page=2",
        "prev_page": null
    },
    "meta": {
        "request_id": "[uuid]",
        "timestamp": "[ISO-8601 timestamp]"
    }
}
```

## Errors
| HTTP Status | Error Code | Description | When It Occurs |
|---|---|---|---|
| `400` | `BAD_REQUEST` | Malformed request body or parameters | Validation failure |
| `401` | `UNAUTHORIZED` | Missing or invalid authentication | No / expired token |
| `403` | `FORBIDDEN` | Authenticated but not authorized | Role / permission check fails |
| `404` | `NOT_FOUND` | Resource does not exist | Invalid ID in path |
| `409` | `CONFLICT` | Resource state conflict | Duplicate or version conflict |
| `422` | `UNPROCESSABLE_ENTITY` | Business rule violation | Domain logic rejection |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests | Throttling threshold hit |
| `500` | `INTERNAL_ERROR` | Unexpected server error | Unhandled exception |

### Error Response Payload
```json
{
    "status": "error",
    "error": {
        "code": "[ERROR_CODE]",
        "message": "[Human-readable message]",
        "details": [
            {
                "field": "[field_name]",
                "issue": "[Validation rule broken]"
            }
        ],
        "request_id": "[uuid]",
        "timestamp": "[ISO-8601 timestamp]"
    }
}
```

## Authentication
- **Scheme:** `[Bearer Token / OAuth 2.0 / API Key / mTLS]`
- **Scope Required:** `[scope_name]`
- **Rate Limit Tier:** `[Standard / Elevated / Admin]`

## Rate Limiting
| Window | Limit | Behavior |
|---|---|---|
| `[1 second]` | `[100]` | `[HTTP 429 with Retry-After header]` |
| `[1 minute]` | `[1000]` | `[HTTP 429 with Retry-After header]` |

## Idempotency
- **Idempotent?** `[Yes / No]`
- **Idempotency Key:** `[X-Idempotency-Key header / Not applicable]`
- **Dedup Window:** `[24 hours]`

## Examples

### cURL
```bash
curl -X [METHOD] "[base_url]/api/v[version]/[resource]" \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"field_1": "value_1"}'
```

### SDK (TypeScript)
```typescript
const response = await client.[resource].[action]({
    field_1: "value_1"
});
```

## Changelog
| Date | Version | Change | Author |
|---|---|---|---|
| `[YYYY-MM-DD]` | `[v1]` | Initial specification | `[Name]` |
| `[YYYY-MM-DD]` | `[v2]` | `[Description of change]` | `[Name]` |
