# Structured Logging with Pino

Triangle Black uses **Pino** via `nestjs-pino` for structured JSON logging with **correlation IDs** across requests.

## Setup

```typescript
// app.module.ts
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        level: process.env.LOG_LEVEL || 'info',
        serializers: {
          req: (req) => ({ method: req.method, url: req.url }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
      },
    }),
  ],
})
export class AppModule {}
```

## Correlation ID Middleware

Every request receives a unique correlation ID propagated through the system:

```typescript
// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'] || randomUUID();
    request.correlationId = correlationId;
    request.logger = new Logger();
    return next.handle().pipe(
      tap({
        next: (data) => {
          request.logger.log({
            correlationId,
            response: data,
            duration: Date.now() - request.startTime,
          });
        },
        error: (err) => {
          request.logger.error({
            correlationId,
            error: err.message,
            stack: err.stack,
            duration: Date.now() - request.startTime,
          });
        },
      }),
    );
  }
}
```

## Logging in Services

Services obtain a scoped logger through the request context:

```typescript
@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    @Inject(REQUEST) private readonly request: RequestWithLogger,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    this.request.logger.log({
      msg: 'Creating booking',
      propertyId: dto.propertyId,
      correlationId: this.request.correlationId,
    });
    // ...
  }
}
```

## Log Levels

| Level   | Usage                                      |
| ------- | ------------------------------------------ |
| `fatal` | Application crash, unrecoverable errors    |
| `error` | Handled errors, failed operations          |
| `warn`  | Deprecated usage, degraded performance     |
| `info`  | Business events (booking created, payment processed) |
| `debug` | Detailed system state (development only)   |
| `trace` | Very detailed tracing                      |

## Log Output Format (Production)

```json
{
  "level": 30,
  "time": 1718765432100,
  "pid": 1234,
  "hostname": "api-1",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "msg": "Creating booking",
  "propertyId": "prop_abc123",
  "duration": 42
}
```

## Audit Logging

Critical state changes (login, booking create/cancel, payment) are also persisted to the `audit_logs` table:

```typescript
await this.prisma.auditLog.create({
  data: {
    entityType: 'Booking',
    entityId: booking.id,
    action: 'CREATE',
    userId: user.id,
    metadata: { propertyId: booking.propertyId, total: booking.total },
    correlationId,
  },
});
```
