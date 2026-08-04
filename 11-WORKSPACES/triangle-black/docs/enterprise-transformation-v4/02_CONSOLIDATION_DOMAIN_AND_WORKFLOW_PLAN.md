# Consolidation, Domain and Workflow Plan v4

## Canonical implementation decisions

| Duplicate family | Canonical target | Compatibility approach |
|---|---|---|
| Authentication/token clients | one platform identity/session client | portal/client/admin adapters retain current storage and login URLs during transition. |
| Approval modules | Platform Workflow/Approval Policy service | facade existing approval endpoints to policy-backed process instances. |
| Notifications/email/SSE | Platform Notification service with channel adapters | retain existing routers/templates as channel adapters. |
| PDF/export services | Platform Document/Export service | keep current download routes and format outputs. |
| Invoice models | Finance invoice aggregate + legacy mapper | retain current table/fields; add canonical mapping before any schema change. |
| Dashboards/analytics | Analytics semantic/read-model layer | compatibility query adapters return current response shapes. |
| AI modules | AI gateway with domain tools | register existing assistants as tools/agents; no removal. |
| Design tokens/components | shared UI package and tenant theme contract | preserve components/URLs as wrappers until migrated. |

## Context refactor record

| Context | Aggregates / entities | Commands / queries / events | External dependencies | Migration plan |
|---|---|---|---|---|
| Commercial | Customer, Lead, Opportunity, Quote | qualify lead, price quote; LeadQualified, QuoteAccepted | documents, AI costing | wrap existing lead/quote routers behind use cases. |
| Contracts/Projects | Contract, Project, Milestone, Change | activate contract, create project; ContractSigned, ProjectStarted | finance, procurement | map existing contract/project IDs and events. |
| Operations | ServiceRequest, WorkOrder, ServiceReport | triage, assign, close; WorkOrderAssigned/Closed | resources, inventory | first reference vertical slice. |
| Maintenance/Assets | Asset, Plan, Inspection, Warranty | schedule PM, record inspection; PlanDue, FindingRaised | twin, supplier | retain asset/PM routes with application facades. |
| Supply/Inventory | PR, RFQ, PO, Receipt, Item, Balance | request/approve/order/receive; GoodsReceived | supplier, finance | consolidate approval policies without changing current APIs. |
| Finance | Invoice, Payment, Match | issue invoice, allocate payment; InvoiceIssued/Paid | contracts, POs | reconcile duplicate models/tables first. |
| Resources | User, Membership, Skill, Crew, Assignment | assign work; AssignmentCreated | identity, operations | introduce alongside technicians/agents. |
| Platform | Tenant, Policy, Config, Document, Notification | configure/authorize/publish | all contexts | shared kernel only, no business ownership. |
| Analytics/Twin/AI | Metric, Projection, Recommendation, Evidence | query/explain/propose; ProjectionUpdated | all contexts | outbox-fed projections and AI tools. |

## Workflow validation rule

Every page/action must register one workflow and state transition. Existing pages not yet mapped are classified as `platform`, `compatibility`, `experimental`, or `workflow-debt`; they are not removed. State machines, approvals, SLA, notifications, events, audit, AI and KPIs are introduced as adapters around existing behavior before becoming authoritative.

