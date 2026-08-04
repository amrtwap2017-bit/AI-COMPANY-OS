# Governance and Implementation Roadmap v4

## API governance target

All new/migrated APIs use `/api/v1` compatibility facades and canonical contracts with RFC 9457 Problem Details, typed validation, cursor/page pagination, filtering/sorting/search conventions, correlation IDs, tenant/authorization policy, idempotency for commands, rate/caching policies, OpenAPI generation and contract tests. Existing APIs remain and receive response/request adapters.

## Production readiness target

One reproducible image/dependency manifest; environment schema; secret manager; safe migrations; health/readiness/liveness; structured logs, metrics and traces; security headers/CSP; SBOM/dependency/secret scans; isolated integration database; backup/restore and chaos/load test evidence; release gates; incident response and documented rollback.

## Incremental sprint roadmap

| Sprint | Goals / files in scope | Compatibility and rollback | Tests / acceptance | Complexity |
|---|---|---|---|---|
| 1: Baseline | approve authorities, inventory, ADR template, compatibility register, CI design | documentation only; no runtime changes | inventory complete; source-authority ADR accepted | M |
| 2: Runtime security | settings/secret/port contract, verified identity/RBAC, reproducible build, test fixtures | accept old variable names through mapper; instant config rollback | build, migration, auth, tenant isolation and security tests | L |
| 3: Platform spine | tenant/membership/policy, API problem-details, correlation/outbox foundations | facade existing `/api/v1` routes; additive schema | contract and cross-tenant tests | XL |
| 4: Operations slice | Service Request → Work Order → Service Report workflow/context facade | map existing status/routes/tables; feature-flag rollout | workflow, SLA, approval, audit, UI E2E tests | XL |
| 5: UX/config | shared clients/components, configuration snapshot, navigation registry | retain portals and URL redirects | visual/accessibility/type/compatibility tests | L |
| 6: Supply/maintenance | procurement/inventory/asset workflow adapters and projections | dual-read/reconciliation where required | financial/stock/asset integrity tests | XL |
| 7: Finance/projects | invoice reconciliation, contract/project workflow integration | no table replacement until validated | ledger/contract/migration/restore tests | XL |
| 8: AI/twin | gateway, registries, evidence, graph projections, shadow mode | existing AI endpoints become registered tool facades | eval, policy, cost, provenance and tenant tests | XL |
| 9: SaaS/integrations | provisioning, entitlements, external gateway and marketplace foundations | single-tenant default mapping | provisioning, ACL, recovery and integration contract tests | XL |

## Mandatory ADRs before Sprint 2

1. Current-runtime authority and documentation hierarchy.
2. Tenant model and `hotel_id` compatibility strategy.
3. Identity/JWT/session and RBAC policy consolidation.
4. Schema baseline and migration safety policy.
5. API compatibility, error and versioning policy.
6. Workflow engine/outbox and event envelope.
7. Configuration and feature-flag authority.
8. AI governance/data handling policy.

