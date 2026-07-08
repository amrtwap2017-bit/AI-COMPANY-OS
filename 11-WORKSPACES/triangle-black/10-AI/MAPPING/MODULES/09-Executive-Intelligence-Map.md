# Executive Intelligence Module Map

## Scope
Executive dashboard with KPIs and widgets, KPI definition and tracking, decision support with simulations and recommendations, ad-hoc report builder, and intelligent alert management.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Executive Dashboard | 5 | 220 |
| KPI Management | 6 | 260 |
| Decision Support | 5 | 240 |
| Report Builder | 5 | 210 |
| Alert Management | 5 | 190 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/09-Executive-Intelligence-Domain.md` — Full executive intelligence domain spec
- `03-FEATURES/24-Executive-Dashboard.md` — Executive dashboard feature spec
- `03-FEATURES/25-KPI-Management.md` — KPI management feature spec
- `03-FEATURES/26-Reporting.md` — Reporting feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 5 |
| Frontend pages | Next.js pages | 12 |
| Database tables | Prisma models | 10 |
| API endpoints | REST routes | 30 |
| Test files | spec/test files | 36 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| KPI | KPI | KPI definition with formula |
| KPITarget | KPITarget | Target value for KPI |
| DashboardWidget | DashboardWidget | Configurable dashboard widget |
| DashboardLayout | DashboardLayout | User dashboard layout |
| Simulation | Simulation | What-if simulation record |
| Recommendation | Recommendation | AI-generated recommendation |
| Report | Report | Ad-hoc report definition |
| ReportSchedule | ReportSchedule | Scheduled report configuration |
| AlertRule | AlertRule | Alert threshold and condition |
| AlertInstance | AlertInstance | Triggered alert instance |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /executive/dashboard | GET | Get executive dashboard data |
| /executive/kpis | GET/POST | List and create KPIs |
| /executive/kpis/:id/calculate | POST | Calculate KPI value |
| /executive/simulations | GET/POST | List and create simulations |
| /executive/simulations/:id/run | POST | Run simulation |
| /executive/recommendations | GET | Get recommendations |
| /executive/reports | GET/POST | List and create reports |
| /executive/reports/:id/schedule | POST | Schedule report |
| /executive/reports/:id/export | POST | Export report |
| /executive/alerts | GET/POST | List and create alert rules |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /executive/dashboard | ExecutiveDashboardView, KPIWidgetView | Executive overview |
| /executive/kpis | KPIDefinitionForm, KPIDetailView | KPI management |
| /executive/simulations | SimulationForm, ScenarioComparisonView | Decision support |
| /executive/reports | ReportBuilderView, ReportList | Report creation |
| /executive/alerts | AlertRuleForm, AlertListView | Alert management |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| ExecutiveInsightAI | Generate executive insights |
| KPIInsightAI | Analyze KPI trends and anomalies |
| RecommendationEngineAI | Generate strategic recommendations |
| WhatIfSimulationAI | Run scenario simulations |
| ReportGenerationAI | Auto-generate natural language reports |
| AlertPredictionAI | Predict alerts before threshold breach |

## Estimated Sprint Allocation: 3 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- All domains — Strong (KPI data sourced from all modules)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for dashboard rendering
- Prisma — Schema validation
- k6 — Performance testing (dashboard load)
