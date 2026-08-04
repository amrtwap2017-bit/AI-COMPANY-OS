# Enterprise Domain Architecture v4

## Current-state finding

The repository documents sensible bounded contexts, but runtime structure centralizes many concerns in `src/main.py` and `src/commercial`. Router-only modules frequently combine SQL, business policy and transport. There are overlapping approval, notification, email, analytics, PDF, dashboard and AI modules. Root-level `domain/application/infrastructure/api` trees also overlap `src/*` architecture paths.

## Target bounded contexts

| Context | Owns | Must not own | Current overlap / migration direction |
|---|---|---|---|
| Identity & Access | users, memberships, roles, permissions, sessions | business-role decisions | consolidate `core.auth`, main RBAC and portal auth behavior. |
| Tenant & Configuration | organization, tenant, entitlement, module, brand, terminology | tenant business transactions | evolve hotels into site compatibility model. |
| Commercial | customer, lead, opportunity, quote | contract execution, finance posting | unite lead/pipeline/quotation modules behind published contracts. |
| Contract | contract, obligations, SLA terms, amendments, renewals | project plan, invoice posting | separate contract lifecycle from portal views. |
| Project | project, schedule, work package, milestone, risks | purchasing, asset maintenance | establish contract-to-project integration event. |
| Operations | request, dispatch, work order, service report | asset master, stock accounting | converge service request/work-order/service-report paths. |
| Asset & Maintenance | asset, hierarchy, plan, inspection, warranty | dispatch/finance | converge assets, PM, predictive, warranty and twin projections. |
| Procurement | PR, approval process, RFQ, evaluation, PO, receipt | item stock balance, AP ledger | merge approval variants into platform workflow policy. |
| Inventory | item master, warehouse, stock, movement, reservation | supplier qualification, procurement policy | keep inventory vendor data as supplier reference, not ownership. |
| Finance | invoice, payment, matching, receivable/payable read models | source contract/PO data | resolve duplicate Invoice model/table definitions first. |
| Platform Services | documents, notifications, audit, search, export | domain lifecycle ownership | merge notification/email/PDF variants behind ports. |
| Analytics & AI | governed projections, metrics, recommendations | transactional truth | remove direct source mutations from analytics/AI endpoints. |

## Architectural rules

1. API router → application use case → domain model/policy → repository port → infrastructure adapter.
2. One context owns each aggregate and table; other contexts use identifiers, read models or events.
3. No runtime DDL, ad-hoc engine construction or raw tenant filtering in feature routers.
4. A shared kernel is limited to IDs, money, dates, event envelope, errors, authorization context and tenant context.
5. Introduce anti-corruption layers between legacy endpoints/tables and each migrated context.

## Duplicate and ownership hotspots

- Invoice has duplicate model definitions and inconsistent field/ID semantics.
- `approval_center`, `approval_chain`, and `approval_requests` are competing process concepts.
- `notifications`, `system_notifications`, `notification_engine`, `sse_notifications`, `email_notifications`, `email_alert`, and `email_service` need one platform notification boundary.
- Multiple dashboards/analytics/executive intelligence implementations lack a defined read-model owner.
- AI assistant, mentor, signals, scheduling, predictive maintenance and knowledge graph modules need a single AI platform boundary while retaining their domain tools.

