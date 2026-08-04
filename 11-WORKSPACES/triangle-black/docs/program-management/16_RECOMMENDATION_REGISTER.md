# Recommendation Register

Every recommendation below uses the required decision fields. These are planning decisions only; implementation requires sprint acceptance and the relevant ADR.

## REC-01 — Establish authoritative architecture control

- **Current State:** Named root authority files are absent; existing architecture documentation and runtime implementation conflict.
- **Problem:** Teams can make incompatible decisions from different sources.
- **Impact:** Rework, boundary drift and ungoverned exceptions.
- **Target State:** Approved authority hierarchy, ADR index, blueprint traceability and architecture exception register.
- **Migration Strategy:** Classify current documents as authoritative, target, historical or superseded; do not delete any file.
- **Compatibility Strategy:** Existing source and docs remain valid references until an ADR changes their status.
- **Risk:** Medium; disagreement can delay the program.
- **Priority:** P0.
- **Complexity:** S.
- **Dependencies:** none.
- **Acceptance Criteria:** Board-approved authority ADR, owner for every architecture area, and CI-linked traceability index.

## REC-02 — Reproducible runtime and release baseline

- **Current State:** Docker, compose, dependency and port assumptions differ across files; tests do not provide a reliable release gate.
- **Problem:** Builds and deployments are not deterministic.
- **Impact:** Production drift and inability to validate migrations safely.
- **Target State:** One versioned dependency/runtime/environment contract with reproducible image and health behavior.
- **Migration Strategy:** Add manifest/config validation and compatibility aliases; leave existing scripts until consumers migrate.
- **Compatibility Strategy:** Support current environment names through a normalized settings adapter.
- **Risk:** High if default assumptions are accidentally changed.
- **Priority:** P0.
- **Complexity:** M.
- **Dependencies:** REC-01.
- **Acceptance Criteria:** Clean build, isolated start, health/readiness checks, deterministic CI artifact.

## REC-03 — Tenant and identity foundation

- **Current State:** Hotel/default-header tenancy and several JWT/RBAC paths coexist.
- **Problem:** Tenant scope and identity authority are not uniform.
- **Impact:** Cross-tenant exposure and authorization bypass risk.
- **Target State:** Organization/site/membership context, one verified session service and policy-ready identity.
- **Migration Strategy:** Map hotel to site, add membership tables/contracts, dual-resolve identity through a facade.
- **Compatibility Strategy:** Preserve `hotel_id`, login URLs, token response fields and legacy role mappings.
- **Risk:** Critical data/security risk.
- **Priority:** P0.
- **Complexity:** L.
- **Dependencies:** REC-01, REC-02, migration baseline.
- **Acceptance Criteria:** All migrated endpoints reject invalid tenant scope; old login consumers remain functional; negative authorization suite passes.

## REC-04 — Policy authorization and entitlements

- **Current State:** Roles and role levels are implemented in multiple places; module visibility is partly frontend-only.
- **Problem:** UI visibility can diverge from server authorization.
- **Impact:** Inconsistent access and SaaS licensing failures.
- **Target State:** Central permission catalog, policy decision point, data scope and entitlement evaluation.
- **Migration Strategy:** Wrap current `require_*` dependencies with a compatibility policy adapter; migrate endpoint families.
- **Compatibility Strategy:** Existing roles map to permission sets; no route is removed.
- **Risk:** High due to accidental denial or overgrant.
- **Priority:** P0.
- **Complexity:** L.
- **Dependencies:** REC-03, configuration platform.
- **Acceptance Criteria:** Endpoint-policy matrix is complete for migrated domains and every negative test passes.

## REC-05 — Safe schema and data migration

- **Current State:** Runtime DDL, duplicate models and unsafe/partial Alembic history exist.
- **Problem:** Schema state is not a trustworthy deployment artifact.
- **Impact:** Data loss, non-repeatable environments and blocked SaaS provisioning.
- **Target State:** Audited forward migrations, restore evidence, ownership and reconciliation.
- **Migration Strategy:** Baseline current production schema, add canonical structures, dual-read/reconcile, then migrate slices.
- **Compatibility Strategy:** Views/mappers preserve existing table and field semantics.
- **Risk:** Critical.
- **Priority:** P0.
- **Complexity:** XL.
- **Dependencies:** REC-02, data owner, backup/restore.
- **Acceptance Criteria:** Fresh install, upgrade, rollback/forward-fix, backup restore and row/checksum reconciliation succeed.

## REC-06 — API contract governance

- **Current State:** Endpoint response shapes, errors, pagination and validation vary across routers.
- **Problem:** Frontends and external integrations depend on undocumented quirks.
- **Impact:** Breaking changes hidden by client normalization.
- **Target State:** OpenAPI-first schemas, Problem Details, pagination/filter/search conventions and correlation/idempotency.
- **Migration Strategy:** Generate route catalog, add adapters at boundary, migrate one context at a time.
- **Compatibility Strategy:** Existing response shapes remain available through versioned/facade serializers.
- **Risk:** Medium.
- **Priority:** P0.
- **Complexity:** L.
- **Dependencies:** REC-02, REC-03.
- **Acceptance Criteria:** All public routes registered, contract tests pass, no unreviewed schema drift.

## REC-07 — Workflow and event spine

- **Current State:** Status transitions and approvals are distributed across routers/modules.
- **Problem:** Actions lack one process instance, SLA, audit and event contract.
- **Impact:** Untraceable work, duplicate notifications and unsafe automation.
- **Target State:** Versioned workflow engine, policy resolver, outbox and idempotent consumers.
- **Migration Strategy:** Start with Service Request → Work Order → Report and map legacy statuses.
- **Compatibility Strategy:** Existing endpoints invoke transition facades and preserve status strings.
- **Risk:** High.
- **Priority:** P0.
- **Complexity:** XL.
- **Dependencies:** REC-04, REC-06, REC-05.
- **Acceptance Criteria:** Every transition has actor, guard, event, audit, SLA and notification evidence.

## REC-08 — Shared frontend and design system

- **Current State:** Three apps, duplicate clients/tokens, hard-coded styles and incomplete state boundaries.
- **Problem:** UX/security/configuration behavior diverges by portal.
- **Impact:** High maintenance and inconsistent customer experience.
- **Target State:** Shared typed client, token/theme contract, component primitives and page/workflow registry.
- **Migration Strategy:** Add shared packages and wrappers; migrate canonical workspaces while preserving URLs.
- **Compatibility Strategy:** Existing components import through compatibility exports and redirects.
- **Risk:** Medium.
- **Priority:** P1.
- **Complexity:** L.
- **Dependencies:** REC-06, configuration.
- **Acceptance Criteria:** Type/lint/accessibility gates pass for migrated pages and current URL behavior is unchanged.

## REC-09 — AI governance gateway

- **Current State:** Feature routers and developer tooling call local models/providers directly.
- **Problem:** No uniform tenant policy, evidence, evaluation, cost or action approval.
- **Impact:** AI safety, privacy and cost risk.
- **Target State:** Agent/model/prompt/tool/memory/knowledge registries behind an AI gateway.
- **Migration Strategy:** Register existing AI implementations as tools and run shadow mode first.
- **Compatibility Strategy:** Existing AI endpoints remain facades to gateway-managed capabilities.
- **Risk:** Critical for side-effecting actions.
- **Priority:** P1.
- **Complexity:** XL.
- **Dependencies:** REC-03, REC-04, REC-07, knowledge ACL.
- **Acceptance Criteria:** Every AI call is tenant-scoped, cited/evaluated, costed, audited and kill-switchable.

## REC-10 — Digital Twin and analytics projections

- **Current State:** Partial graph/twin/analytics implementations query operational data directly.
- **Problem:** Derived intelligence can become a competing source of truth.
- **Impact:** Stale, untraceable or cross-tenant decisions.
- **Target State:** Replayable event-fed projections, KPI semantic catalog and evidence-linked graph.
- **Migration Strategy:** Build projections from outbox events; keep legacy queries via read adapters.
- **Compatibility Strategy:** Preserve dashboard response contracts while replacing internals incrementally.
- **Risk:** High data-lineage risk.
- **Priority:** P2.
- **Complexity:** XL.
- **Dependencies:** REC-05, REC-07, REC-09.
- **Acceptance Criteria:** Replay/reconciliation, tenant filters, provenance and KPI parity pass.

## REC-11 — SaaS provisioning and marketplace controls

- **Current State:** Static configuration and portals exist; subscription/entitlement/extension lifecycle is not a complete runtime service.
- **Problem:** New customers and extensions require source changes or unsafe access.
- **Impact:** Cannot scale commercially or safely support partners.
- **Target State:** Provisioning, plans, usage, storage, AI credits and signed least-privilege extensions.
- **Migration Strategy:** Provision current single-hotel behavior as a default organization/site package.
- **Compatibility Strategy:** Existing tenants and URLs are seeded into the new model.
- **Risk:** High operational and security risk.
- **Priority:** P1.
- **Complexity:** XL.
- **Dependencies:** REC-03, REC-04, REC-08, REC-10.
- **Acceptance Criteria:** New tenant provisioned without code edits; extension permissions are consented, audited and revocable.

## REC-12 — Production resilience and compliance

- **Current State:** Health checks and request IDs exist, but CI/CD, SLOs, tracing, SBOM, restore and chaos evidence are incomplete.
- **Problem:** Operational readiness cannot be proven.
- **Impact:** Slow incidents, unsafe releases and audit failure.
- **Target State:** Gated pipeline, observability, SLOs, DR, security evidence and staged release.
- **Migration Strategy:** Introduce gates progressively; do not block legacy development until baseline gates have a migration window.
- **Compatibility Strategy:** Release adapters and feature flags support staged rollout/canary.
- **Risk:** Medium/high schedule risk.
- **Priority:** P0.
- **Complexity:** L.
- **Dependencies:** all critical path items.
- **Acceptance Criteria:** Architecture, security, performance, quality, testing, migration, operations, observability, AI and release gates pass.

