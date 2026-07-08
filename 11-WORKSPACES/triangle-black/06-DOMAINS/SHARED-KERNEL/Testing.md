# 00-SHARED-KERNEL — Testing

## Unit Tests

| Module | Tests |
|--------|-------|
| Base entity | Tenant enforcement, soft delete filtering, audit field population |
| Event bus | Publish/subscribe, handler registration, error handling |
| Validation | Shared schema validation, custom validators |
| Notification dispatcher | Channel selection, delivery status |
| Master data | Default currency, tax rate seeding |

## Integration Tests

| Test | Scenario |
|------|----------|
| Tenant isolation | User in tenant A cannot access tenant B data |
| Soft delete cascade | Deleted parent blocks child reads |
| Audit trail | All CRUD operations logged correctly |
