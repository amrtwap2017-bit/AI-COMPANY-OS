# 00-SHARED-KERNEL — Roles

| Role | Scope | Description |
|------|-------|-------------|
| SYSTEM_ADMIN | Global | Tenant management, system settings, audit access |
| TENANT_ADMIN | Tenant | Full tenant configuration, user management, master data |
| SUPER_ADMIN | Global | All SYSTEM_ADMIN + tenant creation, billing |
| AUDITOR | Tenant/Global | Read-only access to audit logs, reports |

These roles are seeded in Phase 5 infrastructure and available to all domains.
