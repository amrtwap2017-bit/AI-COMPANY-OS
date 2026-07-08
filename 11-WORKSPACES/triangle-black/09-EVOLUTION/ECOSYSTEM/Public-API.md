# 07 — Public API

> Public API strategy for the platform ecosystem.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 3 — API-Specifications.md | Internal API design |
| Phase 10 — Ecosystem-Roadmap.md | Ecosystem evolution |

## API Principles

1. **RESTful** — Standard HTTP methods, resource-oriented
2. **OpenAPI 3.1** — Complete, executable specification
3. **Versioned** — URL-based versioning (v1, v2)
4. **Backward compatible** — No breaking changes in minor versions
5. **Rate limited** — Fair usage per API key
6. **Authenticated** — API key + OAuth 2.0
7. **Paginated** — All list endpoints support pagination

## API Endpoints (v1)

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| Hotels | GET/POST/PUT/DELETE /hotels | Hotel management |
| Rooms | GET/POST/PUT/DELETE /rooms | Room management |
| Bookings | GET/POST/PUT /bookings | Booking CRUD |
| Guests | GET/POST/PUT /guests | Guest profiles |
| Invoices | GET /invoices | Invoice retrieval |
| Rates | GET/PUT /rates | Rate management |
| Availability | GET /availability | Room availability |
| Webhooks | POST /webhooks | Event subscriptions |

## API Authentication

| Method | Use Case | Security Level |
|--------|----------|---------------|
| API Key | Server-to-server | Medium |
| OAuth 2.0 | User-authorized apps | High |
| JWT | Internal service-to-service | High |

## API Rate Limits

| Tier | Requests/min | Requests/day | Burst |
|------|-------------|--------------|-------|
| Community | 60 | 10,000 | 100 |
| Certified | 300 | 50,000 | 500 |
| Premium | 1,000 | 200,000 | 2,000 |
| Enterprise | Custom | Custom | Custom |

## API Performance

| Metric | Target |
|--------|--------|
| Response time (p95) | < 200ms |
| Availability | 99.9% |
| Error rate | < 0.5% |
| Documentation freshness | ≤ 24h from release |
| Deprecation notice | 6 months before removal |
