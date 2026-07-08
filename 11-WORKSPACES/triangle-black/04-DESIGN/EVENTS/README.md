# 09 — Business Event Design

## Purpose
Catalog all business events that drive notifications, audit logs, and state transitions. No event bus middleware in V1 (no Kafka, no Redis). Events fire as synchronous NestJS event handlers or in-process queue.

## Documents
| File | Contents |
|------|----------|
| Event-Catalog.md | All business events, triggers, handlers, payloads |
| Notification-Events.md | Events that trigger user notifications |
| Audit-Events.md | Events that trigger audit log writes |
| State-Transition-Events.md | Events that trigger automatic state changes |
