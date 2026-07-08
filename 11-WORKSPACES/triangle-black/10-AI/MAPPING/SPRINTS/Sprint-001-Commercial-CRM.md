# Sprint 001 — Commercial CRM — Lead Capture

## Goal
Build the lead capture system with scoring, qualification, and basic CRM functionality to begin revenue generation.

## Capabilities
- CRM-001 — Lead Capture — from Commercial
- CRM-002 — Lead Scoring — from Commercial
- CRM-003 — Lead Qualification — from Commercial
- CRM-004 — Basic CRM Dashboard — from Commercial

## Context Pack Required
**Pack ID:** CP-Authentication, CP-CRM-Leads
**Total Documents:** 6

### Domain Documents
- `../02-DOMAIN-DOCS/01-Commercial/Lead-Management.md` — Lead Management
- `../02-DOMAIN-DOCS/01-Commercial/Sales-Process.md` — Sales Process
- `../02-DOMAIN-DOCS/01-Commercial/CRM-Overview.md` — CRM Overview

### Standards
- `../04-STANDARDS/Coding-Standards.md` — Coding Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/UI-Patterns.md` — UI Patterns

## Entities to Build
- Lead — Commercial
- LeadScore — Commercial
- LeadSource — Commercial
- LeadStatus — Commercial
- Campaign — Commercial
- Contact — Commercial
- Company — Commercial

## APIs to Build
- `/api/leads` — GET/POST — List and create leads
- `/api/leads/{id}` — GET/PUT/DELETE — Lead detail CRUD
- `/api/leads/{id}/score` — POST — Trigger lead scoring
- `/api/leads/{id}/qualify` — POST — Qualify/disqualify lead
- `/api/leads/search` — GET — Search leads by criteria
- `/api/leads/import` — POST — Bulk import leads
- `/api/campaigns` — GET/POST — Campaign CRUD
- `/api/contacts` — GET/POST — Contact management
- `/api/contacts/{id}` — GET/PUT/DELETE — Contact detail
- `/api/companies` — GET/POST — Company management
- `/api/companies/{id}` — GET/PUT/DELETE — Company detail

## Screens to Build
- `/leads` — Lead list with filters and search
- `/leads/new` — Create lead form
- `/leads/{id}` — Lead detail with scoring and qualification
- `/leads/{id}/edit` — Edit lead
- `/campaigns` — Campaign list
- `/campaigns/new` — Create campaign
- `/contacts` — Contact directory
- `/contacts/new` — Create contact
- `/companies` — Company directory
- `/companies/new` — Create company
- `/dashboard/sales` — Sales dashboard (basic)

## AI Agents Assigned
- Backend Lead AI — Lead, contact, company, campaign APIs
- Frontend Lead AI — Lead management screens, sales dashboard
- Database Architect AI — Lead schema and scoring tables
- Business Analyst AI — Lead scoring rules configuration

## Dependencies
- Sprint 000 — Setup (authentication foundation)

## Quality Gates
- Lead capture form submits and persists correctly
- Lead scoring algorithm runs on save
- Lead qualification workflow completes (new → contacted → qualified/disqualified)
- Lead search returns filtered and paginated results
- Contact and company linkage works

## Estimated Deliverables
- 4 backend modules (lead, campaign, contact, company)
- 11 frontend pages
- 60 unit tests
- 8 integration tests
- 4 documents
