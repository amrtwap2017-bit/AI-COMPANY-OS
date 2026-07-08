# Consumption Matrix — Overview

> The Consumption Matrix defines which AI agents consume which documents, and which capabilities consume which documents. This is the core lookup table for context pack generation.

## How to Read the Matrix

### Document-Agent Matrix
Rows = document types (from Program 1). Columns = AI agent roles (from Program 2).

| Cell Value | Meaning |
|------------|---------|
| **C** | **Consumes** — The agent reads this document as primary input for its task |
| **R** | **References** — The agent refers to this document for context, not primary input |
| **P** | **Produces** — The agent generates/updates this document as output |
| *(blank)* | Not used by this agent |

### Document-Capability Matrix
Rows = capabilities (by domain). Columns = document types.

| Cell Value | Meaning |
|------------|---------|
| **P** | **Primary** — This document is a primary input for building the capability |
| **S** | **Secondary** — This document provides supporting context for the capability |
| *(blank)* | Not used by this capability |

## Priority Legend

| Priority | Meaning | Action |
|----------|---------|--------|
| **High** | Must be included in context pack | Agent reads in full before starting task |
| **Medium** | Should be included | Agent reads selectively based on subtask |
| **Low** | Optional reference | Agent refers only if needed |

## Document Type Index

| Code | Document Type | Source Location |
|------|--------------|-----------------|
| BOV | Business Overview | PHASE-06/{DOMAIN}/Business-Overview.md |
| BCP | Business Capabilities | PHASE-06/{DOMAIN}/Business-Capabilities.md |
| WKF | Workflows | PHASE-06/{DOMAIN}/Workflows.md |
| BRL | Business Rules | PHASE-06/{DOMAIN}/Business-Rules.md |
| ROL | Roles | PHASE-06/{DOMAIN}/Roles.md |
| PER | Permissions | PHASE-06/{DOMAIN}/Permissions.md |
| SCR | Screens | PHASE-06/{DOMAIN}/Screens.md |
| CMP | Components | PHASE-06/{DOMAIN}/Components.md |
| DBA | Database | PHASE-06/{DOMAIN}/Database.md |
| API | APIs | PHASE-06/{DOMAIN}/APIs.md |
| EVT | Events | PHASE-06/{DOMAIN}/Events.md |
| NTF | Notifications | PHASE-06/{DOMAIN}/Notifications.md |
| RPT | Reports | PHASE-06/{DOMAIN}/Reports.md |
| KPI | KPIs | PHASE-06/{DOMAIN}/KPIs.md |
| AIO | AI Opportunities | PHASE-06/{DOMAIN}/AI-Opportunities.md |
| TST | Testing | PHASE-06/{DOMAIN}/Testing.md |
| ACC | Acceptance Criteria | PHASE-06/{DOMAIN}/Acceptance-Criteria.md |

## Agent Role Index

| Agent | Role | Domain Focus |
|-------|------|-------------|
| BA | Business Analyst AI | Requirements, business rules, workflows |
| SA | Solution Architect AI | Architecture, APIs, events, database design |
| DA | Database Architect AI | Schema design, migration, data model |
| BE | Backend Lead AI | API implementation, business logic, events |
| FE | Frontend Lead AI | UI components, screens, API integration |
| QA | QA Director AI | Testing strategy, test cases, acceptance |
| DE | Documentation Engineer AI | All documentation, release notes |
| PO | Product Owner AI | Backlog, priorities, acceptance criteria |
