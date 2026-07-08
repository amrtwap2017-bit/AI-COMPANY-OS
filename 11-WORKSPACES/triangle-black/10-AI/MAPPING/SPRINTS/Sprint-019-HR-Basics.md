# Sprint 019 — HR Basics — Employees and Organization

## Goal
Build the HR foundation with employee records, department/org structure, role management, and employee self-service for people operations.

## Capabilities
- HR-001 — Employee Management — from HR
- HR-002 — Organization Structure — from HR
- HR-003 — Employee Self-Service — from HR
- HR-004 — Document Management — from HR
- HR-005 — Reporting — from HR

## Context Pack Required
**Pack ID:** CP-HR-Employee
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/09-HR/Employee-Management.md` — Employee Management
- `../02-DOMAIN-DOCS/09-HR/Organization-Structure.md` — Organization Structure
- `../02-DOMAIN-DOCS/09-HR/Employee-Self-Service.md` — Employee Self-Service
- `../02-DOMAIN-DOCS/09-HR/HR-Reporting.md` — HR Reporting

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Data-Modeling.md` — Data Modeling
- `../04-STANDARDS/Security-Standards.md` — Security Standards

## Entities to Build
- Employee — HR
- EmploymentDetail — HR
- Department — HR
- Division — HR
- Position — HR
- OrgUnit — HR
- EmployeeDocument — HR
- EmployeeContact — HR
- EmployeeEducation — HR
- EmployeeCertification — HR
- HRReport — HR

## APIs to Build
- `/api/hr/employees` — GET/POST — Employee list and create
- `/api/hr/employees/{id}` — GET/PUT/DELETE — Employee detail
- `/api/hr/employees/{id}/employment` — GET/PUT — Employment details
- `/api/hr/employees/{id}/contacts` — GET/POST/PUT — Contacts
- `/api/hr/employees/{id}/education` — GET/POST — Education records
- `/api/hr/employees/{id}/certifications` — GET/POST — Certifications
- `/api/hr/employees/{id}/documents` — GET/POST — Documents
- `/api/hr/employees/{id}/documents/{dId}/download` — GET — Download doc
- `/api/hr/employees/search` — GET — Search employees
- `/api/hr/departments` — GET/POST — Department management
- `/api/hr/departments/{id}` — GET/PUT/DELETE — Department detail
- `/api/hr/departments/{id}/employees` — GET — Department employees
- `/api/hr/divisions` — GET/POST — Division management
- `/api/hr/positions` — GET/POST — Position management
- `/api/hr/org-chart` — GET — Organization chart data
- `/api/hr/reports/headcount` — GET — Headcount report
- `/api/hr/reports/turnover` — GET — Turnover report

## Screens to Build
- `/hr/employees` — Employee directory with search
- `/hr/employees/new` — Create employee record
- `/hr/employees/{id}` — Employee profile
- `/hr/employees/{id}/edit` — Edit employee
- `/hr/employees/{id}/employment` — Employment details
- `/hr/employees/{id}/education` — Education records
- `/hr/employees/{id}/certifications` — Certifications
- `/hr/employees/{id}/documents` — Document repository
- `/hr/departments` — Department list
- `/hr/departments/new` — Create department
- `/hr/departments/{id}` — Department detail
- `/hr/divisions` — Division management
- `/hr/positions` — Position management
- `/hr/org-chart` — Interactive org chart
- `/hr/reports` — HR reports dashboard

## AI Agents Assigned
- Backend Lead AI — Employee, department, org API
- Frontend Lead AI — Employee directory, profiles, org chart
- Database Architect AI — HR schema
- Compliance AI — HR data privacy and compliance rules

## Dependencies
- Sprint 000 — Setup (authentication for HR access)

## Quality Gates
- Employee records capture all mandatory employment data
- Org chart renders correctly for any org structure
- Employee search supports fuzzy matching
- Documents are access-controlled per HR privacy rules
- Headcount report aggregates correctly by department

## Estimated Deliverables
- 3 backend modules (employee, department, reports)
- 15 frontend pages
- 55 unit tests
- 7 integration tests
- 3 documents
