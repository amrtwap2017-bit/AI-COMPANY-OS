# Implementation Roadmap — 12–18 Months

Two-week sprints are the planning unit. The first six months are foundation-heavy; domain migration is then performed one vertical slice at a time. Feature work is permitted only when it strengthens the target platform or preserves an existing contract.

| Phase | Timing | Purpose | Principal deliverables | Dependencies | Exit criteria |
|---|---:|---|---|---|---|
| 0. Program control | Sprints 0–1 | establish authority, inventory and gates | ADR register, compatibility register, owners, baseline metrics | existing audit/blueprint | approved program and no unowned critical risk. |
| 1. Platform Foundation | Sprints 2–4 | reproducible runtime, settings, health, errors, correlation | dependency manifest, environment schema, standard errors, release baseline | Phase 0 | clean build, deterministic health, CI gates. |
| 2. Configuration Platform | Sprints 5–6 | server-managed tenant/industry configuration | typed config schema, versioning, feature flags, effective snapshot | Foundation | brand/module/locale changes without code edits in test tenant. |
| 3. Workflow Engine | Sprints 7–9 | state, transitions, approval, SLA, events, audit | process definitions, policy resolver, outbox, worker abstraction | Foundation, config | reference workflow executes with traceable state/event/audit. |
| 4. Tenant Platform | Sprints 10–11 | organization/site/membership and isolation | tenant context, membership, compatibility hotel mapping, RLS plan | Foundation/config | cross-tenant test suite passes for migrated slice. |
| 5. Identity Platform | Sprints 12–13 | unified sessions, JWT/OIDC, lifecycle | identity facade, refresh/revocation, SSO-ready adapter | Tenant Platform | all portals use one verified identity contract. |
| 6. Authorization Platform | Sprints 14–15 | policy-based RBAC/ABAC and entitlements | permission catalog, role mapping, policy decision point | Identity/Tenant/Config | every migrated endpoint has server-side policy evidence. |
| 7. Notification Platform | Sprints 16–17 | channel, template, preference, delivery reliability | notification facade, email/SSE adapters, retries/DLQ | Workflow, identity, config | existing notification APIs preserved through one service. |
| 8. Domain Vertical Slices | Sprints 18–25 | migrate operations, maintenance, supply, finance and projects incrementally | application services, repositories, read models, adapters | phases 1–7 | selected slices meet context and workflow gates. |
| 9. Enterprise UX | Sprints 18–27 parallel | shared UI/API/configuration and navigation | design tokens, component contracts, workspace registry | config/API/identity | canonical pages meet accessibility/state/workflow contract. |
| 10. Knowledge and AI Layer | Sprints 26–30 | governed agent, prompt, tool, model, memory and RAG registry | AI gateway, evidence, evaluation, cost/audit | workflow, tenant, authorization, knowledge | AI operates in shadow mode with citations and policy. |
| 11. Digital Twin and Analytics | Sprints 29–33 | outbox projections, graph, semantic metrics | graph projection/replay, KPI catalog, executive read models | events, domain slices, AI | impact/trace queries replay correctly and remain tenant-scoped. |
| 12. SaaS, Integrations, Marketplace | Sprints 32–36 | provisioning, plans, usage, integration gateway, extensions | tenant provisioning, licensing, ACLs, signed manifests | config/tenant/API/twin | new tenant and approved integration provision without source change. |
| 13. Production hardening | Sprints 34–39 | resilience, performance, compliance and launch | load/chaos, DR, SBOM, security evidence, SLOs | all critical paths | all release gates pass and rollback/recovery is proven. |

## Phase migration rule

No phase may make a later phase depend on an unversioned private implementation. Every phase publishes an interface, compatibility adapter, telemetry and rollback procedure.

