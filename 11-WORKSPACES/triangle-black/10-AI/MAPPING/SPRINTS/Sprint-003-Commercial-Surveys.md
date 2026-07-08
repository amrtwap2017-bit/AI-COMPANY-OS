# Sprint 003 — Commercial Surveys — Site Assessments

## Goal
Build site survey and engineering assessment capabilities to enable accurate quotations for solar and electrical installations.

## Capabilities
- CRM-009 — Site Survey Scheduling — from Commercial
- CRM-010 — Engineering Assessment — from Commercial
- CRM-011 — Survey Templates — from Commercial
- CRM-012 — Photo Documentation — from Commercial

## Context Pack Required
**Pack ID:** CP-CRM-Leads
**Total Documents:** 4

### Domain Documents
- `../02-DOMAIN-DOCS/01-Commercial/Site-Surveys.md` — Site Surveys
- `../02-DOMAIN-DOCS/01-Commercial/Engineering-Assessment.md` — Engineering Assessment
- `../02-DOMAIN-DOCS/01-Commercial/Solar-Design.md` — Solar Design Basics

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Data-Modeling.md` — Data Modeling

## Entities to Build
- SiteSurvey — Commercial
- SurveyTemplate — Commercial
- SurveyQuestion — Commercial
- SurveyResponse — Commercial
- PhotoAttachment — Commercial
- EngineeringAssessment — Commercial
- AssessmentFinding — Commercial

## APIs to Build
- `/api/surveys` — GET/POST — List and create surveys
- `/api/surveys/{id}` — GET/PUT/DELETE — Survey detail
- `/api/surveys/{id}/schedule` — PUT — Schedule survey
- `/api/surveys/{id}/complete` — POST — Mark survey complete
- `/api/surveys/templates` — GET/POST — Survey template management
- `/api/surveys/templates/{id}` — GET/PUT/DELETE — Template detail
- `/api/surveys/{id}/photos` — POST/GET — Photo upload and list
- `/api/assessments` — GET/POST — Assessment CRUD
- `/api/assessments/{id}` — GET/PUT — Assessment detail
- `/api/assessments/{id}/findings` — GET/POST — Assessment findings

## Screens to Build
- `/surveys` — Survey list with status filters
- `/surveys/new` — Create survey from lead/opportunity
- `/surveys/{id}` — Survey detail with responses
- `/surveys/{id}/conduct` — Survey conduct form (mobile-friendly)
- `/surveys/templates` — Template management
- `/surveys/templates/new` — Create template
- `/surveys/{id}/photos` — Photo gallery
- `/assessments` — Assessment list
- `/assessments/{id}` — Assessment detail with findings

## AI Agents Assigned
- Backend Lead AI — Survey, template, assessment APIs
- Frontend Lead AI — Survey forms, photo gallery, assessment screens
- Database Architect AI — Survey response schema
- Mobile AI — Mobile-friendly survey conduct form

## Dependencies
- Sprint 001 — Commercial CRM (leads, contacts)

## Quality Gates
- Survey responses are linked to leads/opportunities
- Photo upload works with compression and thumbnails
- Engineering assessment findings are structured and reportable
- Survey templates support multiple question types
- Offline-capable survey form functions correctly

## Estimated Deliverables
- 3 backend modules (survey, assessment, attachment)
- 9 frontend pages
- 45 unit tests
- 6 integration tests
- 3 documents
