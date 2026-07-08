# 00-SHARED-KERNEL — Workflows

## W1: Entity Lifecycle

```
[CREATE] → Audit (created_by, created_at)
    │
    ▼
[READ]   → Tenant filter (WHERE tenant_id = context)
    │
    ▼
[UPDATE] → Audit (updated_by, updated_at) → Publish entity.updated event
    │
    ▼
[DELETE] → Soft delete (deleted_at, deleted_by) → Publish entity.deleted event
    │
    ▼
[HARD DELETE] → Not allowed (blocked at repository level)
```

## W2: Event Propagation

```
[DOMAIN EVENT] (e.g., lead.converted)
    │
    ▼
EventBus.publish(event)
    │
    ├── Sync handlers (same transaction):
    │   └── AuditService.log(event)
    │
    └── Async handlers (background):
        ├── NotificationService.send(event)
        ├── AnalyticsService.track(event)
        └── Dependent domain handlers
```

## W3: Notification Dispatch

```
[TRIGGER] → Create Notification record
    │
    ▼
    ├── Notification.type = 'in-app'
    │   └── Push to user's notification queue
    │
    ├── Notification.type = 'email'
    │   └── Template → SendGrid/SMTP → Log delivery
    │
    └── Notification.type = 'both'
        └── Execute both channels
```
