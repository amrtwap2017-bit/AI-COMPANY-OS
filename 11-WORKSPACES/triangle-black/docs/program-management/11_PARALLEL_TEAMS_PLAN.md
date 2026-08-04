# Parallel Teams Plan

| Team | Primary stream | Concurrent sprints | Required handoffs |
|---|---|---|---|
| Architecture | ADRs, boundaries, contracts, exceptions, blueprint traceability | all | approves context/event/config/API designs. |
| Backend | settings, API adapters, application services, vertical slices | 2–25 | publishes schemas, events, migration notes. |
| Platform | tenant, identity, policy, config, workflow, notifications | 2–17 | owns shared contracts and SDKs. |
| Frontend/UX | shared client, tokens, navigation, canonical pages | 5–27 | consumes API/config contracts; maintains URL parity. |
| Infrastructure/DevOps | images, environments, CI/CD, queues, telemetry, DR | 1–39 | supplies deployment and SLO evidence. |
| Data | migration baseline, projections, KPI semantic layer, twin | 4–33 | supplies reconciliation and lineage. |
| AI | registry/gateway/evaluation/RAG/agents | 7–31 | consumes policy, workflow, evidence and graph contracts. |
| QA | characterization, contract, integration, E2E, performance, release | all | owns independent evidence and veto for failed criteria. |
| Security/Compliance | threat model, ASVS, secrets, access, SOC2/ISO evidence | all | security gate and exception register. |
| Product/Business | capability ownership, workflow semantics, KPI acceptance | all | signs workflow and outcome acceptance. |

## Integration cadence

Weekly architecture/program sync; twice-weekly dependency review during migration; sprint demo against existing and canonical paths; monthly release-readiness review; quarterly blueprint and roadmap re-baseline.

