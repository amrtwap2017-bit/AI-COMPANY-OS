# Master Mapping — Enterprise Delivery Mapping

> Complete index of all mappings between Program 1 and Program 2.

## Domains to Map

| ID | Domain | Program 1 Location | Capabilities |
|----|--------|-------------------|--------------|
| 00 | Shared Kernel | `PHASE-06/00-SHARED-KERNEL/` | Enums, value objects, shared events |
| 01 | Commercial | `PHASE-06/01-COMMERCIAL/` | 10 sub-modules, 36 capabilities |
| 02 | Project Delivery | `PHASE-06/02-PROJECT-DELIVERY/` | 8 sub-modules, 24+ capabilities |
| 03 | Procurement | `PHASE-06/03-PROCUREMENT/` | 5 sub-modules, 18+ capabilities |
| 04 | Supplier Management | `PHASE-06/04-SUPPLIER-MANAGEMENT/` | 5 sub-modules, 15+ capabilities |
| 05 | Inventory | `PHASE-06/05-INVENTORY/` | 4 sub-modules, 12+ capabilities |
| 06 | Financial Control | `PHASE-06/06-FINANCIAL-CONTROL/` | 5 sub-modules, 20+ capabilities |
| 07 | Maintenance | `PHASE-06/07-MAINTENANCE/` | 4 sub-modules, 12+ capabilities |
| 08 | Document Management | `PHASE-06/08-DOCUMENT-MANAGEMENT/` | 4 sub-modules, 12+ capabilities |
| 09 | Executive Intelligence | `PHASE-06/09-EXECUTIVE-INTELLIGENCE/` | 4 sub-modules, 12+ capabilities |
| 10 | AI Copilots | `PHASE-06/10-AI-COPILOTS/` | 5 sub-modules, 10+ capabilities |
| 11 | Integrations | `PHASE-06/11-INTEGRATIONS/` | 5 sub-modules, 10+ capabilities |
| 12 | Mobile | `PHASE-06/12-MOBILE/` | 4 sub-modules, 10+ capabilities |
| 13 | Human Resources | `PHASE-06/13-HUMAN-RESOURCES/` | 6 sub-modules, 20+ capabilities |

## Document Types to Map

| Type | Location | Example |
|------|----------|---------|
| Business Overview | `*/Business-Overview.md` | Domain value proposition |
| Business Capabilities | `*/Business-Capabilities.md` | Capability breakdown |
| Workflows | `*/Workflows.md` | End-to-end workflows |
| Business Rules | `*/Business-Rules.md` | Domain rules |
| Roles | `*/Roles.md` | Role definitions |
| Permissions | `*/Permissions.md` | Permission matrix |
| Screens | `*/Screens.md` | UI routes and descriptions |
| Components | `*/Components.md` | UI component list |
| Database | `*/Database.md` | Table specifications |
| APIs | `*/APIs.md` | API endpoint list |
| Events | `*/Events.md` | Domain events |
| Notifications | `*/Notifications.md` | Notification triggers |
| Reports | `*/Reports.md` | Report definitions |
| KPIs | `*/KPIs.md` | Key performance indicators |
| AI Opportunities | `*/AI-Opportunities.md` | AI enhancement paths |
| Testing | `*/Testing.md` | Test specifications |
| Acceptance Criteria | `*/Acceptance-Criteria.md` | Definition of done |

## Agent Consumption

| Agent | Consumes | Produces |
|-------|----------|----------|
| Business Analyst AI | Business Overview, Business Capabilities, Business Rules | Requirement, User Stories, Acceptance Criteria |
| Solution Architect AI | APIs, Database, Events, ADRs, Architecture Baseline | Architecture Spec, API Contracts |
| Database Architect AI | Database, Events, Architecture Spec | Prisma Schema, Migration Plan |
| Backend Lead AI | APIs, Business Rules, Database, Events, Notifications | NestJS Implementation |
| Frontend Lead AI | Screens, Components, APIs | Next.js Implementation |
| QA Director AI | Testing, Acceptance Criteria | Test Suite, Test Report |
| Documentation Engineer AI | All deliverables | Documentation, API Docs, Release Notes |

## Context Packet Structure

```
Context-Packet-{ID}/
├── manifest.json              ← Packet metadata
├── 01-requirement/            ← Requirement documents
├── 02-domain/                 ← Business domain documents
├── 03-architecture/           ← Architecture decisions
├── 04-database/               ← Schema documents
├── 05-api/                    ← API contracts
├── 06-ux/                     ← Screen and component specs
├── 07-rules/                  ← Business rules
├── 08-standards/              ← Relevant standards
└── 09-templates/              ← Output templates
```

## Consumption Rules

1. **Minimal load:** Each agent loads only documents relevant to its role and task
2. **Layered context:** Global → Domain → Module → Task → AC → Standards
3. **No duplicates:** A document is loaded once per context pack
4. **Version pinned:** Documents are referenced by version/date
5. **Cross-reference resolution:** References within documents are followed automatically
