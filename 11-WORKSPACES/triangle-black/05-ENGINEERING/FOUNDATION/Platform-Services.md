# Phase 05 — Platform Services

> Shared platform services used by all business domains.

## Service Inventory

| Service | Purpose | Dependencies | Status |
|---------|---------|-------------|--------|
| NotificationService | In-app notifications + event-driven | Event bus | Built |
| AuditService | Event-sourced audit trail | Database | Built |
| FileService | File upload/ download/ management | DO Spaces (V2) / Local (V1) | Built |
| HealthService | Liveness + readiness endpoints | Database, services | Built |
| EventBus | In-process event publication/ subscription | — | Built |

## Notification Service

| Channel | V1 | V2 |
|---------|-----|-----|
| In-app | ✅ Notification bell + dropdown | Same |
| Email | Via SMTP integration | Same |
| WhatsApp | Via WhatsApp Business API | Same |

## Audit Service

All mutations are audited with:
- `actor_id` (who)
- `action` (what)
- `resource_type` + `resource_id` (which entity)
- `old_value` + `new_value` (before/after state)
- `timestamp` (when)
- `tenant_id` (which tenant)

See `03-PLATFORM-SERVICES/` for implementation details.
