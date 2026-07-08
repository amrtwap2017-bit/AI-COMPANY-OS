# Authorization Architecture

## Overview

Role-Based Access Control (RBAC) with explicit permission matrix. Every API request is authorized at three levels: authentication (is the user who they say they are), authorization (does the user have the required permission), and tenant isolation (does the user belong to this tenant).

## Authorization Layers

```
Request ──► 1. AuthGuard ──► 2. TenantGuard ──► 3. PermissionGuard ──► Handler
                 │                │                     │
            Is JWT valid?    Tenant matches     User has permission?
            User exists?     user's tenant       Action on resource?
```

## Role Hierarchy

```
                    ┌──────────────┐
                    │ super_admin  │  (Platform-wide, all tenants)
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  admin       │  (Tenant-wide, all modules)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌────┴────┐ ┌────┴─────┐
        │  manager   │ │ engineer │ │  viewer   │
        └───────────┘ └─────────┘ └──────────┘
              │            │            │
        ┌─────┴─────┐     │            │
        │  staff     │     │            │
        └───────────┘     │            │
              ┌───────────┘            │
              │                        │
        ┌─────┴─────┐                 │
        │  client    │◄────────────────┘
        └───────────┘
```

## Permission Matrix

| Module | super_admin | admin | manager | engineer | staff | viewer | client |
|---------|-------------|-------|---------|----------|-------|--------|--------|
| **Tenants** | CRUD | Read | - | - | - | - | - |
| **Users** | CRUD | CRUD (tenant) | Read | Read | Read | Read | - |
| **Roles** | CRUD | Read | - | - | - | - | - |
| **Properties** | CRUD | CRUD | CRUD | CRUD | Read | Read | Read |
| **Reservations** | CRUD | CRUD | CRUD | Read | Read | Read | Read (own) |
| **Quotations** | CRUD | CRUD | CRUD | Create | - | Read | Read (own) |
| **Contracts** | CRUD | CRUD | CRUD | Create | - | Read | Read (own) |
| **Projects** | CRUD | CRUD | CRUD | CRUD | Read | Read | Read (own) |
| **Documents** | CRUD | CRUD | CRUD | Create | Create | Read | Read (own) |
| **Reports** | CRUD | CRUD | Create | Create | - | Read | Read (own) |
| **Audit Logs** | CRUD | Read | Read | - | - | - | - |
| **Settings** | CRUD | CRUD | Read (some) | - | - | - | - |

## Implementation

### Permission Definition

```typescript
// src/iam/permissions.ts
export enum Permission {
  // Tenant management
  TENANT_CREATE = 'tenant:create',
  TENANT_READ = 'tenant:read',
  TENANT_UPDATE = 'tenant:update',
  TENANT_DELETE = 'tenant:delete',

  // User management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Properties
  PROPERTY_CREATE = 'property:create',
  PROPERTY_READ = 'property:read',
  PROPERTY_UPDATE = 'property:update',
  PROPERTY_DELETE = 'property:delete',

  // Quotations
  QUOTATION_CREATE = 'quotation:create',
  QUOTATION_READ = 'quotation:read',
  QUOTATION_UPDATE = 'quotation:update',
  QUOTATION_DELETE = 'quotation:delete',
  QUOTATION_APPROVE = 'quotation:approve',

  // Projects
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',

  // Reports
  REPORT_CREATE = 'report:create',
  REPORT_READ = 'report:read',

  // Audit
  AUDIT_READ = 'audit:read',
  AUDIT_EXPORT = 'audit:export',

  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
}
```

### Role-Permission Mapping

```typescript
// src/iam/roles.ts
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: Object.values(Permission),

  admin: [
    Permission.USER_CREATE, Permission.USER_READ, Permission.USER_UPDATE, Permission.USER_DELETE,
    Permission.PROPERTY_CREATE, Permission.PROPERTY_READ, Permission.PROPERTY_UPDATE, Permission.PROPERTY_DELETE,
    Permission.QUOTATION_CREATE, Permission.QUOTATION_READ, Permission.QUOTATION_UPDATE, Permission.QUOTATION_DELETE,
    Permission.QUOTATION_APPROVE,
    Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE, Permission.PROJECT_DELETE,
    Permission.REPORT_CREATE, Permission.REPORT_READ,
    Permission.AUDIT_READ,
    Permission.SETTINGS_READ, Permission.SETTINGS_UPDATE,
  ],

  manager: [
    Permission.USER_READ,
    Permission.PROPERTY_CREATE, Permission.PROPERTY_READ, Permission.PROPERTY_UPDATE,
    Permission.QUOTATION_CREATE, Permission.QUOTATION_READ, Permission.QUOTATION_UPDATE, Permission.QUOTATION_APPROVE,
    Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE,
    Permission.REPORT_CREATE, Permission.REPORT_READ,
  ],

  engineer: [
    Permission.PROPERTY_READ, Permission.PROPERTY_UPDATE,
    Permission.QUOTATION_CREATE, Permission.QUOTATION_READ,
    Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE,
    Permission.REPORT_CREATE,
  ],

  staff: [
    Permission.PROPERTY_READ,
    Permission.QUOTATION_READ,
    Permission.PROJECT_READ,
    Permission.DOCUMENT_CREATE,
  ],

  viewer: [
    Permission.PROPERTY_READ,
    Permission.QUOTATION_READ,
    Permission.PROJECT_READ,
    Permission.REPORT_READ,
  ],

  client: [
    Permission.PROPERTY_READ,
    Permission.QUOTATION_READ,   // own quotations only
    Permission.PROJECT_READ,     // own projects only
    Permission.REPORT_READ,      // own reports only
  ],
};
```

### Permission Guard

```typescript
// src/iam/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true; // No specific permissions required
    }

    const { user } = context.switchToHttp().getRequest();

    // super_admin bypasses all permission checks
    if (user.role === 'super_admin') {
      return true;
    }

    return requiredPermissions.some((permission) =>
      user.permissions?.includes(permission),
    );
  }
}
```

### Decorator Usage

```typescript
// src/properties/properties.controller.ts
@Controller('properties')
export class PropertiesController {
  @Get()
  @RequirePermissions(Permission.PROPERTY_READ)
  async findAll(@Tenant() tenantId: string) {
    return this.propertiesService.findAll(tenantId);
  }

  @Post()
  @RequirePermissions(Permission.PROPERTY_CREATE)
  async create(
    @Tenant() tenantId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(tenantId, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.PROPERTY_DELETE)
  async delete(
    @Tenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.propertiesService.delete(tenantId, id);
  }
}
```

## Tenant Isolation

Every request includes tenant context resolved from the JWT:

```typescript
// src/iam/middleware/tenant-resolver.middleware.ts
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const payload = jwt.decode(token) as any;
      if (payload?.tenant_id) {
        req.tenantId = payload.tenant_id;
        // Prisma middleware switches schema
        await prisma.$executeRawUnsafe(
          `SET search_path TO tenant_${payload.tenant_id}, public`
        );
      }
    }
    next();
  }
}
```

## Data Access Filtering

```typescript
// src/properties/properties.service.ts
@Injectable()
export class PropertiesService {
  async findAll(tenantId: string, userId: string, role: string) {
    // super_admin sees all tenants
    if (role === 'super_admin') {
      return this.prisma.property.findMany();
    }

    // Client sees only their own properties
    if (role === 'client') {
      return this.prisma.property.findMany({
        where: { tenant_id: tenantId, client_id: userId },
      });
    }

    // Internal users see all properties in their tenant
    return this.prisma.property.findMany({
      where: { tenant_id: tenantId },
    });
  }
}
```

## Horizontal Privilege Escalation Prevention

```typescript
// Generic guard that checks resource ownership
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private resourceName: string,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const resourceId = request.params.id;
    const user = request.user;

    // admin+ can access any resource in their tenant
    if (['admin', 'super_admin', 'manager'].includes(user.role)) {
      return true;
    }

    // For other roles, verify ownership
    const resource = await (this.prisma as any)[this.resourceName].findUnique({
      where: { id: resourceId },
      select: { created_by: true, tenant_id: true },
    });

    if (!resource) return false;

    // Must belong to same tenant
    if (resource.tenant_id !== user.tenantId) return false;

    // Must be the owner (for client role)
    if (user.role === 'client' && resource.created_by !== user.id) {
      return false;
    }

    return true;
  }
}
```
