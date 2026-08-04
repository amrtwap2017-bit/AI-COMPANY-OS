# Master Program Structure

## Hierarchy

```text
Program
└── Portfolio
    └── Epic
        └── Capability
            └── Initiative
                └── Feature
                    └── Story
                        └── Task
                            └── Acceptance Criteria
```

## Definitions

| Level | Definition | Example | Accountable owner |
|---|---|---|---|
| Program | 12–18 month outcome and governance boundary | Enterprise Platform Transformation | CTO / Chief Architect |
| Portfolio | Coordinated investment stream | Platform Foundation, Domain Modernization, Intelligence | Portfolio owner |
| Epic | Large measurable outcome | Tenant and Identity Platform | Epic owner |
| Capability | Durable business/technical ability | Tenant isolation, workflow execution, AI governance | Capability owner |
| Initiative | Bounded deliverable across teams | Organization membership service | Initiative lead |
| Feature | User/system outcome | Select active site with policy validation | Product owner |
| Story | Verifiable increment | “As an admin, I can assign a site membership…” | Team |
| Task | Implementable work item | Add compatibility repository adapter | Engineer |
| Acceptance criteria | Observable pass/fail behavior | Cross-tenant access returns 403 and audit event | QA/product |

## Definition of Ready

A story is ready only when it has: business outcome, owning capability, workflow/state, API/data impact, tenant/security classification, compatibility approach, dependencies, test strategy, observability requirements, rollback plan and linked ADR/blueprint reference.

## Definition of Done

Code (when implementation begins) is done only when: unit/integration/contract tests pass; old endpoints remain compatible; tenant and authorization tests pass; migrations are reversible or explicitly forward-safe; metrics/logs/traces exist; accessibility/type/lint gates pass; documentation and inventory are updated; security review is complete; feature flag and rollback are tested.

## Ownership model

Architecture owns boundaries and exceptions. Product owns outcome and workflow semantics. Engineering owns implementation and technical quality. QA owns evidence. Security owns control verification. Platform/Operations own deployability, SLOs and recovery. No individual owner can waive another team’s release gate.

## Work item fields

`ID`, `portfolio`, `epic`, `capability`, `initiative`, `feature`, `story`, `owner`, `priority`, `status`, `estimate`, `risk`, `dependencies`, `affected files/contexts`, `migration`, `compatibility`, `tests`, `acceptance criteria`, `ADR`, `target sprint`, `rollback`.

