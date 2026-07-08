# Authorization — RBAC + Permissions

Authorization combines **Role-Based Access Control (RBAC)** at the coarse level with **permission checks** for fine-grained access.

## Roles

| Role        | Scope       | Description                     |
| ----------- | ----------- | ------------------------------- |
| `SUPER_ADMIN` | Global    | Full system access              |
| `ADMIN`     | Global      | Management access, no billing   |
| `MANAGER`   | Property    | Manage one or more properties   |
| `STAFF`     | Property    | Daily operations (housekeeping, front desk) |
| `GUEST`     | Self        | Own bookings and profile        |

## Role Decorator & Guard

```typescript
// common/decorators/roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

```typescript
// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

## Controller Usage

```typescript
@Controller('properties')
export class PropertiesController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  async create(@Body() dto: CreatePropertyDto) {
    // Only admins and managers can create properties
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    // Logged-in users can view; guests can only view published properties
  }
}
```

## Permission-Based Checks

For property-level granularity, service methods perform explicit checks:

```typescript
async function findOne(id: string, user: AuthUser): Promise<Property> {
  const property = await this.propertyRepository.findById(id);
  if (!property) throw new NotFoundException();

  if (user.role === Role.GUEST && !property.isPublished) {
    throw new ForbiddenException();
  }

  if ([Role.MANAGER, Role.STAFF].includes(user.role) && property.organizationId !== user.organizationId) {
    throw new ForbiddenException();
  }

  return property;
}
```

## Permission Matrix

| Action                    | SUPER_ADMIN | ADMIN | MANAGER | STAFF | GUEST |
| ------------------------- | ----------- | ----- | ------- | ----- | ----- |
| Manage users              | ✓           | ✓     | —       | —     | —     |
| Create/edit properties    | ✓           | ✓     | ✓*      | —     | —     |
| View all bookings         | ✓           | ✓     | ✓*      | ✓*    | —     |
| Manage own bookings       | ✓           | ✓     | ✓       | ✓     | ✓     |
| Process payments          | ✓           | ✓     | ✓*      | —     | —     |
| Run reports               | ✓           | ✓     | ✓*      | —     | —     |
| View dashboard            | ✓           | ✓     | ✓*      | ✓*    | —     |

*Scoped to assigned property/organization.

## Combined Guard Pattern

The `JwtAuthGuard` runs first (authenticates), then `RolesGuard` (authorizes). This is wired globally or per-route:

```typescript
// Global registration in AppModule
providers: [
  { provide: APP_GUARD, useClass: RolesGuard },
]
```
