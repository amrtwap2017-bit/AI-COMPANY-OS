# 11 — Reporting Design

## Purpose
Define the reporting architecture: executive dashboard data sections, analytical queries, report generators, and export formats. All reports are pre-computed or live-query (no BI tool integration in V1).

## Documents
| File | Contents |
|------|----------|
| Executive-Dashboard.md | Decision-support data sections |
| CRM-Reports.md | Pipeline, win/loss, lead source, activity reports |
| Financial-Reports.md | Quotation summary, revenue forecast, margin analysis |
| Operational-Reports.md | Project status, milestone tracking, survey summary |
| Export-Formats.md | PDF, CSV export specifications |
| Scheduled-Reports.md | Daily/weekly/monthly automated reports |

## Dashboard Data Sections

| Section | Data Source | Refresh |
|---------|-------------|---------|
| Pipeline Summary | Live aggregation of opportunities | Real-time |
| Revenue Forecast | Quotations (approved) + Opportunities (proposal+) | Daily refresh |
| Active Projects | Projects (in_progress) with milestone status | Real-time |
| Recent Activities | Activities (last 7 days) | Real-time |
| Client Requests | Service requests (submitted, in_progress) | Real-time |
| Overdue Items | Expired quotations, overdue milestones | Every 15 min |
