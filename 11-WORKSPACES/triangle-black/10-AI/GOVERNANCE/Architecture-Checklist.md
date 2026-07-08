# Architecture Review Checklist

This checklist is used during architecture reviews to ensure designs meet program standards for clean architecture, modularity, scalability, security, and traceability.

## Clean Architecture & Layering

- [ ] Solution follows clean architecture / hexagonal architecture principles
- [ ] Dependency rule is enforced: outer layers depend on inner layers, never inward
- [ ] Domain layer contains no external framework or infrastructure references
- [ ] Application layer depends only on domain abstractions, not concrete implementations
- [ ] Infrastructure layer implements interfaces defined by inner layers
- [ ] Presentation layer is isolated from business logic
- [ ] No circular dependencies exist between modules or layers

## Module Boundaries & Coupling

- [ ] Modules are organized by bounded context or domain capability
- [ ] Module boundaries align with team ownership boundaries (Conway's Law)
- [ ] Inter-module communication uses well-defined interfaces or events
- [ ] Shared kernel or common libraries are minimized and explicitly justified
- [ ] Modules can be developed and tested independently where practical
- [ ] No inappropriate cross-module references exist
- [ ] Module packaging reflects domain structure, not technical layers

## Dependency Direction & Management

- [ ] Dependencies flow from policies toward details (stable abstraction principle)
- [ ] Abstract classes and interfaces are owned by the consuming module
- [ ] Dependency injection is used to invert dependencies where needed
- [ ] External library dependencies are justified and reviewed for necessity
- [ ] Dependency versions are managed centrally (e.g., BOM, version catalog)
- [ ] Transitive dependencies are reviewed for conflicts and vulnerabilities
- [ ] Deprecated or unmaintained libraries are replaced or scheduled for removal

## API Design

- [ ] APIs follow consistent naming conventions and design standards
- [ ] RESTful APIs use appropriate HTTP methods, status codes, and resource URIs
- [ ] GraphQL schemas follow established naming and structure conventions
- [ ] API versioning strategy is defined and applied consistently
- [ ] Request/response payloads are documented with schemas
- [ ] Pagination, filtering, and sorting are standardized where needed
- [ ] Error responses follow a consistent format with meaningful error codes
- [ ] Rate limiting and throttling requirements are addressed
- [ ] Backward compatibility is maintained or a migration plan exists

## Database Design

- [ ] Database schema is normalized to the appropriate level (3NF, or justified denormalization)
- [ ] Indexes are designed for query patterns, not arbitrarily applied
- [ ] Migrations are reversible and tested
- [ ] Read replicas or sharding strategy is defined for high-volume data
- [ ] No business logic is embedded in database triggers or stored procedures
- [ ] Connection pooling is configured appropriately
- [ ] Data archival and retention policies are defined

## Scalability & Performance

- [ ] Stateless design is preferred; state is externalized where needed
- [ ] Horizontal scaling capability is assessed and documented
- [ ] Caching strategy is defined (in-memory, distributed, CDN)
- [ ] Asynchronous processing is used for long-running or non-critical operations
- [ ] Message queues or event streams are used for decoupling where appropriate
- [ ] Bottlenecks and hot spots are identified and addressed
- [ ] Load testing plan exists with target throughput and latency metrics

## Security Architecture

- [ ] Authentication mechanism is defined (OAuth2, OIDC, JWT, etc.)
- [ ] Authorization model is defined (RBAC, ABAC, or custom)
- [ ] Principle of least privilege is applied to all service accounts and roles
- [ ] Data is encrypted at rest and in transit (TLS 1.2+)
- [ ] Secrets management solution is identified (vault, key store, etc.)
- [ ] Network segmentation and firewall rules are defined
- [ ] API gateway or service mesh security policies are defined

## Observability & Traceability

- [ ] Distributed tracing is implemented (trace IDs propagated across services)
- [ ] Structured logging is used with consistent log levels and formats
- [ ] Health check endpoints are implemented for all services
- [ ] Metrics collection is defined (business metrics, infrastructure metrics)
- [ ] Alerting thresholds and escalation paths are documented
- [ ] Audit trail is maintained for all data mutations and security events
- [ ] Dashboard(s) exist for monitoring system health

## Resilience & Fault Tolerance

- [ ] Retry and circuit-breaker patterns are applied for external service calls
- [ ] Graceful degradation is implemented for non-critical features
- [ ] Bulkheading is used to isolate failures between components
- [ ] Timeout values are configured and tuned for all external calls
- [ ] Disaster recovery plan exists with RTO and RPO targets
- [ ] Backup and restore procedures are documented and tested

## Architecture Review Sign-Off

- [ ] Architecture has been peer-reviewed by at least one other architect
- [ ] Key decisions are recorded in Architecture Decision Records (ADRs)
- [ ] All review comments are resolved or acknowledged with follow-up items
- [ ] Risk register is updated with any identified architectural risks
