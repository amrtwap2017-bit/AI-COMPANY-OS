# 07-MAINTENANCE — Database Schema

## service_requests
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| client_contact_id | UUID FK | — |
| number | VARCHAR(50) | SR-{YYYY}-{XXXXX} |
| category | ENUM | electrical, mechanical, plumbing, structural, other |
| priority | ENUM | low, medium, high, critical |
| status | ENUM | submitted, assigned, in_progress, resolved, closed |
| description | TEXT | — |
| assigned_to | UUID FK | Engineer |
| sla_response_hrs | INTEGER | Target response time |
| sla_resolution_hrs | INTEGER | Target resolution time |
| responded_at | TIMESTAMPTZ | — |
| resolved_at | TIMESTAMPTZ | — |
| closed_at | TIMESTAMPTZ | — |
| client_rating | INTEGER | 1-5 satisfaction |

## maintenance_schedules
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| title | VARCHAR(255) | — |
| frequency | ENUM | weekly, monthly, quarterly, annually |
| last_done | DATE | — |
| next_due | DATE | — |
| assigned_team | VARCHAR(255) | — |
| checklist | JSONB | Task list |

## warranty_claims
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| service_request_id | UUID FK | — |
| claim_number | VARCHAR(50) | WC-{YYYY}-{XXXXX} |
| status | ENUM | submitted, under_review, approved, rejected, closed |
| cost | DECIMAL(12,2) | — |
| covered | BOOLEAN | — |
| notes | TEXT | — |
