# 07-MAINTENANCE — API Endpoints

```
POST   /api/v1/maintenance/requests             — Create service request
GET    /api/v1/maintenance/requests             — List
GET    /api/v1/maintenance/requests/:id         — Detail
POST   /api/v1/maintenance/requests/:id/assign  — Assign engineer
POST   /api/v1/maintenance/requests/:id/resolve — Mark resolved
POST   /api/v1/maintenance/requests/:id/close   — Close with rating
GET    /api/v1/maintenance/schedules            — Maintenance schedule list
POST   /api/v1/maintenance/schedules            — Create schedule
POST   /api/v1/maintenance/schedules/:id/complete — Mark completed
POST   /api/v1/maintenance/warranty-claims      — Submit warranty claim
GET    /api/v1/maintenance/warranty-claims      — List claims
```
