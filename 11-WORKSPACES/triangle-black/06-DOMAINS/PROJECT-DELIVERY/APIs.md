# 02-PROJECT-DELIVERY — API Endpoints

```
POST   /api/v1/projects                    — Create from contract
GET    /api/v1/projects                    — List
GET    /api/v1/projects/:id                — Detail with milestones
PATCH  /api/v1/projects/:id                — Update
POST   /api/v1/projects/:id/milestones    — Add milestone
PATCH  /api/v1/projects/:id/milestones/:m  — Update milestone
POST   /api/v1/projects/:id/milestones/:m/approve  — Approve milestone
GET    /api/v1/projects/:id/reports/daily  — Daily reports
POST   /api/v1/projects/:id/reports/daily  — Create daily report
GET    /api/v1/projects/:id/ncr            — NCR list
POST   /api/v1/projects/:id/ncr           — Create NCR
PATCH  /api/v1/projects/:id/ncr/:n         — Update NCR
GET    /api/v1/projects/:id/risks          — Risk register
POST   /api/v1/projects/:id/risks         — Create risk
POST   /api/v1/projects/:id/handover      — Initiate handover
GET    /api/v1/projects/:id/handover      — Handover status
GET    /api/v1/projects/:id/timeline      — Gantt data
POST   /api/v1/projects/:id/photos        — Upload progress photos
```
