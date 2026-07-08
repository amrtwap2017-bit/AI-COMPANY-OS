# 11-INTEGRATIONS — Database Schema

## integration_configs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| provider | VARCHAR(100) | eta, sendgrid, twilio, google_calendar |
| config | JSONB | Encrypted API keys, endpoints |
| is_active | BOOLEAN | — |
| last_sync_at | TIMESTAMPTZ | — |

## webhook_registrations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| name | VARCHAR(255) | — |
| url | VARCHAR(500) | — |
| events | TEXT[] | Event types to listen for |
| secret | VARCHAR(255) | HMAC secret |
| is_active | BOOLEAN | — |
| last_delivered_at | TIMESTAMPTZ | — |
| failure_count | INTEGER | — |

## integration_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| provider | VARCHAR(100) | — |
| direction | ENUM | inbound, outbound |
| status | ENUM | success, failed, pending |
| request | JSONB | — |
| response | JSONB | — |
| error | TEXT | — |
| executed_at | TIMESTAMPTZ | — |
