# Exact Development Order

1. **Program control and authority.** Without owners, ADR authority and compatibility inventory, changes cannot be governed.
2. **Reproducible runtime and release gates.** A build, test and deployment baseline is required before migrations can be trusted.
3. **Central settings, secrets and health contracts.** All later services need one environment and operational contract.
4. **Database migration baseline and restore evidence.** Tenant, identity and workflow work cannot safely touch uncontrolled schema history.
5. **Tenant context and membership.** SaaS, authorization, configuration, AI and graph access all require a trustworthy scope.
6. **Verified identity and sessions.** Authorization cannot be reliable while token creation/verification has competing secrets and paths.
7. **Policy authorization and entitlements.** Workflows, pages, APIs, AI tools and marketplace extensions need a common decision point.
8. **API/error/correlation contracts.** Frontend and external integrations need stable contracts before consolidation.
9. **Configuration and feature flags.** White-label/modules/navigation/workflows require server-controlled configuration.
10. **Workflow state, approval, SLA, outbox and audit.** Domain migrations need process and event contracts.
11. **Notification/document platform facades.** Workflow and domain slices require reliable channels/evidence without duplicate implementations.
12. **Operations vertical slice.** It is the smallest end-to-end proving ground for tenant, identity, policy, workflow, events, notification, UI and AI.
13. **Maintenance/resources, then inventory/procurement.** These depend on work execution and resource/policy contracts.
14. **Finance and commercial/projects.** Financial integrity and contract/project relationships need stable procurement and workflow events.
15. **Analytics semantic models and digital twin projection.** Read models must consume governed events, not become new transaction owners.
16. **AI gateway, knowledge and shadow mode.** AI requires policy, evidence, workflow and tenant boundaries first.
17. **SaaS provisioning, integrations and marketplace.** External extensibility is safe only after stable contracts and policy scopes.
18. **Load, chaos, compliance and production pilot.** Hardening validates the entire dependency chain before general availability.

Changing this order requires an ADR proving that all dependencies and rollback evidence remain satisfied.

