# 08-DOCUMENT-MANAGEMENT — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| document.uploaded | New document | NotificationService (project team) |
| document.versioned | New version uploaded | NotificationService (if subscribed) |
| document.shared | Share link created | EmailNotification (recipient) |
| document.deleted | Soft delete | AuditService |
