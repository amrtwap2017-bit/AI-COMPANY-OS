# 00-SHARED-KERNEL — API Endpoints

## Master Data
```
GET    /api/v1/master-data/currencies        — List currencies
GET    /api/v1/master-data/uom               — List units of measure
GET    /api/v1/master-data/tax-rates         — List tax rates
GET    /api/v1/master-data/countries         — List countries
PUT    /api/v1/master-data/currencies/:code  — Update rate
```

## Notifications
```
GET    /api/v1/notifications                 — List user notifications
PATCH  /api/v1/notifications/:id/read        — Mark as read
POST   /api/v1/notifications/read-all        — Mark all as read
GET    /api/v1/notifications/unread-count    — Unread count
```

## Audit
```
GET    /api/v1/audit                         — Query audit log
GET    /api/v1/audit/:entity-type/:id        — Entity audit trail
```

## System
```
GET    /api/v1/system/health                 — Health check
GET    /api/v1/system/info                   — System info
```
