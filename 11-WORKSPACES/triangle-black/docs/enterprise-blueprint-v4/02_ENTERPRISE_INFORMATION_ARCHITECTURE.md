# Enterprise Information Architecture v4

## Baseline

The current database is hotel-oriented (`hotel_id`) and several modules implement their own tables and raw SQL. The target model must generalize this without breaking existing hotel identifiers: a hotel becomes a `Site` under a tenant, with `hotel_id` retained as a compatibility alias during migration.

## Canonical enterprise graph

```text
Company → Organization/Tenant → Department → Customer → Contract → Project
                                             ↘ Site → Building → Floor → Area → Asset
Asset → Maintenance Plan → Service Request → Work Order → Inspection → Service Report
Work Order / Project → Material Demand → Purchase Request → RFQ → Purchase Order
Purchase Order → Goods Receipt → Inventory Movement → Inventory Balance
Supplier → Supplier Contract / Scorecard → Purchase Order
Contract / Purchase Order → Invoice → Payment → Financial and Executive Analytics
All governed records → Documents, Events, Audit Entries, Notifications, AI Memory
```

## Entity ownership and relationships

| Entity | Owner | Required relationships | Lifecycle/accountability |
|---|---|---|---|
| Company | Platform | one or more organizations | legal/operator boundary; owns SaaS relationship. |
| Organization (tenant) | Platform | company, subscription, brand, members, sites | isolation and configuration boundary. |
| Department | Resources | organization, users, cost centers | accountable unit for approvals and cost allocation. |
| Customer | Commercial | organization, contacts, contracts, sites | external commercial party; not synonymous with tenant. |
| Contract | Contract | customer, project(s), sites, quote, invoices | legal/commercial source of scope, terms and SLA. |
| Project | Projects | contract, sites, budget, work packages, resources | execution aggregate; consumes procurement and reports progress. |
| Site/Building/Floor/Area | Operations | organization, customer/contract/project where relevant | location hierarchy; hotel maps here initially. |
| Asset | Maintenance | site/area, class, warranty, plans, work history | operational physical/digital asset identity. |
| Service Request | Operations | requester, site/asset, SLA, work order(s) | demand intake record; never overwritten by execution details. |
| Work Order | Operations | request/plan, asset, crew, inventory, approvals, reports | execution aggregate with accountable owner and state history. |
| Inspection | Maintenance/QA | asset/work order/project, checklist, findings | compliance/condition evidence. |
| Inventory Item/Balance | Inventory | organization, warehouse, supplier catalog, movements | item master is distinct from tenant stock balance. |
| Purchase Request/RFQ/PO/Receipt | Supply Chain | demand source, project/work order, supplier, approvals | procure-to-pay traceability chain. |
| Supplier | Supplier | organization, contacts, qualification, scorecards | supplier master and eligibility boundary. |
| Invoice/Payment | Finance | contract or PO, customer/supplier, accounting period | financial evidence, immutable payment allocation history. |
| Analytics KPI | Analytics | metric definition, source read model, period, tenant | derived read model only; never a source transaction. |
| AI Memory | AI/Knowledge | tenant, provenance, retention, access policy | derived and revocable knowledge; never ungoverned hidden state. |

## Mandatory common attributes

Every tenant-owned record requires: immutable `id`, `organization_id`, compatibility `hotel_id` where applicable, `created_at`, `created_by`, `updated_at`, `updated_by`, lifecycle `status`, version/optimistic-lock value, and audit/event correlation ID. Sensitive records additionally require classification, retention and access-policy references.

## Relationship storage policy

- Relational foreign keys enforce transactional ownership and integrity.
- Relationship tables express many-to-many links: project-site, asset-document, work-order-inventory, user-role, approval-assignee, and AI-evidence.
- An outbox/event table records domain events transactionally.
- The Digital Twin graph is a projection of approved relational facts, not a competing system of record.
- Documents are stored externally with immutable metadata, version, checksum, tenant scope and authorization reference in the database.

## Current gaps to preserve during migration

Current `hotel_id` is not sufficient organization membership, building hierarchy, customer ownership, cost allocation or white-label configuration. Migration must add canonical IDs beside existing fields, backfill deterministically, expose compatibility views/routes, and only retire old semantics after contract-consumer migration.

