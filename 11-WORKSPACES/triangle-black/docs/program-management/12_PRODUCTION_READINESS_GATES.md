# Production Readiness Gates

All gates require evidence linked to a release candidate. A failed gate blocks promotion; waivers are time-boxed ADRs with named risk acceptance.

| Gate | Required evidence | Owner |
|---|---|---|
| Architecture | ADRs, context/API/event diagrams, compatibility and dependency review | Architecture |
| Security | threat model, ASVS checks, secrets scan, dependency scan, headers/CSP, authz negatives | Security |
| Performance | p95/p99 budgets, query plans, bundle budgets, load/soak and capacity result | Performance/Platform |
| Quality | lint/type/static-analysis thresholds, code review, no unexplained warnings | Engineering |
| Testing | unit, integration, contract, E2E, migration, accessibility and regression evidence | QA |
| Migration | backup, dry-run, checksums, row counts, forward/rollback plan, compatibility adapter | Data |
| Operations | runbook, on-call, alerts, SLO/SLI, incident and escalation plan | Operations |
| Observability | structured logs, correlation/tracing, metrics dashboards, audit evidence | Platform |
| AI governance | model/prompt/tool registry, evaluation, citation, cost, human approval and kill switch | AI/Security |
| Release | signed artifact/SBOM, staged canary, smoke tests, rollback and business sign-off | Release Board |

