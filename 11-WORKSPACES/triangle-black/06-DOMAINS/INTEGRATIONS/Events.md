# 11-INTEGRATIONS — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| integration.sent | Data sent to external system | Integration log |
| integration.failed | External system error | Notification, retry |
| webhook.received | External webhook arrives | Dispatch to domain handler |
| e_invoice.submitted | E-Invoice submitted to ETA | Invoice status update |
