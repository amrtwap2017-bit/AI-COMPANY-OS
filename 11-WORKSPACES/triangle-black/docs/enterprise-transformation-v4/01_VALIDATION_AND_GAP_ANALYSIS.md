# Architecture Validation and Enterprise Gap Analysis v4

## Validation result

The codebase does not currently comply uniformly with Clean Architecture, DDD, CQRS, Hexagonal/Ports-and-Adapters, OpenAPI, Twelve-Factor, OWASP ASVS, SOC 2, ISO 27001, C4/ADR, Google/Microsoft engineering practices or AWS/Azure cloud-readiness guidance. These are transformation targets, not claims of current certification.

| Standard / concern | Current state | Problem / impact | Target / migration | Priority |
|---|---|---|---|---|
| Clean/Hexagonal | routers and `main.py` mix HTTP, SQL, DDL, business policy and configuration | high coupling and untestable rules | new context template with application ports; adapters wrap legacy routes | P0/P1 |
| DDD | documented contexts but `commercial` is a god-context | duplicate ownership and aggregate leaks | context ownership map, ACLs and events | P1 |
| CQRS/events | dashboards query operational tables; no outbox/broker | unreliable integration/read models | transactional outbox and governed projections | P1 |
| OpenAPI/API | 590 routes, only 111 response models; inconsistent list/error shapes | consumer fragility | compatibility response adapters and versioned schema contracts | P0 |
| Twelve-Factor | environment names/ports/compose drift; missing dependency manifest | non-reproducible deployment | one runtime/settings contract | P0 |
| OWASP ASVS | secret defaults, token variants, unsafe RBAC path, token-in-URL patterns | critical identity/data risk | identity consolidation, secure session and policy enforcement | P0 |
| SOC2/ISO27001 | audit/health elements exist but evidence controls incomplete | no auditable control operation | risk register, access review, logs, backup/DR evidence | P1 |
| DevOps/Cloud | no verified CI/CD, SBOM, tracing, queue or recovery drill | unsafe releases and poor operability | release pipeline and operational SLOs | P0/P1 |
| Accessibility/i18n | visual tokens exist but hard-coded styles/content and no audit suite | inaccessible/non-localizable UI | shared primitives and WCAG/i18n gates | P1 |
| AI governance | direct model calls; no registry/evaluation/audit policy | uncontrolled AI risk/cost | central AI gateway and registry | P1 |

## Gap matrix

| Area | Current issue | Target state | Dependencies |
|---|---|---|---|
| Frontend | three apps, duplicated clients/auth/design, 499 `ts-nocheck` | shared platform packages + compatibility shells | API contracts, config |
| Backend | 7,619-line composition root, raw SQL/engines | modular monolith composition root and context adapters | data baseline |
| Database | runtime DDL and unsafe migration lineage | reviewed forward-only schema baseline | backup/restore, data audit |
| Scalability | synchronous AI/export/email paths, no durable jobs | queue/outbox/workers, caches and projections | runtime topology |
| Integrations | documentation ahead of implementation | gateway, ACL, contract registry, retries/DLQ | API/event standard |
| Mobile/desktop/offline | responsive pages but no explicit offline architecture | API sync model, cache policy, conflict resolution | workflow/event model |
| White-label/SaaS | static frontend config only | server-managed tenant configuration and entitlements | tenant foundation |

