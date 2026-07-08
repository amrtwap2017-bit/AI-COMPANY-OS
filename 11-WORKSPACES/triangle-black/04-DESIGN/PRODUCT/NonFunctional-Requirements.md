---
ID: 07-Product-10
Title: Non-Functional Requirements
Purpose: Define performance, security, scalability, usability, and availability requirements
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Non-Functional Requirements — V1

## Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | Page load time (server-rendered) | < 3 seconds |
| NFR-PERF-02 | API response time (p95) | < 500ms |
| NFR-PERF-03 | API response time (p99) | < 1000ms |
| NFR-PERF-04 | Concurrent users supported | 50 simultaneous |
| NFR-PERF-05 | Database query time (p95) | < 200ms |
| NFR-PERF-06 | File upload size limit | 25MB per file |
| NFR-PERF-07 | PDF generation time | < 5 seconds |
| NFR-PERF-08 | Search response time | < 2 seconds |

## Security

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-SEC-01 | Transport encryption | TLS 1.2+ enforced across all connections |
| NFR-SEC-02 | Password hashing | bcrypt with cost factor 12+ |
| NFR-SEC-03 | Session management | JWT with 24h expiry, refresh token rotation |
| NFR-SEC-04 | Rate limiting | 100 requests/minute per IP; 10 login attempts/minute |
| NFR-SEC-05 | Input validation | All inputs validated server-side; XSS prevention |
| NFR-SEC-06 | SQL injection prevention | Parameterized queries or ORM throughout |
| NFR-SEC-07 | CSRF protection | Double-submit cookie pattern or SameSite=Strict |
| NFR-SEC-08 | File upload security | MIME type validation; virus scanning (V2); restricted extensions |
| NFR-SEC-09 | Audit trail | All data mutations logged with user, timestamp, old/new values |
| NFR-SEC-10 | Data isolation | Multi-tenant: schema-per-tenant ensures data cannot leak between clients |

## Scalability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-SCAL-01 | Tenant capacity | Support 50+ tenants on single instance |
| NFR-SCAL-02 | Data volume | Support 500+ opportunities, 200+ projects, 1000+ documents per tenant |
| NFR-SCAL-03 | User count | Support 20+ users per tenant (10 hotels × 20 users = 200 total V1) |
| NFR-SCAL-04 | Storage growth | Support 50GB+ total storage with horizontal scaling path |
| NFR-SCAL-05 | Database scaling | Schema-per-tenant with shared connection pool; read replicas ready for V2 |

## Availability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-AVAIL-01 | Uptime target | 99.5% (excluding planned maintenance) |
| NFR-AVAIL-02 | Planned maintenance window | Sunday 02:00-04:00 EET (notify 48h in advance) |
| NFR-AVAIL-03 | Backup frequency | Daily database backup; hourly incremental (V2) |
| NFR-AVAIL-04 | Disaster recovery | RTO < 4 hours; RPO < 24 hours |
| NFR-AVAIL-05 | Deployment | Zero-downtime deploys (blue-green, V2); maintenance window deploys (V1) |

## Usability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-UX-01 | Supported browsers | Chrome, Firefox, Safari, Edge (latest 2 major versions) |
| NFR-UX-02 | Mobile support | Responsive design; all portal pages functional on 360px+ screens |
| NFR-UX-03 | Error messages | Human-readable, specific, actionable; not technical error codes |
| NFR-UX-04 | Empty states | All list views show helpful empty state with call-to-action |
| NFR-UX-05 | Loading states | All async operations show loading indicator or skeleton screen |
| NFR-UX-06 | Confirmation | All destructive actions require confirmation dialog |
| NFR-UX-07 | Undo support | Soft delete with 30-day recovery window |
| NFR-UX-08 | Accessibility | WCAG 2.1 Level AA compliance (see 08-UX/Accessibility.md) |
| NFR-UX-09 | Onboarding | First-time users see tooltips or guided tour on first login |

## Reliability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-REL-01 | Error logging | All unhandled exceptions logged with stack trace, user context, request data |
| NFR-REL-02 | Monitoring | Health check endpoint; uptime monitoring; alert on 5xx rate > 1% |
| NFR-REL-03 | Graceful degradation | Non-critical features fail independently; core CRM/Quotations/Projects remain available |
| NFR-REL-04 | Data integrity | All transactional operations use database transactions; no partial writes |

## Maintainability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-MAINT-01 | Code documentation | All modules documented with README; public API documented with JSDoc |
| NFR-MAINT-02 | Logging | Structured logging (JSON) with correlation IDs across requests |
| NFR-MAINT-03 | Configuration | Environment-based configuration via .env; no hardcoded values |
| NFR-MAINT-04 | Test coverage | Unit test coverage > 80%; integration tests for all API endpoints |

## Browser and Device Support

| Category | Supported | Notes |
|----------|-----------|-------|
| Desktop browsers | Chrome 110+, Firefox 110+, Safari 16+, Edge 110+ | Latest 2 major versions |
| Mobile browsers | Chrome Android, Safari iOS | Responsive web, PWA in V2 |
| Screen sizes | 360px to 2560px width | Breakpoints: 640, 768, 1024, 1280, 1536 |
| Internet connection | As low as 1 Mbps | Graceful degradation; offline-capable (V2) |
