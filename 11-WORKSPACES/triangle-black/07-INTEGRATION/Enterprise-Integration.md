# Enterprise Integration Architecture

> Triangle Black — Hospitality Engineering Platform
> Phase 7: Connecting the internal Digital Twin to the external world.

## Status: Complete

## Purpose

The internal platform (Phases 0-6) implements Triangle Black's complete business operating system — CRM, project delivery, procurement, inventory, financial control, maintenance, document management, executive intelligence, AI copilots, and mobile.

Phase 7 defines every **external boundary** through which the platform interacts with third-party systems. No internal business logic is modified. All integration passes through documented, secured, monitored contracts.

## Architecture Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Internal Domain First** | Business logic never depends on external systems. External systems adapt to the platform. |
| 2 | **Loose Coupling** | Every integration is replaceable. No vendor lock-in. No hard dependencies in core domains. |
| 3 | **API First** | Every integration boundary is a documented API contract before any code is written. |
| 4 | **Event Driven Where Appropriate** | Asynchronous event propagation for non-critical paths. Synchronous for real-time operations. |
| 5 | **Failure Isolation** | External system failure never cascades to internal domains. Circuit breakers, timeouts, fallbacks. |
| 6 | **Retry Safety** | All external calls implement exponential backoff, idempotency keys, and dead letter queues. |
| 7 | **Security By Default** | Every external interaction authenticated, authorized, encrypted, and audited. |
| 8 | **Vendor Independence** | Anti-corruption layers shield the platform from vendor-specific schemas and protocols. |
| 9 | **Observability** | Every integration logged, traced, monitored. Failure dashboards alert within 5 minutes. |
| 10 | **Startup Budget Respect** | V1 integrations use existing infrastructure ($6-40/mo VPS). No paid middleware until revenue justifies. |

## Integration Architecture Overview

```
                          ┌─────────────────────────────────────────────┐
                          │           TRIANGLE BLACK PLATFORM           │
                          │         (Internal Digital Twin)             │
                          │   Phases 0-6: Business Capabilities         │
                          └─────────────────┬───────────────────────────┘
                                            │
                          ┌─────────────────▼───────────────────────────┐
                          │         INTEGRATION GATEWAY LAYER           │
                          │         (Phase 7: Boundaries Only)          │
                          │                                             │
                          │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
                          │  │  REST    │ │  Events  │ │  Sync    │    │
                          │  │  Gateway │ │  Bridge  │ │  Engine  │    │
                          │  └──────────┘ └──────────┘ └──────────┘    │
                          └─────────────────┬───────────────────────────┘
                                            │
          ┌─────────────────────────────────┼──────────────────────────┐
          │             │                   │                         │
    ┌─────▼──────┐ ┌───▼────┐ ┌─────▼────┐ ┌──▼───────┐ ┌─────────▼─┐
    │ Hospitality │ │Finance │ │Government│ │Comm/     │ │Future     │
    │ PMS, POS   │ │ERP,    │ │E-Invoice │ │Collab    │ │AI, IoT    │
    │ Property   │ │Banking │ │Tax       │ │Email,SMS │ │Sensors    │
    │ Ecosystem  │ │Payments│ │ETA       │ │WhatsApp  │ │BMS        │
    └────────────┘ └────────┘ └──────────┘ └──────────┘ └───────────┘
```

## Integration Layer Components

| Component | Purpose | V1 Status |
|-----------|---------|-----------|
| REST API Gateway | Unified entry point for all API traffic | Built (Phase 5 NestJS) |
| Event Bus Bridge | Domain events → external webhooks | Extend (Phase 5 event module) |
| Sync Engine | Scheduled batch synchronization | New |
| Integration Contract Registry | Documented contracts per external system | New |
| Anti-Corruption Layer (ACL) | Translate external schemas to internal | New |
| Secrets Vault | Encrypted API keys, certificates | Extend (Phase 5 env) |
| Integration Monitor | Health, latency, error tracking | New |
| Dead Letter Queue | Failed message storage and retry | New |
| Partner Portal | External access for suppliers, contractors | New |

## Boundary Rules

| Rule | Enforcement |
|------|-------------|
| Domains never call external systems directly | Integration Gateway only |
| Every external call has a timeout | Configurable per contract |
| Every external call has a circuit breaker | Auto-open on failure threshold |
| Every external call logs request/response | Integration audit log |
| No external credentials in domain code | Secrets Vault only |
| External schema never pollutes domain model | ACL transforms at boundary |
| All webhooks verified by HMAC signature | Security middleware |
| Rate limits enforced per external system | Gateway rate limiter |
| All retries use exponential backoff + jitter | Retry service |
| Failed events go to DLQ, never lost | Dead letter persistence |

## V1 Integration Scope (Startup Budget)

| System | Priority | Integration Method | Budget Impact |
|--------|----------|-------------------|---------------|
| SMTP Email | Critical | Direct (Postfix/SendGrid free tier) | $0 |
| Egypt E-Invoice (ETA) | High | REST API (direct) | $0 |
| WhatsApp Business API | Medium | REST API (Meta) | $0-20/mo |
| SMS (local gateway) | Medium | REST API | $0-10/mo |
| Google Calendar | Medium | OAuth + REST API | $0 |
| Bank CSV Import | Low | File upload + parser | $0 |
| Cloud Storage (S3) | Low | SDK direct | $0-5/mo |
| Google/Microsoft SSO | Low | OIDC | $0 |

## V2 Integration Scope (Revenue-Funded)

| System | Priority | Estimated Cost |
|--------|----------|----------------|
| Opera PMS | High | $500-2000/mo license + integration |
| Oracle Hospitality / Micros | High | $1000-5000/mo |
| Egypt Banking API | Medium | TBD (bank-specific) |
| SAP / Oracle ERP | Medium | $2000-10000/mo |
| Payment Gateway (Fawry, Paymob) | High | 1-3% per transaction |
| Shiji / Mews / Cloudbeds | Medium | API access fees |
| DocuSign / eSignature | Medium | $10-50/mo |
| Power BI / Tableau | Low | $10-50/mo |

## File Index

| File | Content |
|------|---------|
| Enterprise-Integration.md | This file — master overview and principles |
| External-Systems.md | Complete external systems landscape (Section 01) |
| Context-Map.md | DDD context map with ACLs, partnerships (Section 02) |
| API-Gateway.md | API gateway strategy for all interfaces (Section 03) |
| Integration-Contracts.md | Contracts for every external system (Section 04) |
| Event-Integration.md | Integration events with producers/consumers (Section 05) |
| Synchronization.md | Push/pull/scheduled/offline strategy (Section 06) |
| Hospitality-Integrations.md | Hotel PMS, POS, property ecosystem (Section 07) |
| Financial-Integrations.md | E-Invoice, banking, ERP, accounting (Section 08) |
| Identity-Federation.md | SSO, OAuth, OIDC, enterprise identity (Section 11) |
| Monitoring.md | Integration health, logging, tracing (Section 13) |
| Integration-Governance.md | Security, partner portal, developer platform, future |

## Traceability

| Phase 7 Requirement | Source |
|--------------------|--------|
| External systems landscape | Phase 6 domain specs (11-INTEGRATIONS) |
| Integration contracts | Phase 4 API Standards, Phase 5 code |
| Event integration | Phase 5 Event Bus, Phase 6 domain events |
| Security | Phase 4 Security standards |
| Hospitality integrations | Business domain (Egypt hospitality market) |
| Financial integrations | Phase 6 06-FINANCIAL-CONTROL |
| Identity federation | Phase 5 Auth module (JWT, RBAC) |
| Monitoring | Phase 4 Observability standards |
