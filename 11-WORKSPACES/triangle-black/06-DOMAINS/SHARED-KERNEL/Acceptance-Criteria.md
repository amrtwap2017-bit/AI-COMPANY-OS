# 00-SHARED-KERNEL — Acceptance Criteria

- [x] All entities have tenant_id, created_at, updated_at, deleted_at
- [x] Soft-deleted records excluded from queries by default
- [x] Master data seeded: currencies (EGP, USD), UOM, tax rates (14%), countries (Egypt)
- [x] Event bus can publish and subscribe to events
- [x] In-app notifications deliver to user's notification queue
- [x] Audit trail records all entity changes with diff
- [x] Reports engine can generate PDF from Handlebars template
- [x] API responds with consistent error format
- [x] Validation errors return structured response
