# Sprint 007 — Project Basics — Creation and Planning

## Goal
Build the project management foundation with project creation, milestone planning, team assignment, and workflow templates to execute contracted work.

## Capabilities
- PROJ-001 — Project Creation — from Project Delivery
- PROJ-002 — Milestone Planning — from Project Delivery
- PROJ-003 — Team Assignment — from Project Delivery
- PROJ-004 — Project Templates — from Project Delivery
- PROJ-005 — Project Dashboard — from Project Delivery

## Context Pack Required
**Pack ID:** CP-Project-Delivery
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/02-Project-Delivery/Project-Initiation.md` — Project Initiation
- `../02-DOMAIN-DOCS/02-Project-Delivery/Milestone-Planning.md` — Milestone Planning
- `../02-DOMAIN-DOCS/02-Project-Delivery/Resource-Management.md` — Resource Management
- `../02-DOMAIN-DOCS/02-Project-Delivery/Project-Templates.md` — Project Templates

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Data-Modeling.md` — Data Modeling

## Entities to Build
- Project — Project Delivery
- ProjectMilestone — Project Delivery
- ProjectTask — Project Delivery
- ProjectTeam — Project Delivery
- TeamMember — Project Delivery
- ProjectTemplate — Project Delivery
- ProjectDocument — Project Delivery
- ProjectStatusReport — Project Delivery

## APIs to Build
- `/api/projects` — GET/POST — Project list and create
- `/api/projects/{id}` — GET/PUT/DELETE — Project detail
- `/api/projects/{id}/milestones` — GET/POST — Milestone management
- `/api/projects/{id}/milestones/{mId}` — GET/PUT — Milestone detail
- `/api/projects/{id}/tasks` — GET/POST — Task management
- `/api/projects/{id}/tasks/{tId}` — GET/PUT/DELETE — Task detail
- `/api/projects/{id}/team` — GET/POST/PUT — Team assignment
- `/api/projects/{id}/team/{userId}` — DELETE — Remove team member
- `/api/projects/templates` — GET/POST — Template management
- `/api/projects/templates/{id}` — GET/PUT/DELETE — Template detail
- `/api/projects/{id}/status-report` — GET/POST — Status reports
- `/api/projects/dashboard` — GET — Project dashboard data

## Screens to Build
- `/projects` — Project list with filters and search
- `/projects/new` — Create project from contract
- `/projects/{id}` — Project detail/overview
- `/projects/{id}/edit` — Edit project
- `/projects/{id}/milestones` — Milestone timeline
- `/projects/{id}/milestones/new` — Add milestone
- `/projects/{id}/tasks` — Task board
- `/projects/{id}/tasks/new` — Create task
- `/projects/{id}/team` — Team management
- `/projects/templates` — Template library
- `/projects/templates/new` — Create template
- `/dashboard/projects` — Project dashboard

## AI Agents Assigned
- Backend Lead AI — Project, milestone, task, team APIs
- Frontend Lead AI — Project management screens, dashboard
- Database Architect AI — Project and milestone schema
- Business Analyst AI — Project template configuration

## Dependencies
- Sprint 005 — Commercial Contracts (contract activation triggers project)

## Quality Gates
- Project creation from contract auto-populates milestones
- Team assignment validates resource availability
- Milestone dates cascade to dependent tasks
- Project dashboard shows accurate status across all projects
- Template-based project creation works correctly

## Estimated Deliverables
- 3 backend modules (project, milestone, team)
- 12 frontend pages
- 55 unit tests
- 7 integration tests
- 4 documents
