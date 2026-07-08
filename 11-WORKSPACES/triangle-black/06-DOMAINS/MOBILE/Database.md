# 12-MOBILE — Database Schema

No additional tables — mobile uses existing domain APIs. Offline cache uses IndexedDB on device.

## Sync Log (server-side)

### sync_log
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| user_id | UUID FK | — |
| device_id | VARCHAR(255) | — |
| action | ENUM | push, pull, conflict_resolved |
| records_synced | INTEGER | — |
| conflicts | INTEGER | — |
| started_at | TIMESTAMPTZ | — |
| completed_at | TIMESTAMPTZ | — |
| status | ENUM | in_progress, completed, failed |
