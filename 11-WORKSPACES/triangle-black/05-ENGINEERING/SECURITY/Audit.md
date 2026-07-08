# Audit Logging

## Overview

Audit logs capture who did what, when, and from where. Every access to sensitive data and every security-relevant action is logged immutably. In V1, audit logs are stored in a dedicated PostgreSQL schema with append-only access.

## Audit Schema

```sql
-- Schema: audit
CREATE SCHEMA IF NOT EXISTS audit;

-- Core audit log table
CREATE TABLE audit.logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Who
    user_id         UUID,
    user_email      VARCHAR(255),
    user_role       VARCHAR(50),
    impersonated_by UUID,           -- If admin is acting on behalf
    
    -- What
    action          VARCHAR(100) NOT NULL,  -- user.login, reservation.create
    entity_type     VARCHAR(100),           -- reservation, quotation, user
    entity_id       VARCHAR(100),           -- UUID of affected entity
    
    -- Context
    tenant_id       UUID,
    request_id      VARCHAR(100),           -- Correlation ID
    ip_address      INET,
    user_agent      TEXT,
    session_id      VARCHAR(100),
    
    -- Detail
    changes         JSONB,                  -- Before/after for updates
    metadata        JSONB,                  -- Additional context
    status          VARCHAR(20) DEFAULT 'success',  -- success, failure, denied
    
    -- Integrity
    checksum        VARCHAR(64) NOT NULL,   -- SHA-256 of previous fields
    previous_id     UUID REFERENCES audit.logs(id),  -- Chain linkage
    
    CONSTRAINT fk_previous_checksum UNIQUE (previous_id, checksum)
);

-- Indexes for querying
CREATE INDEX idx_audit_timestamp ON audit.logs(timestamp DESC);
CREATE INDEX idx_audit_user_id ON audit.logs(user_id);
CREATE INDEX idx_audit_tenant_id ON audit.logs(tenant_id);
CREATE INDEX idx_audit_action ON audit.logs(action);
CREATE INDEX idx_audit_entity ON audit.logs(entity_type, entity_id);
```

## What to Log

### Authentication Events

| Action | Log Level | Details |
|--------|-----------|---------|
| User login | INFO | user_id, IP, user_agent, success/failure |
| Login failure | WARN | email, IP, reason, attempt count |
| Password change | INFO | user_id, IP |
| Password reset requested | INFO | email, IP |
| Password reset completed | INFO | user_id, IP |
| Logout | INFO | user_id, session_id |
| Token refresh | INFO | user_id, token_id |
| Account lockout | WARN | user_id, IP, duration |
| MFA challenge (V2) | INFO | user_id, method, success/failure |

### Data Access Events

| Action | Log Level | Details |
|--------|-----------|---------|
| Create entity | INFO | entity_type, entity_id, tenant_id |
| Read sensitive data | INFO | entity_type, entity_id, reason |
| Update entity | INFO | entity_type, entity_id, changes (JSON diff) |
| Delete entity | WARN | entity_type, entity_id, soft/hard delete |
| Export data | WARN | entity_type, filter criteria, record count |
| Bulk operation | INFO | operation_type, record_count |

### Security Events

| Action | Log Level | Details |
|--------|-----------|---------|
| Permission denied | WARN | user_id, resource, required permission |
| Role assignment | INFO | user_id, role assigned by, target user |
| Role revocation | INFO | user_id, role revoked by, target user |
| Tenant access (cross) | CRITICAL | user_id, source_tenant, target_tenant |
| API key usage | INFO | key_id, endpoint, IP |
| Rate limit exceeded | WARN | IP, endpoint, current_rate |
| Suspicious activity | CRITICAL | Pattern detected |

### Administrative Events

| Action | Log Level | Details |
|--------|-----------|---------|
| User created | INFO | created_by, new_user_id, role |
| User disabled | WARN | disabled_by, user_id, reason |
| Tenant created | INFO | created_by, tenant_id |
| Tenant modified | INFO | modified_by, tenant_id, changes |
| System settings changed | WARN | changed_by, setting_key, old_value, new_value |
| Backup initiated | INFO | initiated_by, type (full/tenant) |
| Backup restored | CRITICAL | initiated_by, backup_id, timestamp |

## Implementation

### Audit Service

```typescript
// src/audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  async log(event: AuditEvent): Promise<void> {
    // Get the previous log entry for chain linkage
    const previousLog = await this.prisma.$queryRaw`
      SELECT id, checksum FROM audit.logs
      ORDER BY timestamp DESC LIMIT 1
    `;

    const previousId = previousLog[0]?.id || null;
    const previousChecksum = previousLog[0]?.checksum || null;

    // Compute integrity checksum
    const checksumData = this.buildChecksumData(event, previousId);
    const checksum = this.crypto.sha256(checksumData);

    await this.prisma.$executeRaw`
      INSERT INTO audit.logs (
        id, timestamp, user_id, user_email, user_role,
        impersonated_by, action, entity_type, entity_id,
        tenant_id, request_id, ip_address, user_agent,
        session_id, changes, metadata, status, checksum, previous_id
      ) VALUES (
        gen_random_uuid(), NOW(),
        ${event.userId}, ${event.userEmail}, ${event.userRole},
        ${event.impersonatedBy}, ${event.action}, ${event.entityType}, ${event.entityId},
        ${event.tenantId}, ${event.requestId}, ${event.ipAddress}, ${event.userAgent},
        ${event.sessionId}, ${JSON.stringify(event.changes)}, ${JSON.stringify(event.metadata)},
        ${event.status}, ${checksum}, ${previousId}
      )
    `;
  }

  private buildChecksumData(event: AuditEvent, previousId: string | null): string {
    // Concatenate all relevant fields for integrity check
    return [
      event.timestamp?.toISOString() || new Date().toISOString(),
      event.userId,
      event.action,
      event.entityType,
      event.entityId,
      event.tenantId,
      event.ipAddress,
      event.status,
      JSON.stringify(event.changes),
      previousId,
    ].join('|');
  }
}
```

### Decorator-Based Logging

```typescript
// Decorator for automatic audit logging
@AuditLog('reservation.create')
async createReservation(dto: CreateReservationDto, user: User) {
  const reservation = await this.prisma.reservation.create({ data: dto });
  // Audit log is automatically created by decorator
  return reservation;
}
```

```typescript
// src/audit/decorators/audit-log.decorator.ts
export function AuditLog(action: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      const auditService = this.auditService;
      const request = this.request; // injected via @Inject(REQUEST)

      await auditService.log({
        action,
        userId: request.user?.id,
        userEmail: request.user?.email,
        userRole: request.user?.role,
        tenantId: request.tenantId,
        entityId: result?.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        requestId: request.headers['x-request-id'],
        status: 'success',
      });

      return result;
    };

    return descriptor;
  };
}
```

## Log Integrity

### Chain Integrity

Each log entry references the previous entry's ID and includes a SHA-256 checksum of its own content plus the previous ID. This creates an immutable chain:

```
┌─────────┐    ┌─────────────┐    ┌─────────────┐
│ Log #1  │───►│  Log #2     │───►│  Log #3     │
│         │    │             │    │             │
│ prev:   │    │ prev: #1    │    │ prev: #2    │
│ null    │    │ checksum:   │    │ checksum:   │
│ checksum│    │ SHA256(     │    │ SHA256(     │
│: abc123 │    │  data + #1) │    │  data + #2) │
└─────────┘    └─────────────┘    └─────────────┘
```

### Integrity Verification

```typescript
async function verifyAuditChain(): Promise<boolean> {
  const logs = await prisma.$queryRaw`
    SELECT id, checksum, previous_id,
           SHA256(timestamp || user_id || action || previous_id) AS computed_checksum
    FROM audit.logs
    ORDER BY timestamp ASC
  `;

  for (const log of logs) {
    if (log.checksum !== log.computed_checksum) {
      console.error(`Integrity breach at log ${log.id}`);
      return false;
    }
    if (log.previous_id && !logs.find(l => l.id === log.previous_id)) {
      console.error(`Broken chain at log ${log.id}`);
      return false;
    }
  }

  return true;
}
```

## Retention

| Log Type | Retention Period | Action After Retention |
|----------|-----------------|------------------------|
| Authentication logs | 12 months | Archive then delete |
| Data access logs | 24 months | Archive then delete |
| Security events | 36 months | Archive (permanent) |
| Administrative actions | 36 months | Archive (permanent) |
| Debug/verbose logs | 90 days | Delete |

### Archive Procedure

```sql
-- Archive logs older than retention period
INSERT INTO audit.archive_2026
SELECT * FROM audit.logs
WHERE timestamp < '2025-01-01';

-- Delete from active table
DELETE FROM audit.logs
WHERE timestamp < '2025-01-01';
```

## Access Control

| Role | Audit Log Access | Notes |
|------|-----------------|-------|
| super_admin | Full read + export | Can view all logs |
| admin | Read own tenant | Cannot view other tenants |
| manager | Read own user activity | Cannot view other users |
| Others | No access | Audit team or security team only |

```typescript
// Audit query with permission filter
async function queryAuditLogs(user: User, filters: AuditFilter) {
  if (user.role === 'super_admin') {
    return prisma.$queryRaw`SELECT * FROM audit.logs WHERE ...`;
  }
  
  if (user.role === 'admin') {
    return prisma.$queryRaw`
      SELECT * FROM audit.logs 
      WHERE tenant_id = ${user.tenantId} AND ...
    `;
  }
  
  if (user.role === 'manager') {
    return prisma.$queryRaw`
      SELECT * FROM audit.logs 
      WHERE user_id = ${user.id} AND ...
    `;
  }
  
  throw new ForbiddenException();
}
```

## Audit Dashboard (V2)

Future audit dashboard features:
- Real-time log stream
- Anomaly detection (unusual login times, locations)
- Pre-built compliance reports (SOC 2, ISO 27001)
- Export to CSV/JSON
- Alert rules (e.g., > 10 failed logins in 5 minutes)
