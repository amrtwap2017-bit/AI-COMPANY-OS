# 07 — Audit Logging

> Audit logging for security and compliance.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 3 | Security-Architecture.md | Security architecture |
| Phase 4 | Observability.md | Logging strategy |

## Audit Log Scope

| Event Type | Logged | Retention | Destination |
|------------|--------|-----------|-------------|
| User login (success/failure) | ✅ | 90 days | PostgreSQL (audit_logs) |
| User logout | ✅ | 90 days | PostgreSQL (audit_logs) |
| Data modification (CUD) | ✅ | 90 days | PostgreSQL (audit_logs) |
| Permission change | ✅ | 365 days | PostgreSQL (audit_logs) |
| API key usage | ✅ | 90 days | PostgreSQL (audit_logs) |
| Admin actions | ✅ | 365 days | PostgreSQL (audit_logs) |
| System configuration change | ✅ | 365 days | PostgreSQL (audit_logs) |
| Failed access attempts | ✅ | 90 days | PostgreSQL (audit_logs) |

## Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,  -- login, logout, create, update, delete, permission_change
  resource_type VARCHAR(50) NOT NULL,  -- reservation, guest, rate, user, etc.
  resource_id VARCHAR(100),
  action VARCHAR(200) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

## Audit Log Queries

```sql
-- Recent failed logins
SELECT * FROM audit_logs
WHERE event_type = 'login'
  AND details->>'success' = 'false'
ORDER BY created_at DESC
LIMIT 50;

-- Data modifications by admin users
SELECT * FROM audit_logs
WHERE event_type IN ('create', 'update', 'delete')
  AND details->>'role' = 'admin'
ORDER BY created_at DESC
LIMIT 100;

-- User activity in last 24 hours
SELECT user_id, event_type, count(*)
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id, event_type;
```

## Audit Log Review

| Review | Frequency | Owner |
|--------|-----------|-------|
| Failed login review | Daily | DevOps Lead |
| Admin action review | Weekly | CTO |
| Full audit log review | Monthly | CTO |
| Retention policy compliance | Quarterly | CTO |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT CONFIGURED
