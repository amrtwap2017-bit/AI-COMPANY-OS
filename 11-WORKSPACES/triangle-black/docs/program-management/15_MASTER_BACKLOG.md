# Master Backlog

Status for all items is `Planned` until explicitly accepted into a sprint.

| ID | Program / Epic | Feature / story | Priority | Dependency | Effort | Risk |
|---|---|---|---|---|---|---|
| MB-001 | Control / Authority | approve source-of-truth ADR and blueprint traceability | P0 | none | S | medium |
| MB-002 | Control / Inventory | regenerate route/page/entity/config catalog in CI | P0 | MB-001 | S | low |
| MB-003 | Foundation / Runtime | restore dependency manifest and one port/environment contract | P0 | MB-001 | M | high |
| MB-004 | Foundation / Quality | deterministic pytest/portal test fixtures and gates | P0 | MB-003 | M | high |
| MB-005 | Foundation / API | standard problem-details, correlation and response adapters | P0 | MB-003 | M | medium |
| MB-006 | Data / Migration | audited schema baseline and restore rehearsal | P0 | MB-003 | L | critical |
| MB-007 | Tenant / Identity | organization/site/membership compatibility model | P0 | MB-006 | L | critical |
| MB-008 | Identity / Security | consolidate verified JWT/session and secret paths | P0 | MB-007 | L | critical |
| MB-009 | Authorization | permission catalog, role map, policy decision adapter | P0 | MB-008 | L | critical |
| MB-010 | Configuration | tenant/industry config, flags and navigation registry | P0 | MB-007 | L | high |
| MB-011 | Workflow | state/approval/SLA/outbox/event/audit contracts | P0 | MB-005, MB-009 | XL | high |
| MB-012 | Platform | notification/document/export compatibility facades | P1 | MB-011 | L | medium |
| MB-013 | Operations | Service Request → Work Order → Report vertical slice | P1 | MB-011, MB-012 | XL | high |
| MB-014 | Maintenance | asset/PM/inspection/warranty vertical slice | P1 | MB-013 | XL | high |
| MB-015 | Resources | skill/capacity/dispatch/scheduling slice | P1 | MB-009, MB-013 | L | medium |
| MB-016 | Inventory | item/warehouse/movement invariant slice | P1 | MB-011, MB-013 | XL | high |
| MB-017 | Supply Chain | PR/RFQ/PO/receipt/three-way-match slice | P1 | MB-016 | XL | high |
| MB-018 | Finance | invoice/payment compatibility and reconciliation | P0 | MB-006, MB-017 | XL | critical |
| MB-019 | Commercial/Projects | lead-to-contract and contract-to-project adapters | P1 | MB-011, MB-018 | XL | high |
| MB-020 | UX | shared tokens/components/API clients and page registry | P1 | MB-005, MB-010 | L | medium |
| MB-021 | Analytics | KPI semantic catalog and read models | P1 | MB-011, MB-013 | L | medium |
| MB-022 | AI | agent/model/prompt/tool/memory/knowledge registries | P1 | MB-009, MB-010 | L | high |
| MB-023 | AI | governed RAG/evaluation/cost/shadow-mode actions | P1 | MB-011, MB-022 | XL | critical |
| MB-024 | Twin | outbox-fed graph projection/replay/reconciliation | P2 | MB-011, MB-021 | XL | high |
| MB-025 | SaaS | provisioning, subscription, entitlement and usage metering | P1 | MB-007, MB-010 | XL | high |
| MB-026 | Integrations | gateway/ACL/retry/circuit breaker/DLQ/contract registry | P1 | MB-005, MB-011 | L | medium |
| MB-027 | Marketplace | signed extension manifests, scopes, sandbox and revoke | P2 | MB-009, MB-025, MB-026 | L | high |
| MB-028 | Production | load/chaos/DR/SBOM/compliance and pilot release | P0 | all P0/P1 | XL | critical |

## Backlog completion rule

An item is not complete because code exists. It requires the Definition of Done, updated inventories, linked ADR, compatibility evidence, rollback rehearsal and the owning production gate’s approval.

