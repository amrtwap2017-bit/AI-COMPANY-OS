# 07-MAINTENANCE — Permissions

| Permission | Action | Roles |
|------------|--------|-------|
| service:create | Create request | CLIENT_REQUESTER |
| service:assign | Assign | MAINTENANCE_MANAGER |
| service:execute | Resolve/execute | MAINTENANCE_ENGINEER |
| service:close | Close | MAINTENANCE_MANAGER, MAINTENANCE_ENGINEER |
| schedule:manage | CRUD | MAINTENANCE_MANAGER |
| warranty:approve | Approve/reject | MAINTENANCE_MANAGER |
