# Context Pack: Executive Intelligence

**Pack ID:** CP-Executive-Dashboard
**Version:** 1.0
**Domain:** Executive Intelligence
**Sprint:** 018

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/08-Executive-Intelligence/Executive-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/08-Executive-Intelligence/Executive-Dashboard.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Reporting-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/KPI-Rules.md` | Backend Lead AI |
| 5 | KPI Definitions | `../02-DOMAIN-DOCS/08-Executive-Intelligence/KPI-Definitions.md` | Business Analyst AI |
| 6 | Reporting Framework | `../02-DOMAIN-DOCS/08-Executive-Intelligence/Reporting-Framework.md` | Solution Architect AI |
| 7 | Data Sources | `../02-DOMAIN-DOCS/08-Executive-Intelligence/Data-Sources.md` | Database Architect AI |
| 8 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 9 | UI Patterns | `../04-STANDARDS/UI-Patterns.md` | Frontend Lead AI |
| 10 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Dashboard | `exec_dashboards` | id, name, description, owner_id, layout, is_default, is_shared, created_at, updated_at | Database Architect AI |
| DashboardWidget | `exec_dashboard_widgets` | id, dashboard_id, widget_type, title, data_source, config, position, size, refresh_interval | Database Architect AI |
| KPI | `exec_kpis` | id, code, name, description, category, formula, unit, data_source_id, refresh_frequency, is_active | Database Architect AI |
| KPIValue | `exec_kpi_values` | id, kpi_id, value, target, period, recorded_at | Database Architect AI |
| KPIAlert | `exec_kpi_alerts` | id, kpi_id, threshold_type, threshold_value, is_enabled, last_triggered_at | Database Architect AI |
| Report | `exec_reports` | id, name, description, type, config, owner_id, is_scheduled, created_at | Database Architect AI |
| ReportSchedule | `exec_report_schedules` | id, report_id, frequency, recipients, last_run, next_run, is_active | Database Architect AI |
| DataSource | `exec_data_sources` | id, name, type, connection_config, query, refresh_strategy, is_active | Database Architect AI |
| DashboardFavorite | `exec_dashboard_favorites` | id, user_id, dashboard_id, sort_order, created_at | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/executive/dashboards` | GET/POST | Dashboard configuration | Backend Lead AI |
| `/api/executive/dashboards/{id}` | GET/PUT/DELETE | Dashboard detail | Backend Lead AI |
| `/api/executive/dashboards/{id}/widgets` | GET/POST/PUT | Widget config | Backend Lead AI |
| `/api/executive/dashboards/{id}/data` | GET | Dashboard data | Backend Lead AI |
| `/api/executive/kpis` | GET/POST | KPI definitions | Backend Lead AI |
| `/api/executive/kpis/{id}` | GET/PUT | KPI detail | Backend Lead AI |
| `/api/executive/kpis/{id}/values` | GET | KPI time-series values | Backend Lead AI |
| `/api/executive/kpis/{id}/alerts` | GET/POST | KPI alerts | Backend Lead AI |
| `/api/executive/reports` | GET/POST | Report definitions | Backend Lead AI |
| `/api/executive/reports/{id}` | GET/PUT/DELETE | Report detail | Backend Lead AI |
| `/api/executive/reports/{id}/generate` | POST | Generate report | Backend Lead AI |
| `/api/executive/reports/{id}/schedules` | GET/POST | Report schedules | Backend Lead AI |
| `/api/executive/reports/{id}/export` | GET | Export report | Backend Lead AI |
| `/api/executive/data-sources` | GET/POST | Data source config | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/executive/dashboard` | Main executive dashboard | Frontend Lead AI |
| `/executive/dashboard/new` | Create custom dashboard | Frontend Lead AI |
| `/executive/dashboard/{id}` | Dashboard detail | Frontend Lead AI |
| `/executive/dashboard/{id}/edit` | Edit dashboard layout | Frontend Lead AI |
| `/executive/kpis` | KPI library | Frontend Lead AI |
| `/executive/kpis/new` | Create KPI definition | Frontend Lead AI |
| `/executive/kpis/{id}` | KPI detail with trend chart | Frontend Lead AI |
| `/executive/kpis/{id}/alerts` | Alert configuration | Frontend Lead AI |
| `/executive/reports` | Report library | Frontend Lead AI |
| `/executive/reports/new` | Create report | Frontend Lead AI |
| `/executive/reports/{id}` | Report detail with preview | Frontend Lead AI |
| `/executive/reports/{id}/schedules` | Schedule management | Frontend Lead AI |
| `/executive/reports/{id}/view` | Report viewer | Frontend Lead AI |

### Dependencies
- All domain packs (KPI data sources)

### Output Checklist
- [ ] Backend module with 14+ endpoints
- [ ] Frontend pages with 13+ components
- [ ] Database migration (9 tables)
- [ ] Unit tests (50 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 12
- **Frontend files:** 16
- **Test files:** 20
- **Document files:** 4
- **Total sprint effort:** 20 days
