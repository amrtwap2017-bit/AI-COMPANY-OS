# Sprint 008 — Project Execution — Engineering and Quality

## Goal
Build project execution capabilities with engineering workflows, quality control, NCR management, and daily reporting to manage active projects.

## Capabilities
- PROJ-006 — Engineering Workbench — from Project Delivery
- PROJ-007 — Quality Control — from Project Delivery
- PROJ-008 — NCR Management — from Project Delivery
- PROJ-009 — Daily Reports — from Project Delivery
- PROJ-010 — Site Diary — from Project Delivery

## Context Pack Required
**Pack ID:** CP-Project-Delivery
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/02-Project-Delivery/Engineering-Execution.md` — Engineering Execution
- `../02-DOMAIN-DOCS/02-Project-Delivery/Quality-Control.md` — Quality Control
- `../02-DOMAIN-DOCS/02-Project-Delivery/NCR-Process.md` — NCR Process
- `../02-DOMAIN-DOCS/02-Project-Delivery/Daily-Reporting.md` — Daily Reporting

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Quality-Standards.md` — Quality Standards

## Entities to Build
- EngineeringTask — Project Delivery
- QualityChecklist — Project Delivery
- QualityCheckResult — Project Delivery
- NonConformanceReport — Project Delivery
- NCRAction — Project Delivery
- DailyReport — Project Delivery
- SiteDiaryEntry — Project Delivery
- PhotoLog — Project Delivery

## APIs to Build
- `/api/projects/{id}/engineering-tasks` — GET/POST — Engineering tasks
- `/api/projects/{id}/engineering-tasks/{tId}` — GET/PUT — Task detail
- `/api/projects/{id}/quality/checklists` — GET/POST — Quality checklists
- `/api/projects/{id}/quality/checklists/{cId}/results` — POST — Submit results
- `/api/projects/{id}/ncr` — GET/POST — NCR management
- `/api/projects/{id}/ncr/{nId}` — GET/PUT — NCR detail
- `/api/projects/{id}/ncr/{nId}/actions` — GET/POST — NCR actions
- `/api/projects/{id}/ncr/{nId}/actions/{aId}/complete` — POST — Complete action
- `/api/projects/{id}/daily-reports` — GET/POST — Daily reports
- `/api/projects/{id}/daily-reports/{dId}` — GET/PUT — Report detail
- `/api/projects/{id}/site-diary` — GET/POST — Site diary entries
- `/api/projects/{id}/photos` — POST/GET — Photo log upload and list

## Screens to Build
- `/projects/{id}/engineering` — Engineering task list
- `/projects/{id}/engineering/tasks/{tId}` — Task detail
- `/projects/{id}/quality` — Quality control overview
- `/projects/{id}/quality/checklists/new` — New checklist
- `/projects/{id}/quality/checklists/{cId}` — Conduct checklist
- `/projects/{id}/ncr` — NCR list
- `/projects/{id}/ncr/new` — Create NCR
- `/projects/{id}/ncr/{nId}` — NCR detail with actions
- `/projects/{id}/daily-reports` — Daily reports list
- `/projects/{id}/daily-reports/new` — Create daily report
- `/projects/{id}/daily-reports/{dId}` — Report detail
- `/projects/{id}/site-diary` — Site diary timeline
- `/projects/{id}/photos` — Photo gallery

## AI Agents Assigned
- Backend Lead AI — Engineering, quality, NCR, reporting APIs
- Frontend Lead AI — Execution screens, mobile-friendly forms
- Database Architect AI — Quality and NCR schema
- Quality AI — NCR workflow automation and escalation rules

## Dependencies
- Sprint 007 — Project Basics (project structure, milestones)

## Quality Gates
- Quality checklists can be completed against milestones
- NCR workflow enforces root cause analysis and corrective action
- Daily reports capture work progress, issues, and safety items
- Site diary entries are timestamped and geotagged
- Photo log supports bulk upload with categorization

## Estimated Deliverables
- 3 backend modules (engineering, quality, reporting)
- 13 frontend pages
- 65 unit tests
- 8 integration tests
- 4 documents
