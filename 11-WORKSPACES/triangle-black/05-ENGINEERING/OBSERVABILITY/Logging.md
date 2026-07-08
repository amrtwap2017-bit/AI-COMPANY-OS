# OBS-001 — Logging

## Winston Logger Setup

```typescript
// apps/api/src/common/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'triangle-black-api' },
      transports: [
        new winston.transports.Console({
          format: process.env.NODE_ENV === 'development'
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
              )
            : winston.format.json(),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 10,
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
```

## Log Interceptor

```typescript
// apps/api/src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = uuidv4();
    request.requestId = requestId;

    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;
        console.log(`${method} ${url} ${response.statusCode} ${duration}ms [${requestId}]`);
      }),
    );
  }
}
```
