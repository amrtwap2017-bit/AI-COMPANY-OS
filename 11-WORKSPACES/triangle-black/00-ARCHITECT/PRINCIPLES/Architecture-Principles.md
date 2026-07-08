# 01 — Architecture Principles

> Immutable rules that govern all design and implementation decisions.

## Layer 1: Business Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Revenue-first build order** | Commercial → Delivery → Procurement → Inventory → Financial. Build what generates revenue first. |
| 2 | **Design freeze after Phase 4** | Phases 0-4 (Foundation → Blueprint → Digital Twin → Engineering) are immutable after sign-off. Changes require an ADR. |
| 3 | **Every module must have a business owner** | No technical-only modules. Every piece of code maps to a revenue-generating or cost-reducing capability. |
| 4 | **Traceability from requirement to screen** | Every requirement (Phase 1) must trace to an API (Phase 3), a DB table (Phase 3), and a screen (Phase 3). |

## Layer 2: Architecture Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 5 | **Domain-driven bounded contexts** | Each business capability is an isolated bounded context. No circular dependencies between contexts. |
| 6 | **Schema-per-tenant isolation** | Each tenant gets a separate PostgreSQL schema. No shared tables between tenants. |
| 7 | **API-first design** | All business capabilities expose a REST API. Frontend consumes APIs — never queries databases directly. |
| 8 | **Event-driven where appropriate** | Cross-domain communication uses events. In-process synchronous calls for intra-domain operations. |
| 9 | **Startup budget respect** | V1 infrastructure: $6-40/mo single VPS. No paid SaaS, no managed services, no Redis/Kafka/Elasticsearch V1. |
| 10 | **No vendor lock-in** | All dependencies are open-source. Docker ensures portability. No proprietary PaaS dependencies. |

## Layer 3: Integration Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 11 | **Internal domain first** | Integration boundaries wrap internal logic — never modify internal domain code for external systems. |
| 12 | **Loose coupling** | External systems communicate through ACLs (Anti-Corruption Layers) only. No direct domain exposure. |
| 13 | **Idempotency** | All integration endpoints must be safe to retry. Side effects only on first successful execution. |
| 14 | **Failure isolation** | External system failures never cascade into internal domain failures. Circuit breaker pattern V2. V1: timeout + retry. |
| 15 | **Security by default** | Every integration endpoint requires authentication. No open endpoints, no default credentials, no secrets in code. |

## Layer 4: Engineering Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 16 | **Automated quality gates** | Every PR must pass lint, typecheck, test, and build before merge. No exceptions. |
| 17 | **Single source of truth** | Every piece of data lives in exactly one system of record. No duplicated master data. |
| 18 | **Observability by default** | Every endpoint logs request/response. Every event is audited. Every integration attempt is recorded. |
| 19 | **Defensive coding** | Validate all inputs. Never trust external data. Fail closed on configuration errors. |
| 20 | **Documentation as code** | All architecture decisions, API specs, and database schemas are written documents in the repo. Mirror the code. |

## Principle Application

- All new features must comply with all 20 principles
- Violations require an ADR explaining the exception
- Principles are reviewed quarterly for relevance
