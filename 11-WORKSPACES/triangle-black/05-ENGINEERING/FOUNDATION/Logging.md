# Logging

| Field | Value |
|---|---|
| Document ID | 17-Engineering-06 |
| Document Purpose | Define logging conventions, levels, and structured format |
| Version | 1.0 |
| Status | Approved |

## Logging Library

Use the NestJS built-in `Logger` (based on `console`) or switch to `pino` for production. The `Logger` interface is injected via `@Injectable(Logger)`.

```typescript
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
}
```

## Log Levels

| Level | Usage | When |
|---|---|---|
| `error` | Unhandled errors, system failures, data corruption | Immediate attention |
| `warn` | Unexpected but handled conditions, degraded performance | Should be investigated |
| `log` (info) | Normal operations: request start/end, state changes | Standard operational view |
| `debug` | Detailed diagnostic information | Development / troubleshooting |
| `verbose` | Everything — function entry/exit, variable dumps | Only during deep debugging |

## What to Log

### Always Log
- Incoming request: method, path, correlation ID, user ID
- Outgoing response: status code, duration
- Errors: stack trace, context, relevant state
- Authentication/authorization failures
- Database query failures
- External service call failures (with response)

### Never Log
- Passwords, tokens, secrets
- PII (personally identifiable information) — email, phone, address
- Payment card numbers, CVV, bank details
- Full request/response bodies in production (use debug level)

## Structured Logging Format

Logs are emitted as JSON in production:

```json
{
  "level": "info",
  "timestamp": "2026-06-30T10:00:00.000Z",
  "context": "UserService",
  "message": "User created",
  "correlationId": "req-abc-123",
  "userId": "usr-456",
  "duration": 42,
  "metadata": {}
}
```

In development, use pretty-print:

```bash
NODE_ENV=development nest start --watch | npx pino-pretty
```

## Correlation ID

Every request gets a unique correlation ID (UUID v4), generated at the earliest entry point.

- HTTP: NestJS middleware generates and attaches to request headers
- Background jobs: generated at job creation
- Pass correlation ID to all downstream calls (external API headers, database comments)

```typescript
// middleware
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
```

## Log Aggregation

- Development: stdout with pretty-print
- Staging: stdout JSON, ingested by logging service
- Production: stdout JSON, shipped to log aggregation platform (CloudWatch / Grafana Loki)

## Monitoring

- Error rate >1% triggers alert
- 5xx responses >10 in 5 minutes triggers alert
- Logs retained: 7 days in hot storage, 30 days in cold storage

## Cross-References

- [18-Deployment/Production.md](../18-Deployment/Production.md) — Production logging setup
- [19-Testing/Performance.md](../19-Testing/Performance.md) — Observability for performance
