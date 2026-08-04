# Enterprise Platform Roadmap v4

## Delivery policy

Each phase is incremental, backward compatible, feature-frozen except for reliability/security work, documented by ADR, protected by contract tests, and released behind configuration/feature flags. No phase authorizes deleting legacy behavior until telemetry and migration evidence prove consumers have moved.

| Phase | Objectives | Dependencies | Acceptance criteria | Risks / migration | Complexity |
|---|---|---|---|---|---|
| 1. Foundation | runnable build, one configuration contract, CI quality gates, secret and migration baseline. | inventory and release ownership. | build, tests, type/lint, migration and health gates are reproducible. | existing local workflows; use compatibility env aliases. | L |
| 2. Workflow Engine | process definitions, states, approvals, SLA, audit and outbox. | Foundation, identity/tenant context. | one end-to-end workflow has policy-driven transitions and event trace. | status compatibility; adapter maps legacy statuses. | XL |
| 3. Enterprise UX | workspace navigation, shared design system, canonical API client and page contract. | configuration, API contracts. | migrated workspace meets accessibility/state/permission standards. | preserve URLs as redirects. | L |
| 4. Project Platform | contract-to-project, planning, milestones, risk and handover context. | workflow engine, commercial/contract contracts. | project lifecycle traceable to contract and procurement events. | incremental project aggregate migration. | XL |
| 5. Resource Platform | teams, skills, capacity, schedule and time. | identity, operations workflow. | assignment policy respects skills, availability and scope. | technician compatibility mapping. | L |
| 6. Financial Intelligence | AR/AP, matching, payments, cost/read-model governance. | contract, procurement, safe ledger design. | invoice/payment traceability and period controls. | resolve duplicate invoice model before migration. | XL |
| 7. Supplier Ecosystem | supplier onboarding, scorecards, portal, catalog and compliance. | supply chain, documents, identity. | supplier access is tenant/policy scoped and procurement traceable. | retain vendor portal routes as facade. | L |
| 8. Customer Ecosystem | customer portal, success, renewal, secure external access. | commercial, contract, identity ACL. | customer views expose only entitled contract/project data. | ACL facade protects internal model. | L |
| 9. AI Layer | AI gateway, agent registry, RAG, evaluation, policy and cost controls. | graph/read models, configuration, audit. | every AI call is tenant-scoped, cited, auditable and evaluated. | shadow mode before action enablement. | XL |
| 10. Digital Twin | event projections, graph API, semantic reasoning evidence. | outbox/events, asset/project/supply contracts. | replayable tenant graph and impact/trace queries. | projection lag and graph drift; reconcile jobs. | XL |
| 11. Enterprise SaaS | org provisioning, plans, entitlements, storage and usage/billing. | tenant/configuration platform. | new customer provisioned without source changes. | single-tenant compatibility and data backfill. | XL |
| 12. Marketplace | extension manifests, integration SDK, sandbox/permissions and billing. | SaaS, API governance, audit. | signed extension lifecycle and tenant consent controls. | third-party risk; staged allowlist. | XL |

## First implementation slice after approval

Use Service Request → Work Order → Service Report as the reference vertical slice. It already exists in the repository, crosses high-value operations domains, can validate tenant enforcement, workflow state, resource assignment, inventory demand, notifications, audit, portal UX and AI recommendation controls without inventing a new feature.

## Exit governance for every phase

An architecture decision record, data migration plan, API compatibility matrix, security review, observability plan, rollback procedure, automated acceptance evidence and updated blueprint traceability are required before progressing.

