# 10-AI-COPILOTS — Database Schema

## agent_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| agent_name | VARCHAR(100) | lead_scoring, margin_validator, etc |
| event_type | VARCHAR(100) | lead.created, quotation.created |
| input | JSONB | Event payload |
| output | JSONB | Agent result |
| confidence | DECIMAL(5,2) | Nullable (for ML models) |
| executed_at | TIMESTAMPTZ | — |
| duration_ms | INTEGER | — |
| status | ENUM | success, failure, skipped |
| error | TEXT | Nullable |
