# 12-MOBILE — Workflows

## Offline Sync Flow

```
[FIELD USER] Opens app (offline)
    ├── View cached data (projects, tasks)
    ├── Create new records (daily report, NCR, timesheet)
    └── Photos saved to local storage
    │
    ▼
Connectivity restored → Sync service triggered
    ├── Push local changes to server
    ├── Resolve conflicts (last-write-wins V1)
    └── Pull latest data from server
    │
    ▼
User notified: "Sync complete"
```
