# 09-EXECUTIVE-INTELLIGENCE — API Endpoints

```
GET    /api/v1/bi/executive-dashboard       — Executive overview KPIs
GET    /api/v1/bi/sales-pipeline            — Pipeline funnel data
GET    /api/v1/bi/financial                 — Revenue, AR, AP summary
GET    /api/v1/bi/project-portfolio         — Project status aggregation
GET    /api/v1/bi/kpi                       — All KPI values by domain
GET    /api/v1/bi/kpi/:domain               — KPI values for specific domain
GET    /api/v1/bi/trends/:metric/:period    — Trend data (monthly/quarterly)
POST   /api/v1/bi/reports/custom            — Custom report query
POST   /api/v1/bi/reports/schedule          — Schedule report delivery
GET    /api/v1/bi/reports/scheduled         — List scheduled reports
POST   /api/v1/bi/export                    — Export data to CSV/PDF/Excel
```
