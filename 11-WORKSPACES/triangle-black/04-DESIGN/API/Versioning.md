# Versioning -- URL Versioning & Backward Compatibility

Triangle Black uses **URL path versioning** (`/v1/`, `/v2/`) for API versioning.

## Versioning Scheme

```
https://api.triangleblack.com/v1/bookings
https://api.triangleblack.com/v2/bookings
```

### Why URL Versioning?

- **Explicit** -- clients know exactly which version they are calling
- **Cacheable** -- different versions have different URLs, no cache collision
- **Simple** -- no Accept header negotiation needed
- **Testable** -- easy to test old vs new versions side by side

## Backend Implementation

```typescript
// main.ts
app.setGlobalPrefix("api/v1");
```

## Version Lifecycle

| Phase          | Status           | Duration         | Action                                |
| -------------- | ---------------- | ---------------- | ------------------------------------- |
| Active         | Fully supported  | Current version  | New features, bug fixes, security     |
| Deprecated     | Maintenance      | 6 months         | Critical bug fixes & security only    |
| Sunset         | Read-only        | 3 months         | No changes; returns Sunset header     |
| Retired        | Removed          | --               | Returns 410 Gone                      |

## Deprecation Headers

Deprecated versions include response headers:

```http
GET /v1/bookings HTTP/1.1
---
Sunset: Sat, 31 Dec 2027 23:59:59 GMT
Deprecation: true
Link: </v2/bookings>; rel="successor-version"
```

## Backward Compatibility Rules

Within a major version (e.g., v1):

1. **Additive changes only** -- new fields, new endpoints, new optional parameters
2. **No breaking changes** -- removing fields, changing field types, renaming endpoints
3. **New optional parameters** must have sensible defaults
4. **New fields** in responses are added -- existing clients ignore unknown fields
5. **Error codes** are never removed from a version

## What Constitutes a Breaking Change

| Change                          | Breaking? | Version Bump |
| ------------------------------- | --------- | ------------ |
| Adding a new endpoint           | No        | Minor        |
| Adding an optional field        | No        | Minor        |
| Adding a new enum value         | No        | Minor        |
| Removing an endpoint            | Yes       | Major        |
| Removing a required field       | Yes       | Major        |
| Renaming a field                | Yes       | Major        |
| Changing field type             | Yes       | Major        |
| Making optional field required  | Yes       | Major        |
| Changing error codes            | Yes       | Major        |

## Version Negotiation (Future)

For clients that cannot update URLs, content negotiation via `Accept` header may be supported:

```http
Accept: application/vnd.triangleblack.v2+json
```

But URL versioning remains the primary mechanism.

## Current Versions

| Version | Status       | Release Date | Sunset Date      |
| ------- | ------------ | ------------ | ---------------- |
| v1      | Active       | Q3 2026      | --               |
| v2      | Planned      | Q1 2027      | --               |