# Enterprise Transformation Risk Register

Scoring: likelihood and impact 1–5; score 15+ is critical. Owners must update triggers every sprint.

| ID | Category | Risk / impact | L | I | Mitigation and contingency | Owner / trigger |
|---|---|---|---:|---:|---|---|
| R-01 | Architecture | parallel source authorities cause conflicting implementation | 4 | 5 | ADR authority decision and blueprint traceability | Architect; conflicting ADR. |
| R-02 | Technical | monolith changes regress untested endpoints | 5 | 5 | contract inventory, characterization tests, facades, canary | Backend/QA; regression. |
| R-03 | Data | migration corrupts shared tables or loses tenant rows | 3 | 5 | backup/restore, dry-run, checksums, dual-read, freeze | Data Architect; reconciliation mismatch. |
| R-04 | Security | JWT/RBAC inconsistency enables unauthorized access | 4 | 5 | verified identity, policy matrix, negative tests, kill switch | Security; failed auth test. |
| R-05 | Tenant | optional/default hotel filtering leaks data | 4 | 5 | mandatory context, membership validation, DB defense | Platform; cross-tenant test failure. |
| R-06 | API | response normalization hides breaking schema differences | 4 | 4 | OpenAPI contracts, adapters, consumer telemetry | API owner; contract drift. |
| R-07 | Operational | absent queue/worker causes request timeouts | 4 | 4 | job abstraction, timeout/circuit breaker, bounded sync fallback | Platform; latency SLO breach. |
| R-08 | Performance | repeated engines/raw queries fail at scale | 4 | 4 | pool lifecycle, query budget/index review/load tests | Performance; p95 breach. |
| R-09 | AI | unsupported model output creates unsafe side effect | 3 | 5 | shadow mode, evidence, approval policy, kill switch | AI governance; safety incident. |
| R-10 | Compliance | no control evidence for SOC2/ISO/ASVS | 3 | 5 | control owners, evidence repository and review cadence | Security; audit gap. |
| R-11 | Developer | migration fatigue and unclear ownership slow delivery | 4 | 3 | team topology, templates, Definition of Ready/Done | TPM; sprint spillover. |
| R-12 | Business | visual/API consolidation changes customer workflow | 3 | 4 | route compatibility, feature flags, customer pilot | Product; adoption decline. |
| R-13 | Integration | vendor outage cascades into core workflows | 3 | 4 | ACL, timeout, circuit breaker, retry/DLQ | Integration; error threshold. |
| R-14 | Marketplace | extension gains excessive tenant permissions | 2 | 5 | signed manifests, sandbox, least privilege and revoke | Platform/Security; scope violation. |
| R-15 | Recovery | backups cannot restore a coherent tenant | 2 | 5 | quarterly restore/DR drill and RPO/RTO evidence | Operations; failed restore. |

