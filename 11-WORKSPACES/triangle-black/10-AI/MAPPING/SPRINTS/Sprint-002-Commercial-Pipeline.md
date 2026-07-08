# Sprint 002 — Commercial Pipeline — Opportunity Management

## Goal
Build opportunity management with pipeline kanban, stage tracking, and forecasting to convert leads into revenue.

## Capabilities
- CRM-005 — Opportunity Management — from Commercial
- CRM-006 — Pipeline Kanban — from Commercial
- CRM-007 — Sales Forecasting — from Commercial
- CRM-008 — Stage Automation — from Commercial

## Context Pack Required
**Pack ID:** CP-CRM-Opportunities
**Total Documents:** 4

### Domain Documents
- `../02-DOMAIN-DOCS/01-Commercial/Opportunity-Management.md` — Opportunity Management
- `../02-DOMAIN-DOCS/01-Commercial/Pipeline-Process.md` — Pipeline Process
- `../02-DOMAIN-DOCS/01-Commercial/Forecasting.md` — Forecasting

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/UI-Patterns.md` — UI Patterns

## Entities to Build
- Opportunity — Commercial
- PipelineStage — Commercial
- PipelineHistory — Commercial
- Forecast — Commercial
- ForecastPeriod — Commercial
- WinLossReason — Commercial
- Competitor — Commercial

## APIs to Build
- `/api/opportunities` — GET/POST — List and create opportunities
- `/api/opportunities/{id}` — GET/PUT/DELETE — Opportunity detail
- `/api/opportunities/{id}/stage` — PUT — Move stage in pipeline
- `/api/opportunities/{id}/stage/history` — GET — Stage change history
- `/api/opportunities/bulk-stage` — PUT — Bulk stage update
- `/api/pipeline/stages` — GET/POST — Pipeline stage configuration
- `/api/pipeline/stages/{id}` — PUT/DELETE — Stage configuration
- `/api/forecasts` — GET/POST — Forecast creation
- `/api/forecasts/{id}` — GET/PUT — Forecast detail
- `/api/forecasts/current` — GET — Current period forecast
- `/api/reports/pipeline` — GET — Pipeline report data

## Screens to Build
- `/opportunities` — Opportunity list with filters
- `/opportunities/kanban` — Pipeline kanban board (drag-and-drop)
- `/opportunities/new` — Create opportunity
- `/opportunities/{id}` — Opportunity detail with stage history
- `/opportunities/{id}/edit` — Edit opportunity
- `/forecasts` — Forecast overview
- `/forecasts/new` — Create forecast
- `/forecasts/{id}` — Forecast detail
- `/reports/pipeline` — Pipeline analysis report

## AI Agents Assigned
- Backend Lead AI — Opportunity, pipeline, forecast APIs
- Frontend Lead AI — Kanban board, opportunity forms, forecast views
- Database Architect AI — Pipeline stage schema
- Business Analyst AI — Forecasting rules and stage automation logic

## Dependencies
- Sprint 001 — Commercial CRM (leads, contacts, companies)

## Quality Gates
- Kanban board supports drag-and-drop stage transitions
- Stage transition rules enforce valid moves
- Forecast calculation aggregates pipeline values correctly
- Pipeline history is recorded for every stage change
- Win/loss reasons are captured on close

## Estimated Deliverables
- 3 backend modules (opportunity, pipeline, forecast)
- 9 frontend pages
- 55 unit tests
- 7 integration tests
- 3 documents
