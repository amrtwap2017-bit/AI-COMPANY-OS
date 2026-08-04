# Capability Dependency Graph

## Graph

```text
Program governance / ADR / inventory
        ↓
Reproducible runtime + settings + CI gates
        ↓
Tenant context ──────┐
Identity ────────────┼──► Authorization / Entitlements
Configuration ──────┘             ↓
                           API governance
                                  ↓
          Workflow engine ───────┼──── Notification platform
              ↓                   │
       Outbox/event envelope      │
              ↓                   │
       Domain vertical slices ────┘
       (Operations → Maintenance → Supply → Finance → Projects/Commercial)
              ↓
      Analytics read models ───► Digital Twin graph
              ↓                         ↓
       Executive intelligence ←── AI gateway/agents
                                        ↓
                          SaaS / integrations / marketplace
```

## Critical path

`Authority → reproducible runtime → tenant/identity → authorization → API contracts → workflow/outbox → first vertical slice → event/read models → AI/twin → SaaS/marketplace → production hardening`.

## Parallelizable tracks

| Track | Can run in parallel after | Constraints |
|---|---|---|
| Design system audit and component contracts | program baseline | must consume configuration/token decisions. |
| CI static analysis and test-fixture repair | Foundation | cannot loosen release standards to pass. |
| Documentation/inventory reconciliation | all phases | updates every sprint. |
| Integration contract registry | API envelope decision | no domain direct integration. |
| AI registry/evaluation design | tenant/policy design | no production side effects before authorization. |
| Performance query/index audit | data inventory | no unsafe schema changes. |

## Blocking items

- Missing dependency/runtime manifest blocks reproducible deployment.
- JWT secret/RBAC inconsistency blocks secure identity.
- Unsafe migration lineage blocks database rollout.
- No tenant membership enforcement blocks SaaS and AI data access.
- Broken test topology blocks release evidence.

## Quick wins with low migration risk

Route/page/module catalog generation, environment schema documentation, correlation ID propagation, OpenAPI response inventory, standard error adapter, health contract, dependency lock validation, feature-flag registry schema, and ADR templates.

