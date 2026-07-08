# 15 — Observability

## Logging

| Tool | Purpose | Cost |
|------|---------|------|
| Winston (file + console) | App logging (structured JSON) | Free |
| Docker logs | Container logs (stdout/stderr) | Free |
| Sentry Free | Error tracking (5K events/mo) | Free |

### Log Levels

```typescript
logger.error('Database connection failed', { error: err.message });  // Always alert
logger.warn('Quotation expiring soon', { quotationId, daysLeft: 5 }); // Investigate
logger.log('Lead created', { leadId, source });                        // Normal operation
logger.debug('Prisma query result', { duration });                     // Debug only
logger.verbose('Full query data', { ... });                            // Verbose trace
```

### Structured Log Format

```json
{
  "timestamp": "2026-07-01T10:30:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "context": "PrismaService",
  "requestId": "req_abc123",
  "userId": "user_uuid",
  "tenantId": "tenant_uuid",
  "error": {
    "message": "connect ECONNREFUSED",
    "stack": "..."
  }
}
```

## Health Checks

```typescript
// GET /api/v1/health
{
  "status": "ok",
  "timestamp": "2026-07-01T10:30:00Z",
  "services": {
    "database": { "status": "ok", "latency": "2ms" },
    "storage": { "status": "ok", "freeSpace": "15GB" },
    "memory": { "status": "ok", "usage": "45%" },
    "uptime": "14d 6h 32m"
  }
}
```

## Monitoring (Self-Hosted)

| Tool | Purpose | Deploy |
|------|---------|--------|
| Uptime Kuma | External uptime monitoring | Docker on same VPS |
| Docker healthcheck | Container-level health | Built into Docker Compose |

## Alerting

| Event | Channel | Threshold |
|-------|---------|-----------|
| 5xx > 1% in 5 min | Email + Sentry | Immediate |
| Disk > 80% | Email | Daily check |
| Database connection failure | Email | Immediate |
| SSL expiry < 30 days | Email | Daily check |
| Backup failure | Email | Daily check |
| Pod restart (unexpected) | Email | Immediate |
