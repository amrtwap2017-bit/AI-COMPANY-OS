# 00-SHARED-KERNEL — Events

## Infrastructure Events

| Event | Description |
|-------|-------------|
| tenant.created | New tenant provisioned |
| tenant.config_updated | Tenant configuration changed |
| user.created | New user in tenant |
| user.activated | User first login |
| user.deactivated | User disabled |
| notification.sent | Notification dispatched |
| notification.delivered | Notification confirmed delivered |

## Event Bus Contract

```typescript
interface DomainEvent {
  id: string;          // UUID
  type: string;        // "lead.created"
  timestamp: Date;
  tenantId: string;
  userId: string;
  payload: Record<string, unknown>;
}
```
