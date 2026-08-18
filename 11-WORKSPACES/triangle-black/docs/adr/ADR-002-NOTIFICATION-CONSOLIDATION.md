# ADR-002: Notification System Consolidation

## Status
PROPOSED

## Context

Triangle Black has 10 notification/email modules with overlapping responsibilities.
notifications, notification_engine, email_notifications, email_service, email_alert,
sse_notifications, system_notifications, webhook_notifications, inventory_alerts.

This creates inconsistent user experience and maintenance complexity.

## Decision

Establish src/core/notification_port.py as a protocol interface.
All new notification calls go through the port.
Existing modules remain operational until all consumers are migrated.
No module is retired until consumer count reaches zero.

## Migration Sequence

1. Create NotificationPort protocol
2. Create InAppNotificationAdapter wrapping notifications module
3. Migrate new features to use port only
4. Add telemetry to measure existing module usage
5. Migrate consumers one at a time
6. Retire each module only after telemetry confirms zero usage

## Consequences

Positive:
- Single interface for all notification concerns
- Easy to add new channels (push, SMS)
- Consistent tenant-scoped notifications

Negative:
- Migration takes multiple sprints
- Dual-path period while consumers migrate

## Rollback

Remove port and revert to direct module imports.
All existing modules remain intact throughout migration.
