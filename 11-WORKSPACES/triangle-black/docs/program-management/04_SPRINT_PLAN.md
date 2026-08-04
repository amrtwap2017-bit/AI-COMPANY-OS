# Sprint Plan

Each sprint is two weeks unless explicitly extended for migration rehearsal. Estimates use S/M/L/XL (1–3, 4–8, 9–20, 21+ engineer-days across a team). Files are initial ownership surfaces; adapters may be added without moving legacy files.

| Sprint | Goals and stories | Files/contexts | Testing, migration and acceptance | Size |
|---:|---|---|---|---|
| 0 | approve source authority; establish ADR, risk and compatibility registers | `docs/*`, governance | inventory baseline reviewed; no code change | S |
| 1 | repair ownership model; define release gates and CI contract | manifests, `pytest.ini`, portal package configs | pipeline design approved; baseline failures recorded | M |
| 2 | standard settings/environment schema and port contract | `src/core/config.py`, compose, Dockerfiles | config validation, clean image build, health contract | M |
| 3 | API errors/correlation/request context adapter | `src/main.py`, core API utilities | contract tests preserve existing responses; trace IDs verified | M |
| 4 | migration baseline and DB restore rehearsal | `alembic/*`, models | fresh install/upgrade/backup restore; no runtime DDL added | L |
| 5 | typed platform configuration schema and effective snapshot | new platform config adapters, portal config consumers | schema/tenant override tests; current defaults unchanged | M |
| 6 | feature flag/module/navigation registry | portal navigation/config adapters | disabled module is server-denied and existing enabled routes work | M |
| 7 | workflow/process definition contract and state audit | workflow docs/adapters, operations contexts | state transition contract tests | L |
| 8 | approval policy and SLA timer contract | approval variants, scheduler abstraction | approval segregation/escalation tests; existing approval routes facade | L |
| 9 | outbox/event envelope and notification trigger adapter | platform events, notification modules | idempotency, replay and audit tests | L |
| 10 | organization/site/membership tenant context | `core/tenant.py`, auth models, hotel adapters | cross-tenant data/URL/header abuse tests | L |
| 11 | tenant backfill and compatibility views | Alembic/data adapters | reconciliation and rollback rehearsal | XL |
| 12 | unified identity/session facade | `core/auth.py`, portal auth clients, admin/client auth | token verification/revocation/login compatibility tests | L |
| 13 | OIDC/SSO-ready identity adapter and user lifecycle | auth integration boundary | security and session lifecycle tests | L |
| 14 | permission catalog and role compatibility map | core policy, RBAC route adapters | endpoint policy matrix and negative authorization tests | L |
| 15 | entitlement/data-scope policy | config/tenant/authorization | module/tenant/role contract tests | M |
| 16 | notification channel/template/preference facade | notifications/email/SSE modules | delivery retry/idempotency and current endpoint tests | L |
| 17 | document/export/PDF adapter | documents/PDF/CSV modules | access, checksum, export compatibility tests | M |
| 18 | Operations vertical slice command/query separation | service request/work orders/service reports | workflow E2E, API contract, tenant and audit tests | XL |
| 19 | Maintenance/asset/inspection slice | asset/maintenance/warranty modules | PM/inspection/asset graph and regression tests | XL |
| 20 | Resources/dispatch/scheduling slice | technicians/resources/AI scheduling | capacity/SLA/authorization tests | L |
| 21 | Inventory/stock slice | inventory/warehouse/movement modules | balance/invariant/concurrency tests | XL |
| 22 | Procurement/approval/receipt slice | PR/RFQ/PO/GR modules | three-way-match and approval tests | XL |
| 23 | Finance invoice/payment compatibility slice | invoice/payment modules | monetary precision, idempotency, migration tests | XL |
| 24 | Commercial contract/project read/write adapters | leads/quotes/contracts/projects | lead-to-contract and contract-to-project E2E | XL |
| 25 | analytics semantic KPI catalog | reporting/dashboard/executive modules | metric reconciliation and tenant scope tests | L |
| 26 | shared UI component/token contract | portal components/styles/config | type/lint/accessibility/visual regression baseline | L |
| 27 | canonical navigation/page workflow registry | portal route families | every route classified; redirects tested | L |
| 28 | AI model/agent/prompt/tool registry | `ai_assistant`, `agent`, `10-AI` adapters | registry schema, permission and cost tests | L |
| 29 | RAG/knowledge/evidence controls | knowledge graph, Chroma/Qdrant adapters | ACL retrieval, citation and retention tests | L |
| 30 | AI shadow-mode workflow recommendations | AI/domain tools | offline evaluation, human review, no autonomous side effects | XL |
| 31 | outbox-fed digital twin projection | graph/twin/analytics | replay, reconciliation, tenant isolation tests | XL |
| 32 | provisioning, plans, usage and licensing | tenant/config/platform adapters | new tenant without source modification | XL |
| 33 | integration gateway/ACL/retry/DLQ | `07-INTEGRATION`, gateway adapters | contract, timeout, retry and failure-isolation tests | L |
| 34 | marketplace manifest/permissions sandbox | platform/extension registry | signed package, consent and revoke tests | L |
| 35 | load/performance/scalability hardening | DB queries, caches, workers, portal bundles | load, soak, cache and query-budget gates | XL |
| 36 | security/compliance evidence and DR | CI, deploy, secrets, backups | ASVS/SOC2/ISO evidence review, restore and incident drill | L |
| 37 | production pilot / tenant migration rehearsal | all migrated contexts | staged tenant, rollback, compatibility and SLO evidence | XL |
| 38 | general availability readiness | release artifacts/runbooks | all release gates pass; executive go/no-go | L |

