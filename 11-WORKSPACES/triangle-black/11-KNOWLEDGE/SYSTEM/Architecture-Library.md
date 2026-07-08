# Architecture Library

## Overview

The Architecture Library catalogs key architecture resources, reference architectures, and design patterns that inform the EADF. It serves as a curated index of external and internal knowledge that agents and humans can draw upon during design and implementation.

Entries are categorized by domain and concern for rapid retrieval.

---

## Categorization

Resources are organized by:

- **Domain**: The architectural domain (infrastructure, application, data, security, etc.)
- **Concern**: The specific concern addressed (scalability, maintainability, security, cost, etc.)
- **Maturity**: How established the pattern is (standard, emerging, experimental)

---

## Application Architecture

### Microservices

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Microservices Pattern Language | Reference | Decomposition, communication, data management patterns | Internal: `docs/ref/ms-patterns.md` |
| Service Mesh Architecture | Guide | Service-to-service communication, observability, security | Internal: `docs/ref/service-mesh.md` |
| Domain-Driven Design Reference | Book | Strategic and tactical DDD patterns | External: Evans, "Domain-Driven Design" |
| Bounded Context Map | Template | Context mapping for service boundaries | Internal: `templates/context-map.md` |

### Event-Driven Architecture

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Event Sourcing Pattern | Guide | Event storage, replay, projection patterns | Internal: `docs/ref/event-sourcing.md` |
| CQRS Reference | Guide | Command/Query separation patterns | Internal: `docs/ref/cqrs.md` |
| Message Broker Patterns | Reference | Pub/sub, competing consumers, dead letter handling | Internal: `docs/ref/messaging.md` |
| Event Catalog Template | Template | Event schema registry approach | Internal: `templates/event-catalog.md` |

### Hexagonal / Ports & Adapters

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Hexagonal Architecture Guide | Guide | Core domain isolation from infrastructure concerns | Internal: `docs/ref/hexagonal.md` |
| Dependency Inversion Examples | Examples | Interface-driven dependency management | Internal: `examples/dependency-inversion/` |

---

## Data Architecture

### Database Design

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Normalization Reference | Guide | 1NF–5NF with examples | Internal: `docs/ref/normalization.md` |
| Indexing Strategy Guide | Guide | Index types, selection criteria, maintenance | Internal: `docs/ref/indexing.md` |
| Migration Pattern Catalog | Reference | Online, offline, versioned migration patterns | Internal: `docs/ref/migrations.md` |
| Data Modeling Template | Template | Entity-relationship modeling approach | Internal: `templates/data-model.md` |

### Data Storage Patterns

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Polyglot Persistence Guide | Guide | Choosing storage technologies per access pattern | Internal: `docs/ref/polyglot.md` |
| Caching Strategy Reference | Reference | Cache-aside, write-through, write-behind, read-through | Internal: `docs/ref/caching.md` |
| Materialized View Pattern | Guide | Pre-computed views for query performance | Internal: `docs/ref/materialized-views.md` |

---

## API Architecture

### API Design

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| RESTful API Design Guide | Guide | Resource naming, status codes, HATEOAS, pagination | Internal: `docs/ref/rest-api.md` |
| GraphQL Schema Design | Guide | Schema-first design, resolvers, N+1 prevention | Internal: `docs/ref/graphql.md` |
| gRPC Service Design | Guide | Proto definition, streaming, error handling | Internal: `docs/ref/grpc.md` |
| API Versioning Strategy | Guide | URL, header, and contract-based versioning | Internal: `docs/ref/api-versioning.md` |
| OpenAPI Specification Reference | Standard | OpenAPI 3.0/3.1 specification | External: `https://spec.openapis.org/oas/v3.1.0` |

### API Security

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| OAuth 2.0 / OIDC Guide | Guide | Authorization code flow, PKCE, token handling | Internal: `docs/ref/oauth.md` |
| API Gateway Patterns | Reference | Rate limiting, authentication, routing | Internal: `docs/ref/gateway.md` |
| API Security Checklist | Checklist | OWASP API security checks | Internal: `templates/api-security-checklist.md` |

---

## Infrastructure Architecture

### Cloud Architecture

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Well-Architected Framework | Guide | AWS/Azure/GCP five-pillar reference | Internal: `docs/ref/well-architected.md` |
| Landing Zone Reference | Template | Multi-account/region baseline architecture | Internal: `templates/landing-zone.md` |
| Cost Optimization Guide | Guide | Right-sizing, reserved instances, spot usage | Internal: `docs/ref/cost-optimization.md` |

### Containerization

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Dockerfile Best Practices | Guide | Multi-stage builds, layer caching, security | Internal: `docs/ref/docker.md` |
| Kubernetes Architecture Reference | Guide | Pod, service, ingress, configmap patterns | Internal: `docs/ref/kubernetes.md` |
| Service Mesh Comparison | Reference | Istio, Linkerd, Consul comparison | Internal: `docs/ref/service-mesh-comparison.md` |

---

## Security Architecture

### Application Security

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| OWASP Top 10 Reference | Guide | Web application security risks | External: `https://owasp.org/www-project-top-ten/` |
| Secure SDLC Guide | Guide | Security integrated into each SDLC phase | Internal: `docs/ref/secure-sdlc.md` |
| Threat Modeling Template | Template | STRIDE-based threat modeling | Internal: `templates/threat-model.md` |
| Secrets Management Guide | Guide | Vault, environment variables, encryption | Internal: `docs/ref/secrets.md` |

### Compliance & Governance

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| SOC 2 Control Reference | Guide | Security, availability, confidentiality criteria | Internal: `docs/ref/soc2.md` |
| GDPR Data Protection Guide | Guide | Data classification, retention, PII handling | Internal: `docs/ref/gdpr.md` |
| Audit Logging Pattern | Guide | Immutable logs, chain of custody | Internal: `docs/ref/audit-logging.md` |

---

## Observability

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Distributed Tracing Guide | Guide | OpenTelemetry, trace context propagation | Internal: `docs/ref/tracing.md` |
| Logging Strategy Reference | Guide | Structured logging, log levels, aggregation | Internal: `docs/ref/logging.md` |
| Metrics & Alerting Guide | Guide | RED metrics, SLOs, alert fatigue prevention | Internal: `docs/ref/metrics.md` |
| Dashboard Design Template | Template | Four golden signals approach | Internal: `templates/dashboard.md` |

---

## Testing Architecture

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Test Pyramid Reference | Guide | Unit, integration, E2E test distribution | Internal: `docs/ref/test-pyramid.md` |
| Contract Testing Guide | Guide | Pact-based consumer-driven contracts | Internal: `docs/ref/contract-testing.md` |
| Performance Testing Guide | Guide | Load, stress, endurance testing patterns | Internal: `docs/ref/performance-testing.md` |
| Chaos Engineering Reference | Guide | Fault injection, resilience testing | Internal: `docs/ref/chaos.md` |

---

## AI-Specific Architecture

| Resource | Type | Description | Link |
|----------|------|-------------|------|
| Context Management Architecture | Guide | Context assembly, injection, retrieval patterns | Internal: `docs/ref/context-management.md` |
| Agent Orchestration Pattern | Guide | Dispatcher, router, orchestrator agent design | Internal: `docs/ref/agent-orchestration.md` |
| Prompt Management Architecture | Guide | Prompt versioning, testing, optimization | Internal: `docs/ref/prompt-architecture.md` |
| Human-in-the-Loop Design | Guide | Escalation gates, review checkpoints, approval flows | Internal: `docs/ref/feedback-loop.md` |
| Agent Observability Guide | Guide | Token usage, latency, output quality monitoring | Internal: `docs/ref/agent-observability.md` |

---

## Adding New Resources

To add a resource to the Architecture Library:

1. Create the resource document in `docs/ref/` or `docs/examples/`
2. Add a link entry in the appropriate category in this file
3. Include: Title, Type, Description, Link path
4. Assign a maturity level (Standard / Emerging / Experimental)
5. Submit for review by TAL
6. Announced to team via communication channel
