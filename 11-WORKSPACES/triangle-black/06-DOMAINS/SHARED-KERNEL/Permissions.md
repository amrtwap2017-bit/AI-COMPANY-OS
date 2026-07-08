# 00-SHARED-KERNEL — Permissions

| Permission | Action | Resources | Roles |
|------------|--------|-----------|-------|
| tenant:manage | CRUD | Tenant | SYSTEM_ADMIN, SUPER_ADMIN |
| tenant:configure | Update | Tenant settings | TENANT_ADMIN |
| user:manage | CRUD | Users | TENANT_ADMIN |
| master-data:read | Read | Currencies, UOM, etc. | All authenticated |
| master-data:manage | CRUD | Master data | TENANT_ADMIN |
| audit:read | Read | Audit logs | AUDITOR, TENANT_ADMIN |
| notification:send | Send | Notifications | All authenticated |
