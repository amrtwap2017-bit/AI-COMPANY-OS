# Enterprise Readiness Matrix

Scores are 0–100 based on the current audited repository; targets are exit targets for general availability.

| Area | Current | Target | Gap | Required work |
|---|---:|---:|---:|---|
| Architecture | 25 | 90 | 65 | composition root, context boundaries, ADR governance |
| DDD | 25 | 85 | 60 | aggregate ownership, ports, events, ACLs |
| UX | 45 | 90 | 45 | page/workflow registry, states, shared workspaces |
| Platform | 25 | 90 | 65 | common identity/config/audit/document/notification services |
| Configuration | 35 | 95 | 60 | tenant server-managed configuration and entitlements |
| Workflow | 25 | 90 | 65 | state machine, approval, SLA, event/audit engine |
| API | 25 | 95 | 70 | schemas, Problem Details, pagination, policy, contract tests |
| Infrastructure | 30 | 90 | 60 | single runtime contract, workers, storage, networking |
| DevOps | 10 | 90 | 80 | CI/CD, artifact, environment, rollback and DR |
| AI | 25 | 90 | 65 | registry, gateway, RAG, evaluation, cost and policy |
| Security | 10 | 95 | 85 | identity, secrets, ASVS, headers, scanning, audit |
| Scalability | 20 | 85 | 65 | queues, pooling, cache, projections, load evidence |
| Testing | 5 | 90 | 85 | deterministic unit/integration/contract/E2E/load gates |
| Documentation | 55 | 90 | 35 | source authority, ADR/code traceability and refresh |
| Observability | 25 | 90 | 65 | logs, metrics, traces, SLO/alerts and audit |
| Data | 20 | 90 | 70 | migration baseline, integrity, classification, lineage |
| Compliance | 15 | 85 | 70 | control owners/evidence for ASVS, SOC2, ISO27001 |
| SaaS | 20 | 90 | 70 | provisioning, plans, usage, isolation and billing |
| Marketplace | 5 | 80 | 75 | signed manifests, sandbox, scopes, consent, billing |
| Digital Twin | 20 | 85 | 65 | event projection, graph, replay and evidence |

