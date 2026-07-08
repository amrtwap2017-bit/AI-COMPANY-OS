# 10-AI-COPILOTS — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| agent.executed | Agent completes | NotificationService (if action needed) |
| agent.failed | Agent error | NotificationService (AI admin) |
| suggestion.created | Agent suggests action | NotificationService (operator) |
