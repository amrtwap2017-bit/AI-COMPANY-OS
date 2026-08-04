# Enterprise Workflow Architecture v4

## Workflow standard

Every workflow must be a versioned definition with: process instance, tenant, current state, actor assignment, transitions, policy/approval decision, SLA timers, domain events, notification policy, evidence links and audit trail. Current endpoints may remain compatible, but must eventually invoke workflow application services rather than encode transitions ad hoc.

| Workflow | Actors | Core states / transitions | Approvals, automation and AI | SLA / KPIs |
|---|---|---|---|---|
| Lead to Contract | sales, estimator, client, legal, finance | lead → qualified → opportunity → survey → quote draft/sent/revised → accepted → contract active | pricing/margin approval; AI lead scoring, BOQ/proposal suggestions; notify owner/client. | response time, conversion, win rate, margin, quote cycle. |
| Contract to Project | commercial, project manager, finance | signed → mobilizing → project created → baseline approved | contract completeness gate; auto-create project workspace; AI scope-risk review. | handover time, baseline completeness. |
| Project Execution | PM, engineer, client, procurement, QA | planned → active → blocked/on-hold → milestone review → completed → handover | change/budget/milestone approvals; AI schedule/risk analysis; milestone notifications. | SPI, CPI, milestone adherence, defects. |
| Procurement to Payment | requester, manager, buyer, supplier, receiving, AP | request → approved → RFQ → evaluated → PO approved/sent → received → matched → payable/paid | approval matrix; auto-reorder; AI supplier/compliance/cost advice. | PR-to-PO, savings, OTIF, match exception rate. |
| Maintenance | requester, dispatcher, technician, supervisor, client | request → triaged → assigned → scheduled → in-progress → resolved → verified → closed | priority/SLA escalation; AI triage and technician recommendation; notify requester. | response, MTTR, first-time fix, SLA compliance. |
| Inventory | storekeeper, buyer, technician | planned/reorder → reserved → issued/received/transferred/adjusted | controlled adjustments and cycle counts; AI reorder forecast. | accuracy, availability, turns, stockouts. |
| Incident | reporter, incident commander, HSE, executive | reported → assessed → contained → investigated → corrective action → closed | severity escalation and executive notification; AI summarization only unless approved. | acknowledgement, containment, recurrence. |
| Inspection | inspector, engineer, QA, client | planned → assigned → performed → findings → corrective work → verified → closed | critical-finding escalation; AI checklist assistance/image review under evidence controls. | completion, defect closure, compliance. |
| Approval | requester, policy resolver, approver(s) | submitted → pending → approved/rejected/expired/delegated | configurable sequential/parallel thresholds, segregation of duties, escalation. | approval time, bypasses, overdue rate. |
| Warranty | asset owner, supplier, maintenance | registered → active → claim → repair/recovery → expired | entitlement verification; AI document retrieval and claim evidence summary. | recovery, claim cycle, warranty coverage. |
| Renewal | account manager, customer, finance | monitored → at-risk → offer → negotiation → renewed/churned | commercial threshold approval; AI health/churn recommendation. | renewal rate, ARR/contract value retained. |
| AI Review | requesting actor, AI agent, approving human | requested → context validated → proposed → reviewed → accepted/rejected → executed/audited | policy gate before side effects; evidence/citation required; notifications by risk. | acceptance, accuracy, latency, cost, safety exceptions. |

## Event policy

Events use a published envelope: `event_id`, `event_type`, `schema_version`, `occurred_at`, `organization_id`, `actor_id`, `correlation_id`, `aggregate_type/id`, classification, and payload reference. Use transactional outbox delivery. Consumers such as notifications, analytics and AI may not mutate the source aggregate directly.

## Backward-compatible migration

Map existing status strings to canonical states via adapters, retain current endpoints as facades, log transition conflicts, and migrate one workflow vertical slice at a time—starting with Service Request → Work Order → Service Report.

