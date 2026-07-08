# Audit Strategy

## Requirements

- Every CREATE/UPDATE/DELETE operation must be auditable
- Audits must include old and new values
- Audits must identify the acting user, IP, and user agent
- Audits must be immutable (append-only)
- Retention: 2 years online, 5 years archived

## Implementation

### Approach: Application-Level Audit Logging

NestJS interceptors write audit records to the `audit_log` table within the tenant's schema (for tenant data) or the `platform_audit_log` table (for platform data).

### Audit Interceptor

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;
    
    // Skip non-mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody) => {
        this.writeAuditLog(request, method, responseBody, user);
      }),
    );
  }

  private async writeAuditLog(request: any, method: string, response: any, user: any) {
    // Extract table_name, record_id, action from route metadata + response
    // Write to audit_log table
  }
}
```

### Audit Log Record Structure

```json
{
  "id": 1,
  "tenant_id": "uuid",
  "table_name": "opportunities",
  "record_id": "uuid",
  "action": "update",
  "old_values": {
    "stage": "proposal",
    "probability": 50
  },
  "new_values": {
    "stage": "negotiation",
    "probability": 75
  },
  "changed_by": "uuid",
  "changed_at": "2026-07-01T10:30:00Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

### Triggers (Alternative for Critical Tables)

For critical tables (quotations, contracts, projects), add a database-level trigger as defense in depth:

```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (tenant_id, table_name, record_id, action, old_values, new_values, changed_by, changed_at)
  VALUES (
    current_setting('app.tenant_id'),
    TG_TABLE_NAME,
    NEW.id,
    TG_OP::audit_action,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
    current_setting('app.user_id')::uuid,
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Audit API

```
GET /api/admin/audit-logs?table_name=quotations&record_id=uuid
GET /api/admin/audit-logs?changed_by=uuid&from=2026-01-01&to=2026-06-30
```

## Retention

| Period | Policy |
|--------|--------|
| 0-2 years | Online, queryable via API |
| 2-5 years | Compressed archive, downloadable CSV |
| 5+ years | Deleted permanently |
