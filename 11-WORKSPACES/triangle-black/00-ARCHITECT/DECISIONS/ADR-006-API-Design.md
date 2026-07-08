# ADR-006: API Design

**Status:** Accepted

**Context:** Triangle Black needs a consistent API design that supports the frontend (Next.js BFF), external integrations (OTA channels, PMS systems), and future mobile apps. The API must be versioned, documented, and follow RESTful conventions. Both REST and GraphQL were considered.

**Decision:**

We will use **RESTful API design with URL versioning**.

Key conventions:
```
Base URL: /api/v1/{resource}

Examples:
GET    /api/v1/properties            (list)
POST   /api/v1/properties            (create)
GET    /api/v1/properties/:id        (get by ID)
PATCH  /api/v1/properties/:id        (partial update)
DELETE /api/v1/properties/:id        (soft delete)

Nested:
GET    /api/v1/properties/:id/units
POST   /api/v1/properties/:id/units
GET    /api/v1/properties/:id/reservations?status=confirmed

Actions:
POST   /api/v1/reservations/:id/check-in
POST   /api/v1/reservations/:id/check-out
POST   /api/v1/reservations/:id/cancel

Pagination:
GET    /api/v1/reservations?cursor=xxx&limit=20

Tenant context:
Header: X-Tenant-Id: abc123
Or subdomain: abc123.triangleblack.app
```

**Consequences:**

*Positive:*
- REST is widely understood; low barrier for external integration
- URL versioning is explicit and easy to route (Nginx can route by URL prefix)
- BFF pattern means the public API can differ from the internal API if needed
- Cache-friendly (HTTP caching semantics)
- Tooling (OpenAPI/Swagger) generates documentation automatically
- Cursor-based pagination is efficient for large datasets

*Negative:*
- REST can lead to over-fetching or under-fetching (mitigated by sparse fieldsets)
- Multiple round-trips for complex data (mitigated by `include` / `expand` query params)
- Versioning adds URL complexity
- BFF adds a hop for every request; could become a bottleneck
- No real-time push (WebSocket via separate endpoint for live updates)

**Alternatives:**
- **GraphQL** — rejected: overkill for V1; adds query complexity, caching difficulty, and client tooling overhead; may revisit for mobile apps in V2
- **tRPC** — rejected: tight frontend-backend coupling; not suitable for external integrations
- **gRPC** — rejected: complex to set up, difficult for browser consumption without gRPC-web; deferred for internal service-to-service in microservices phase
- **Plain REST (no versioning)** — rejected: breaking changes would disrupt integrations
- **Header versioning** — rejected: less discoverable and harder to test than URL versioning

**Related ADRs:** ADR-003 (Frontend), ADR-004 (Backend), ADR-007 (Auth)
