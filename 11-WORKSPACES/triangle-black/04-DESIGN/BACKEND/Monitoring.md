# Monitoring — Health Checks, Metrics & OpenTelemetry

## Health Checks

NestJS `@nestjs/terminus` provides health check endpoints for infrastructure dependencies.

```typescript
// modules/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.prisma.pingCheck('database'),
    ]);
  }
}
```

### Health Check Response

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {},
  "details": { ... }
}
```

- `GET /health` — Liveness check (K8s)
- `GET /health/ready` — Readiness check (K8s)

## Metrics

Prometheus metrics are exposed for infrastructure monitoring:

```typescript
// common/interceptors/metrics.interceptor.ts
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        this.httpRequestDuration
          .labels(request.method, request.route.path, String(response.statusCode))
          .observe((Date.now() - start) / 1000);
      }),
    );
  }
}
```

Metrics are exposed via `GET /metrics` using `@willsoto/nestjs-prometheus`.

## Custom Business Metrics

| Metric                             | Type      | Labels          | Description                  |
| ---------------------------------- | --------- | --------------- | ---------------------------- |
| `bookings_total`                   | Counter   | status, source  | Total bookings created       |
| `bookings_active`                  | Gauge     | property        | Currently active stays       |
| `payment_processing_duration`      | Histogram | gateway         | Payment latency              |
| `occupancy_rate`                   | Gauge     | property        | Current occupancy percentage |
| `user_logins_total`                | Counter   | role            | Login events                 |

## OpenTelemetry Readiness

The application is instrumented for OpenTelemetry via the `@opentelemetry/sdk-node` and `@opentelemetry/auto-instrumentations-node` packages.

```typescript
// tracer.ts (standalone entry point)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'triangle-black-api',
  }),
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

To enable, set `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable and use `node -r ./tracer.js dist/main.js`.

## Alerts (PagerDuty / Opsgenie)

| Condition                           | Severity  |
| ----------------------------------- | --------- |
| Health check fails > 30s            | Critical  |
| P95 response time > 2s for 5 min    | Warning   |
| Error rate > 5% for 5 min           | Critical  |
| Database connection pool exhausted  | Critical  |
