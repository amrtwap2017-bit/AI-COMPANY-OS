# Enterprise Migration Strategy

## Universal migration pattern

`Inventory → Contract → Adapter → Shadow read → Dual-read/reconcile → Feature-flagged write → Observability → Consumer migration → Deprecation notice → Removal decision`. Removal is outside this program until explicit evidence satisfies the removal criteria; current mission rules prohibit deletion now.

| Surface | Current baseline | Target | Compatibility strategy | Exit evidence |
|---|---|---|---|---|
| Database | SQLAlchemy/raw SQL, duplicate models, runtime DDL | canonical context schemas and migrations | additive columns/views, mappers, dual-read/reconcile | restore, reconciliation and invariant tests. |
| API | `/api/v1` mixed response/error styles | contract-first envelopes/problem details | route facades and schema adapters | consumer contract suite and deprecation telemetry. |
| Frontend | three apps, duplicate clients/tokens | shared client/design/config packages | wrappers keep imports/URLs and current UX | route/visual/accessibility parity. |
| Backend | monolithic composition/router SQL | modular application services and ports | facade calls legacy implementations initially | context conformance and unit tests. |
| DDD | folder labels without enforced ownership | context-owned aggregates/events | anti-corruption layers and IDs | no cross-context writes in migrated slice. |
| Workflow | endpoint-specific statuses | versioned process definitions | status mapping and facade transitions | state/event/audit/SLA trace. |
| Configuration | source constants/default hotel | tenant/industry configuration service | seed current values, read legacy defaults | customer change without source edit. |
| AI | direct provider calls in feature modules | AI gateway/registry/policy | existing endpoints become registered tools | citation, policy, cost and evaluation evidence. |
| Auth/AuthZ | multiple JWT/RBAC paths | verified identity + policy decision point | accept old token/login contracts through adapter | negative tests and session revocation. |
| Notifications | duplicate channel modules | notification service | route/channel adapters | idempotent delivery and audit. |
| Documents | local uploads/PDF services | document metadata/storage abstraction | preserve paths/download URLs | tenant ACL, checksum, retention. |
| Search | global/raw SQL/vector variants | search port with indexed projections | compatibility query adapter | relevance/tenant/security tests. |
| Graph/twin | partial graph/twin routers | outbox-fed projection | legacy endpoints read projection adapter | replay and reconciliation. |

## Data safety policy

No destructive migration, implicit table recreation, or runtime schema mutation is permitted. Every migration has preflight, backup, dry-run, row-count/checksum reconciliation, rollback/forward-fix plan and an owner.

