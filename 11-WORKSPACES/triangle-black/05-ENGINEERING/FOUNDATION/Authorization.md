# IDN-002 — Authorization Implementation

## `apps/api/src/common/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

## `apps/api/src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

## `apps/api/src/common/guards/tenant.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceTenantId = request.params.tenantId || request.body?.tenantId;

    // Super admins can access all tenants
    if (user.role === 'super_admin') return true;

    // Users can only access their own tenant
    if (resourceTenantId && resourceTenantId !== user.tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return true;
  }
}
```

## Permission Matrix

```typescript
// apps/api/src/common/constants/permissions.ts
export const PERMISSIONS = {
  // CRM
  leads: {
    create: ['sales_rep', 'manager', 'admin', 'super_admin'],
    read: ['sales_rep', 'manager', 'admin', 'super_admin', 'viewer'],
    update: ['sales_rep', 'manager', 'admin', 'super_admin'],
    delete: ['manager', 'admin', 'super_admin'],
    convert: ['sales_rep', 'manager', 'admin', 'super_admin'],
  },
  opportunities: {
    create: ['sales_rep', 'manager', 'admin', 'super_admin'],
    read: ['sales_rep', 'manager', 'admin', 'super_admin', 'viewer'],
    update: ['sales_rep', 'manager', 'admin', 'super_admin'],
    delete: ['manager', 'admin', 'super_admin'],
  },
  quotations: {
    create: ['sales_rep', 'manager', 'admin', 'super_admin'],
    read: ['sales_rep', 'manager', 'admin', 'super_admin', 'viewer'],
    update: ['sales_rep', 'manager', 'admin', 'super_admin'],
    delete: ['admin', 'super_admin'],
    approve: ['manager', 'admin', 'super_admin'],
    submit: ['sales_rep', 'manager', 'admin', 'super_admin'],
  },
  projects: {
    create: ['manager', 'admin', 'super_admin'],
    read: ['engineer', 'manager', 'admin', 'super_admin', 'viewer'],
    update: ['engineer', 'manager', 'admin', 'super_admin'],
    delete: ['admin', 'super_admin'],
    complete_milestone: ['engineer', 'manager', 'admin', 'super_admin'],
    approve_milestone: ['manager', 'admin', 'super_admin'],
  },
  admin: {
    manage_users: ['admin', 'super_admin'],
    manage_roles: ['super_admin'],
    view_audit: ['admin', 'super_admin'],
    manage_tenant: ['admin', 'super_admin'],
  },
  portal: {
    create_request: ['client_user', 'client_admin'],
    read_request: ['client_user', 'client_admin'],
    cancel_request: ['client_user'],
  },
} as const;

export type Resource = keyof typeof PERMISSIONS;
export type Action<T extends Resource> = keyof typeof PERMISSIONS[T];
```

## `apps/api/src/common/guards/permission.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS, Resource, Action } from '../constants/permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<{ resource: Resource; action: Action<Resource> }>(
      'permission',
      [context.getHandler(), context.getClass()],
    );
    if (!permission) return true;

    const { user } = context.switchToHttp().getRequest();
    const allowedRoles = PERMISSIONS[permission.resource]?.[permission.action as string] as string[] | undefined;

    if (!allowedRoles?.includes(user.role)) {
      throw new ForbiddenException(`Insufficient permissions: ${String(permission.action)} ${permission.resource}`);
    }

    return true;
  }
}
```

## `apps/api/src/common/decorators/permission.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Resource, Action } from '../constants/permissions';

export const RequirePermission = <T extends Resource>(
  resource: T,
  action: Action<T>,
) => SetMetadata('permission', { resource, action });
```
