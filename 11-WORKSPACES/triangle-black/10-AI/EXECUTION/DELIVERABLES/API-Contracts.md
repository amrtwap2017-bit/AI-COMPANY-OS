# API Contracts Deliverable Contract

## Purpose

Ensure that all API changes are fully specified, backward-compatible where possible, and documented in a machine-readable format that enables automated validation.

## Requirements

### 1. OpenAPI Specification Updated

- Every API change must be reflected in the OpenAPI specification (or equivalent, such as GraphQL SDL).
- The spec must be the single source of truth for API behavior.
- The spec file must be version-controlled alongside the implementation.
- Internal and external APIs may have separate specs but must be consistent.

### 2. Request / Response Schemas Defined

- Every endpoint must have a defined request schema (body, query, path parameters).
- Every endpoint must have a defined response schema for each status code.
- Schemas must use explicit types (no `any` or `object` without further definition).
- Nullable fields must be explicitly marked.
- Required vs. optional fields must be clearly distinguished.
- Maximum and minimum values must be specified for numeric fields.
- Enum values must be exhaustive and documented.

### 3. Error Responses Documented

- Every endpoint must document possible error response codes.
- Error response body must have a consistent structure:
  - `error.code`: Machine-readable error code
  - `error.message`: Human-readable error message
  - `error.details`: Additional context (optional)
  - `error.traceId`: Correlation ID for debugging
- HTTP status codes must follow REST/HTTP semantics:
  - 200: Success
  - 201: Created
  - 400: Bad Request (validation)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 409: Conflict
  - 422: Unprocessable Entity
  - 429: Too Many Requests
  - 500: Internal Server Error

### 4. Authentication Requirements Specified

- Every endpoint must specify its authentication method:
  - None (public)
  - API Key
  - Bearer Token (JWT)
  - OAuth 2.0 flow
  - Mutual TLS
- Authorization scopes or roles must be documented per endpoint.
- Authentication failure responses must be documented.

### 5. Rate Limits Defined

- Rate limits must be documented per endpoint or endpoint group.
- Rate limit information must include:
  - Maximum requests per time window
  - Time window duration
  - Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Rate limit exceeded response (429) must be documented.

### 6. Backward Compatibility Assessed

- Every API change must include a backward compatibility assessment:
  - Breaking: existing clients will fail without changes
  - Non-breaking: existing clients continue to work unchanged
- Breaking changes require:
  - Major version increment
  - Migration guide in release notes
  - Deprecation notice in the current spec
  - Minimum one release cycle deprecation period

### 7. Deprecation Policy

- Deprecated endpoints must be clearly marked in the spec with:
  - `deprecated: true`
  - `x-deprecation-message`: Explanation
  - `x-sunset-date`: Date when the endpoint will be removed
- Deprecated fields must remain functional until the sunset date.

## Verification

| Check | Tool/Method | Pass/Fail |
|---|---|---|
| Spec validity | OpenAPI linter | Pass |
| Schema completeness | Spec review | Pass |
| Error documentation | Spec review | Pass |
| Auth documentation | Spec review | Pass |
| Rate limit docs | Spec review | Pass |
| Compatibility assessment | Architecture review | Pass |
| Deprecation policy | Spec review | Pass |

## Non-Compliance

API changes without corresponding spec updates are blocked. Breaking changes without proper deprecation process require executive approval to proceed.
