# Admin API Endpoints

## Users

### List Users

```
GET /api/v1/admin/users
Query: ?page=1&limit=20&role=manager,engineer&isActive=true
Response: 200 { data: User[], meta: PaginationMeta }
Permissions: admin+, super_admin
```

### Get User

```
GET /api/v1/admin/users/:id
Response: 200 { data: User }
Permissions: admin+, super_admin
```

### Create User

```
POST /api/v1/admin/users
Body: { email, password, firstName, lastName, role, tenantId }
Response: 201 { data: User }
Permissions: admin+, super_admin
```

### Update User

```
PATCH /api/v1/admin/users/:id
Body: { firstName?, lastName?, role?, isActive? }
Response: 200 { data: User }
Permissions: admin+, super_admin
```

### Delete User

```
DELETE /api/v1/admin/users/:id
Response: 204
Permissions: super_admin
Note: Cannot delete last admin
```

## Roles & Permissions

### List Roles

```
GET /api/v1/admin/roles
Response: 200 { data: Role[] }
Permissions: admin+, super_admin
```

### Get Role Permissions

```
GET /api/v1/admin/roles/:role/permissions
Response: 200 { data: { role, permissions: string[] } }
Permissions: admin+, super_admin
```

### Update Role Permissions

```
PUT /api/v1/admin/roles/:role/permissions
Body: { permissions: string[] }
Response: 200 { data: { role, permissions: string[] } }
Permissions: super_admin
```

## Audit Logs

### List Audit Logs

```
GET /api/v1/admin/audit-logs
Query: ?page=1&limit=20&tableName=quotations&recordId=uuid&changedBy=uuid&from=2026-01-01&to=2026-06-30
Response: 200 { data: AuditLog[], meta: PaginationMeta }
Permissions: admin+, super_admin
```

### Export Audit Logs

```
GET /api/v1/admin/audit-logs/export?from=&to=&format=csv
Response: 200 — text/csv
Permissions: admin+, super_admin
```

## Tenant Configuration

### Get Tenant Config

```
GET /api/v1/admin/tenant
Response: 200 { data: Tenant }
Permissions: admin+, super_admin
```

### Update Tenant Config

```
PUT /api/v1/admin/tenant
Body: { name?, currency?, timezone?, config? }
Response: 200 { data: Tenant }
Permissions: admin+, super_admin
```

### Deactivate Tenant

```
POST /api/v1/admin/tenant/deactivate
Body: { reason: string }
Response: 200 { data: Tenant }
Permissions: super_admin
```

## Notifications

### List User Notifications

```
GET /api/v1/admin/notifications
Query: ?isRead=false&page=1&limit=20
Response: 200 { data: Notification[], meta: PaginationMeta }
Permissions: authenticated
```

### Mark Notification Read

```
PATCH /api/v1/admin/notifications/:id/read
Body: {}
Response: 200 { data: Notification }
Permissions: owner only
```

### Mark All Notifications Read

```
POST /api/v1/admin/notifications/read-all
Body: {}
Response: 200 { data: { count: number } }
Permissions: authenticated
```
