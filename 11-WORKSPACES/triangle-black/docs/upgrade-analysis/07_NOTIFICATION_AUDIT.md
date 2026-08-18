# Notification System Audit — August 2026

## Current Modules (10 total)

| Module | Purpose | Has Router | Has Model | Consumers |
|--------|---------|-----------|-----------|-----------|
| notifications | Core notification model | YES | YES | src/core/actions.py |
| notification_engine | Engine with repository | YES | YES | main.py |
| email_notifications | Email model + router | YES | YES | main.py |
| email_service | SMTP service | NO | NO | approval_chain |
| email_alert | Alert sender | YES | NO | approval_chain |
| sse_notifications | Server-sent events | YES | NO | main.py |
| system_notifications | System alerts | YES | NO | none found |
| webhook_notifications | Webhook delivery | YES | NO | none found |
| inventory_alerts | Inventory specific | YES | NO | none found |
| assets | Asset alerts (partial) | YES | YES | none found |

## Key Problem

notifications (model) and notification_engine (engine+router) are separate.
email_service and email_alert are separate email implementations.
No single canonical notification boundary.

## Consolidation Strategy

Target: ONE platform notification port with multiple adapters.
NotificationPort (interface)
InAppAdapter → notifications table
EmailAdapter → email_service
SSEAdapter → sse_notifications
WebhookAdapter → webhook_notifications

## Migration Order (safest first)

1. Keep all modules running — do NOT delete anything yet
2. Create src/core/notification_port.py as interface
3. Wire new code to use port — never import modules directly
4. Migrate consumers one at a time with telemetry
5. Only retire modules after zero consumer verification

## Risk

HIGH — notifications are cross-cutting. Incorrect migration causes silent failures.
Requires consumer telemetry before any module retirement.
