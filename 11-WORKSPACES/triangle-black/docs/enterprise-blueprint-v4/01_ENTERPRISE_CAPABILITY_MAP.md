# Enterprise Capability Map v4

## Purpose and status

This is the architecture baseline for Triangle Black as a configurable Enterprise AI Operations Platform. It records the current repository reality and the target operating model; it does not assert that a target capability is already implemented. The current codebase contains production candidates in `src/commercial`, three Next.js portals, legacy/root-level architecture experiments, and extensive business documentation.

## Capability map

| Capability | Purpose / business owner | Inputs → outputs | KPIs | Sub-capabilities | Workflow / AI / dependencies | Priority |
|---|---|---|---|---|---|---|
| Commercial | Convert demand into governed revenue. Owner: Commercial Director. | Leads, surveys, price inputs → quotes, contracts, forecasts. | conversion, win rate, margin, cycle time. | lead management, pipeline, quotation, contract, renewal, CRM activity. | Lead-to-Contract; AI Cost Optimizer and Executive Analyst; Customer, Contract, Documents. | Core |
| Projects | Deliver contracted engineering scope. Owner: Projects Director. | Contract, scope, schedule, budget → milestones, deliverables, handover. | schedule/cost variance, earned value, defects, completion. | project plans, milestones, risks, resources, site survey, handover. | Contract-to-Project and Project Execution; AI Project Director; Contract, Procurement, Documents. | Core |
| Operations | Coordinate service execution. Owner: Operations Director. | Service demand, SLA, availability → dispatched and verified work. | response/resolution time, backlog, first-time fix, SLA compliance. | service requests, dispatch, scheduling, crews, service reports, calendar. | Service-to-Resolution; AI COO, Planner, Scheduler; Maintenance, Resources, Inventory. | Core |
| Maintenance | Preserve asset performance and compliance. Owner: Maintenance Director. | Asset condition, PM plans, incidents → work, inspections, warranties. | uptime, PM compliance, MTBF, MTTR, maintenance cost. | assets, preventive/predictive maintenance, inspections, warranty, digital twin. | Maintenance, Inspection, Warranty; AI Maintenance Director; Sites, Operations, Inventory. | Core |
| Supply Chain | Source goods and services with policy controls. Owner: Procurement Director. | Need, budget, stock → RFQ, approval, PO, receipt. | PR-to-PO time, savings, on-time delivery, three-way-match rate. | requisition, approval, RFQ, supplier selection, PO, goods receipt, intake. | Procurement-to-Payment; AI Procurement Director; Inventory, Supplier, Finance. | Core |
| Inventory | Control stock availability and valuation. Owner: Supply Chain Manager. | receipts, issues, transfers, min/max → balances, replenishment. | stock accuracy, fill rate, turns, stockout rate. | catalog, warehouses, movements, alerts, balances, vendors. | Inventory and Procurement; AI Cost Optimizer; Supply Chain, Maintenance. | Core |
| Finance | Govern receivables, payables, cash and operational profitability. Owner: Finance Director. | contracts, invoices, receipts, payments → aging, cash, profitability. | DSO, collection rate, AP aging, margin, close duration. | AR invoices, payment tracking, AP matching, approvals, reporting. | Financial Close, Procurement-to-Payment; AI Executive Analyst/Cost Optimizer; Commercial, Supply Chain. | Core |
| Resources | Manage people, capacity and capability. Owner: HR/Operations. | skills, availability, assignments → crew plan and utilization. | utilization, overtime, certification compliance, capacity. | users, technicians, teams, roles, skills, time tracking. | Dispatch and Scheduling; AI Planner/Scheduler; Identity, Operations. | High |
| Customer Success | Retain and grow customers. Owner: Customer Success Director. | contract health, service history, feedback → success plan, renewal action. | NPS, renewal rate, churn risk, SLA perception. | customer 360, support, satisfaction, renewals. | Renewal and Service workflows; AI COO/Knowledge Expert; Commercial, Operations. | High |
| Executive | Provide accountable decisions, not a second source of truth. Owner: CEO/COO/CFO. | governed read models → KPI, risk, exception and forecast decisions. | decision latency, forecast accuracy, exception closure. | dashboards, scorecards, reports, portfolio, risk. | all workflows; AI CEO and Executive Analyst; Analytics platform. | High |
| Platform | Supply identity, governance and cross-cutting services. Owner: Platform Owner. | configuration, events, policy → secure reusable services. | availability, adoption, audit coverage, deployment frequency. | tenancy, identity, RBAC, audit, documents, notifications, search, API, integration. | all workflows; all agents; all contexts. | Foundation |
| AI | Improve decisions and automate bounded work under policy. Owner: AI Product/Governance. | approved context → suggestion, plan, classification or action proposal. | acceptance rate, accuracy, cost, latency, safety incidents. | agent registry, prompt/model governance, RAG, evaluation, approvals. | AI Review; Knowledge, Digital Twin, workflow engine. | Foundation |
| Knowledge | Govern reusable operational knowledge. Owner: Knowledge Manager. | documents, SOPs, lessons → retrieved evidence and governed answers. | freshness, retrieval quality, citation coverage. | documents, taxonomy, versioning, lessons, vector index. | AI Review; Document, Asset, Project. | High |

## Capability ownership rules

1. A capability owns its data, lifecycle rules, APIs and emitted events.
2. Dashboards, AI and portals consume published contracts; they do not become owners of transactional records.
3. Tenant, identity, configuration, audit, document, notification and integration services are shared platform capabilities, not convenience code inside a domain router.
4. Current overlapping modules (`approval_*`, notification/email variants, dashboards and AI routers) require consolidation decisions before new capability expansion.

