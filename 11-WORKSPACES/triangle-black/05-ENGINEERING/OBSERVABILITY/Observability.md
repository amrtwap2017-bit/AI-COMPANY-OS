# Phase 04 — Observability

> Logging, monitoring, and observability strategy.

## Logging

| Aspect | Standard | Tool |
|--------|----------|------|
| Structured | JSON format with timestamp, level, module, traceId | Winston / Pino |
| Log levels | error, warn, info, debug | Configurable per environment |
| Request logging | Auto-logged via interceptor | NestJS Logger |
| Error logging | Stack trace + context | Global exception filter |
| Audit logging | All state mutations logged | AuditService |

## Log Format

```json
{
  "timestamp": "2026-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Lead created",
  "module": "LeadService",
  "traceId": "req-uuid-123",
  "userId": "u-a1b2c3d4",
  "tenantId": "t-e5f6g7h8",
  "data": { "leadId": "LD-000001", "source": "website" }
}
```

## Health Checks

| Endpoint | Purpose | Checks |
|----------|---------|--------|
| `/api/v1/health/live` | Liveness | Process alive |
| `/api/v1/health/ready` | Readiness | DB connection, migrations current |

## Monitoring (V1)

- Docker health checks for all services
- Log aggregation via `docker logs` and journald
- Cron job monitoring (failed → email alert)
- Uptime monitoring via external service

## V2 Observability

- Centralized logging (ELK/Grafana Loki)
- Metrics (Prometheus + Grafana dashboards)
- Distributed tracing (OpenTelemetry)
- APM for performance monitoring

See `15-OBSERVABILITY/` for detailed observability configuration.
