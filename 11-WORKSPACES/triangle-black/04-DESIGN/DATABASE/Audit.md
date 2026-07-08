# Audit Architecture

## Audit Requirements

Every table in the system has audit capabilities at two levels:

1. **Row-level audit columns** — who created and last updated each record
2. **Audit log** — immutable, append-only history of all data changes

## Row-Level Audit Columns

Every table includes these five audit columns:

```sql
created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
created_by      UUID          NOT NULL
updated_by      UUID          NOT NULL
deleted_at      TIMESTAMPTZ   NULL
```

### Behavior

| Column | Set On | Updated On | Managed By |
|--------|--------|------------|------------|
| `created_at` | INSERT | Never | Database default + trigger |
| `updated_at` | INSERT | UPDATE | Trigger (`trg_{table}_updated_at`) |
| `created_by` | INSERT | Never | Application (set from JWT) |
| `updated_by` | INSERT | UPDATE | Application (set from JWT) |
| `deleted_at` | Never | Soft delete | Application (UPDATE, not DELETE) |

### updated_at Trigger

Every table has an `updated_at` trigger:

```sql
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to every table
CREATE TRIGGER trg_reservation_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_updated_at();
```

## Audit Log Table

The `audit_log` table exists in **every schema** (platform `public` and each tenant schema).

```sql
CREATE TABLE audit_log (
  id            BIGSERIAL     PRIMARY KEY,
  tenant_id     UUID          NULL,
  table_name    VARCHAR(100)  NOT NULL,
  record_id     UUID          NOT NULL,
  action        audit_action  NOT NULL,
  old_values    JSONB         NULL,
  new_values    JSONB         NULL,
  changed_by    UUID          NOT NULL,
  changed_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ip_address    INET          NULL,
  user_agent    VARCHAR(500)  NULL
);
```

### audit_action Enum

```sql
CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE',
  'RESTORE',
  'ARCHIVE',
  'EXPORT',
  'IMPORT',
  'LOGIN',
  'LOGOUT',
  'PASSWORD_CHANGE',
  'SETTING_CHANGE',
  'ROLE_CHANGE',
  'STATUS_CHANGE'
);
```

### Audit Log Indexes

```sql
CREATE INDEX idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log (changed_at);
CREATE INDEX idx_audit_log_changed_by ON audit_log (changed_by);
CREATE INDEX idx_audit_log_action ON audit_log (action);
```

### What Gets Logged

| Action | Table | Details Logged |
|--------|-------|---------------|
| INSERT | All tables | `new_values` = full row data |
| UPDATE | All tables | `old_values` = previous row, `new_values` = current row |
| DELETE | All tables | `old_values` = row before soft delete, `action` = 'DELETE' |
| LOGIN | auth | `new_values` = `{ "ip": "..." }` |
| PASSWORD_CHANGE | users | `new_values` = `{ "changed": true }` (no password stored) |
| STATUS_CHANGE | reservations | `old_values`/`new_values` show status transition |

### What Is NOT Logged

- `password_hash` — never recorded in any log
- `gateway_response` — full credit card data excluded; only status is logged
- `token_hash` — never logged
- Fields containing PII may be redacted via application-level audit service

## Audit Log Implementation

### Application-Level (Primary)

An `AuditInterceptor` or `AuditService` captures changes at the NestJS service layer:

```typescript
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    const { tenantId, tableName, recordId, action, oldValues, newValues, userId, ip, userAgent } = params;

    await this.prisma.getClient(tenantId).auditLog.create({
      data: {
        tenantId,
        tableName,
        recordId,
        action,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        changedBy: userId,
        ipAddress: ip,
        userAgent,
      },
    });
  }
}
```

### Database-Level (Secondary/Backup)

A PostgreSQL trigger function can log directly to the audit table as a safety net:

```sql
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP::audit_action,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
    COALESCE(NEW.updated_by, OLD.updated_by, '00000000-0000-0000-0000-000000000000'::uuid)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Decision:** Application-level logging is primary. Database triggers are added for critical financial tables (reservations, folios, payments) as a safety net.

## Audit Log Archival

The `audit_log` table can grow quickly. Archive strategy:

| Age | Storage | Access |
|-----|---------|--------|
| < 90 days | Main `audit_log` table | Full query access |
| 90 days — 2 years | Archived partition | Read-only, slower queries |
| > 2 years | Exported JSON files (compressed) | Manual restore required |

Archival job (cron / Bull queue):
```sql
-- Move records older than 90 days to archive
INSERT INTO audit_log_archive SELECT * FROM audit_log WHERE changed_at < NOW() - INTERVAL '90 days';
DELETE FROM audit_log WHERE changed_at < NOW() - INTERVAL '90 days';
```

## Audit Queries

### Common Audit Queries

```sql
-- All changes to a specific record
SELECT * FROM audit_log
WHERE table_name = 'reservations' AND record_id = '550e8400-...'
ORDER BY changed_at DESC;

-- Changes by a specific user in the last 30 days
SELECT * FROM audit_log
WHERE changed_by = 'user_abc' AND changed_at > NOW() - INTERVAL '30 days'
ORDER BY changed_at DESC;

-- All DELETE actions in last 24 hours (potential data loss investigation)
SELECT * FROM audit_log
WHERE action = 'DELETE' AND changed_at > NOW() - INTERVAL '24 hours'
ORDER BY changed_at DESC;

-- Count changes per table
SELECT table_name, COUNT(*) as changes
FROM audit_log
WHERE changed_at > NOW() - INTERVAL '7 days'
GROUP BY table_name
ORDER BY changes DESC;
```

## GDPR / Data Privacy

When a guest requests data deletion:

1. Anonymize PII in main tables (`guests.email = NULL`, `guests.phone = NULL`)
2. Mark record as deleted (`deleted_at = NOW()`)
3. Keep audit log entries (immutable by design)
4. Redact PII from audit log `new_values` and `old_values` JSONB with `##REDACTED##`
