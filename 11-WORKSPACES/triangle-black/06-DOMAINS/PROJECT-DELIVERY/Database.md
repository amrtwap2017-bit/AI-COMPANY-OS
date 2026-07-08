# 02-PROJECT-DELIVERY — Database Schema

## projects
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| contract_id | UUID FK | Created on contract.activated |
| name | VARCHAR(255) | — |
| code | VARCHAR(50) | PRJ-{YYYY}-{XXXXX} |
| status | ENUM | planning, active, on_hold, completed, closed |
| start_date | DATE | — |
| end_date | DATE | — |
| budget | DECIMAL(12,2) | — |
| contract_value | DECIMAL(12,2) | From contract |

## milestones
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| name | VARCHAR(255) | — |
| description | TEXT | — |
| planned_date | DATE | — |
| actual_date | DATE | Nullable |
| status | ENUM | pending, in_progress, completed, approved, skipped |
| approved_by | UUID FK | — |

## ncr (non-conformance reports)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| number | VARCHAR(50) | NCR-{YYYY}-{XXXXX} |
| category | ENUM | material, workmanship, design, safety |
| severity | ENUM | minor, major, critical |
| description | TEXT | — |
| status | ENUM | open, in_progress, resolved, verified, closed |
| assigned_to | UUID FK | — |
| resolution | TEXT | — |
| closed_at | TIMESTAMPTZ | — |

## daily_reports
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| report_date | DATE | — |
| weather | VARCHAR(100) | — |
| workforce_count | INTEGER | — |
| hours_worked | DECIMAL(5,1) | — |
| work_completed | TEXT | — |
| issues | JSONB | — |
| planned_next_day | TEXT | — |
| created_by | UUID FK | — |

## risks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| category | ENUM | safety, schedule, quality, financial, legal |
| likelihood | ENUM | low, medium, high |
| impact | ENUM | low, medium, high |
| risk_score | INTEGER | likelihood × impact |
| mitigation | TEXT | — |
| status | ENUM | identified, mitigated, closed |
