# 07-MAINTENANCE — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| service.created | Client submits request | NotificationService, auto-assignment |
| service.assigned | Engineer assigned | NotificationService (engineer) |
| service.resolved | Engineer marks resolved | NotificationService (client for sign-off) |
| service.closed | Request closed | Satisfaction survey trigger |
| warranty.claimed | Warranty submitted | NotificationService (manager review) |
| maintenance.due | Schedule date reached | NotificationService (maintenance team) |
