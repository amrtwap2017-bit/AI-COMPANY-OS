# 00-SHARED-KERNEL — Notifications

## Channels

| Channel | Priority | Delivery Guarantee | V1 Status |
|---------|----------|-------------------|-----------|
| In-app | High | At-least-once | ✅ Built |
| Email | Medium | Best-effort | ✅ SMTP config |

## Notification Record

```typescript
interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: 'in-app' | 'email' | 'both';
  channel: 'in-app' | 'email';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}
```
