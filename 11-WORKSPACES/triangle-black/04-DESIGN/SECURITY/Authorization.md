# Authorization

## Role Hierarchy

```
super_admin > admin > manager > sales_rep / engineer > viewer
client_admin > client_user

Platform roles (super_admin): cross-tenant access
Tenant roles (admin..viewer): tenant-scoped access
Client roles (client_admin, client_user): own-company access
```

## Permissions Matrix

| Resource | super_admin | admin | manager | sales_rep | engineer | viewer | client_admin | client_user |
|----------|-------------|-------|---------|-----------|----------|--------|-------------|-------------|
| Users (CRUD) | All | Own tenant | Own tenant | — | — | — | Own company | — |
| Leads (CRUD) | All | All | All | Own + team | — | View | — | — |
| Opportunities (CRUD) | All | All | All | Own + team | — | View | — | — |
| Companies (CRUD) | All | All | All | View+Create | View | View | Own | View |
| Contacts (CRUD) | All | All | All | View+Create | View | View | Own | View |
| Quotations (CRUD) | All | All | All | Draft+Own | — | View | View approved | — |
| Quotations (Approve) | All | All | All | — | — | — | — | — |
| Contracts (CRUD) | All | All | Manage | — | — | View | View own | — |
| Projects (CRUD) | All | All | Manage | — | View+Update | View | View own | — |
| Milestones (CRUD) | All | All | All | — | Complete | View | View own | — |
| Surveys (CRUD) | All | All | All | — | Manage | View | — | — |
| Service Requests | — | All | All | — | Manage | — | All | Own |
| Documents (CRUD) | All | All | All | Own | Own | Download | Own | Own |
| Audit Logs | All | View | View | — | — | — | — | — |
| Reports (Executive) | All | All | Own | — | — | — | — | — |
| Tenant Config | All | Manage | — | — | — | — | — | — |
| Platform Admin | All | — | — | — | — | — | — | — |

## Permission Guards

```typescript
// @Roles decorator — checks user role
@Roles('admin', 'manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post()
async create(@Body() dto: CreateLeadDto) { ... }

// @Permissions decorator — checks specific permission
@Permissions('quotations:approve')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post(':id/approve')
async approve(@Param('id') id: string) { ... }

// OwnerGuard — checks resource ownership
@UseGuards(JwtAuthGuard, OwnerGuard)
@Patch(':id')
async update(@Param('id') id: string) { ... }
```

## Tenant Isolation

Every tenant-scoped query includes `WHERE tenant_id = {jwt.tenantId}` enforced by:

1. **Guard level**: `TenantGuard` extracts tenant_id from JWT
2. **Service level**: Prisma queries scoped via `switchSchema(tenantId)`
3. **DB level**: Schema-per-tenant prevents cross-tenant data access at the database level
