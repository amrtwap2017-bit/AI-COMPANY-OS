# Context Pack: Opportunity Management

**Pack ID:** CP-CRM-Opportunities
**Version:** 1.0
**Domain:** Commercial
**Sprint:** 002

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/01-Commercial/CRM-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/01-Commercial/Opportunity-Management.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Pipeline-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Opportunity-Rules.md` | Backend Lead AI |
| 5 | Pipeline Process | `../02-DOMAIN-DOCS/01-Commercial/Pipeline-Process.md` | Solution Architect AI |
| 6 | Forecasting | `../02-DOMAIN-DOCS/01-Commercial/Forecasting.md` | Business Analyst AI |
| 7 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 8 | Coding Standards | `../04-STANDARDS/Coding-Standards.md` | All Agents |
| 9 | UI Patterns | `../04-STANDARDS/UI-Patterns.md` | Frontend Lead AI |
| 10 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Opportunity | `crm_opportunities` | id, lead_id, company_id, name, value, stage_id, probability, expected_close_date, assigned_to, notes, created_at, updated_at | Database Architect AI |
| PipelineStage | `crm_pipeline_stages` | id, name, code, sequence, probability, is_active | Database Architect AI |
| PipelineHistory | `crm_pipeline_history` | id, opportunity_id, from_stage_id, to_stage_id, changed_by, reason, changed_at | Database Architect AI |
| Forecast | `crm_forecasts` | id, period, total_value, weighted_value, count, created_by, created_at | Database Architect AI |
| ForecastPeriod | `crm_forecast_periods` | id, name, start_date, end_date, is_closed | Database Architect AI |
| WinLossReason | `crm_win_loss_reasons` | id, name, type, is_active | Database Architect AI |
| Competitor | `crm_competitors` | id, name, market_share, notes | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/opportunities` | GET/POST | List and create opportunities | Backend Lead AI |
| `/api/opportunities/{id}` | GET/PUT/DELETE | Opportunity detail | Backend Lead AI |
| `/api/opportunities/{id}/stage` | PUT | Move stage in pipeline | Backend Lead AI |
| `/api/opportunities/{id}/stage/history` | GET | Stage change history | Backend Lead AI |
| `/api/opportunities/bulk-stage` | PUT | Bulk stage update | Backend Lead AI |
| `/api/pipeline/stages` | GET/POST | Stage configuration | Backend Lead AI |
| `/api/pipeline/stages/{id}` | PUT/DELETE | Stage config detail | Backend Lead AI |
| `/api/forecasts` | GET/POST | Forecast creation | Backend Lead AI |
| `/api/forecasts/{id}` | GET/PUT | Forecast detail | Backend Lead AI |
| `/api/forecasts/current` | GET | Current period forecast | Backend Lead AI |
| `/api/reports/pipeline` | GET | Pipeline report data | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/opportunities` | Opportunity list with filters | Frontend Lead AI |
| `/opportunities/kanban` | Pipeline kanban board (drag-and-drop) | Frontend Lead AI |
| `/opportunities/new` | Create opportunity | Frontend Lead AI |
| `/opportunities/{id}` | Opportunity detail with stage history | Frontend Lead AI |
| `/opportunities/{id}/edit` | Edit opportunity | Frontend Lead AI |
| `/forecasts` | Forecast overview | Frontend Lead AI |
| `/forecasts/new` | Create forecast | Frontend Lead AI |
| `/forecasts/{id}` | Forecast detail | Frontend Lead AI |
| `/reports/pipeline` | Pipeline analysis report | Frontend Lead AI |

### Dependencies
- CP-CRM-Leads

### Output Checklist
- [ ] Backend module with 11+ endpoints
- [ ] Frontend pages with 9+ components
- [ ] Database migration (7 tables)
- [ ] Unit tests (55 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 10
- **Frontend files:** 12
- **Test files:** 20
- **Document files:** 4
- **Total sprint effort:** 20 days
