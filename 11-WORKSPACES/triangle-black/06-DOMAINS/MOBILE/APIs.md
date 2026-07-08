# 12-MOBILE — API Endpoints

Mobile uses existing domain APIs. Additional endpoints:

```
POST   /api/v1/mobile/sync/push            — Push offline changes
POST   /api/v1/mobile/sync/pull            — Pull latest data for offline cache
GET    /api/v1/mobile/sync/status          — Sync status and pending count
POST   /api/v1/mobile/photo/upload         — Upload photo with geo-tag
GET    /api/v1/mobile/context              — Get user context (projects, tasks)
```
