# Document-Agent Consumption Matrix

> Rows: Document types | Columns: AI Agent roles | Cells: C = Consumes, R = References, P = Produces

| Document Type | BA | SA | DA | BE | FE | QA | DE | PO |
|---------------|----|----|----|----|----|----|----|----|
| Business Overview | C | C | | C | C | | | C |
| Business Capabilities | C | C | | C | C | | | C |
| Workflows | C | C | | C | C | C | R | C |
| Business Rules | C | C | | C | R | C | | C |
| Roles | C | R | | R | R | | | C |
| Permissions | | C | | R | C | | | |
| Screens | | R | | | C | | | R |
| Components | | R | | | C | | | |
| Database | R | C | C | C | R | | R | |
| APIs | R | C | R | C | C | | R | |
| Events | | C | R | C | R | | R | |
| Notifications | R | R | | C | R | | | |
| Reports | R | | R | R | R | | C | R |
| KPIs | R | | | R | R | | R | C |
| AI Opportunities | C | R | | R | | | | C |
| Testing | R | R | R | R | R | C | R | R |
| Acceptance Criteria | C | R | R | R | R | C | R | P |

## Agent Consumption Details

### Business Analyst AI (BA)
- **Primary documents:** Business Overview, Business Capabilities, Workflows, Business Rules, Roles, AI Opportunities, Acceptance Criteria
- **Produces:** Requirement documents, user stories, acceptance criteria refinement

### Solution Architect AI (SA)
- **Primary documents:** Business Overview, Business Capabilities, Workflows, Business Rules, Database, APIs, Events
- **Produces:** Architecture spec, ADRs, API contracts, C4 diagrams

### Database Architect AI (DA)
- **Primary documents:** Database, Events
- **References:** Business Rules, APIs, Reports, Testing, Acceptance Criteria
- **Produces:** Prisma schema, migration plan, seed data scripts

### Backend Lead AI (BE)
- **Primary documents:** Business Overview, Business Capabilities, Workflows, Business Rules, Database, APIs, Events, Notifications, AI Opportunities
- **Produces:** NestJS modules, services, controllers, event handlers, tests

### Frontend Lead AI (FE)
- **Primary documents:** Business Overview, Business Capabilities, Workflows, Screens, Components, APIs, Permissions
- **Produces:** Next.js pages, components, forms, dashboard, tables

### QA Director AI (QA)
- **Primary documents:** Workflows, Business Rules, Testing, Acceptance Criteria
- **References:** Screens, APIs, Database, Notifications
- **Produces:** Test plans, test suites, automated tests, test reports

### Documentation Engineer AI (DE)
- **Primary documents:** Reports, KPIs, APIs, Database, Events, Acceptance Criteria
- **References:** Workflows, all domain docs
- **Produces:** User documentation, API docs, release notes, training materials

### Product Owner AI (PO)
- **Primary documents:** Business Overview, Business Capabilities, Workflows, Business Rules, Roles, KPIs, AI Opportunities, Reports
- **Produces:** Acceptance Criteria, backlog items, sprint goals
