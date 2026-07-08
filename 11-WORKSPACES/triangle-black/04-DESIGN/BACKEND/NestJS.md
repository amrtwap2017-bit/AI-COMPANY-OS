# NestJS Architecture Overview

## Module Structure

The application is organized into feature modules, each encapsulating its own domain logic, controllers, services, and CQRS handlers.

```
AppModule
├── CoreModule            — Global providers, filters, interceptors, pipes
├── DatabaseModule        — Prisma connection & repository exports
├── AuthModule            — Authentication (JWT, login, refresh)
├── UsersModule           — User CRUD, profile management
├── PropertiesModule      — Property listings, inventory
├── BookingsModule        — Reservation lifecycle
├── GuestsModule          — Guest profiles and history
├── HousekeepingModule    — Housekeeping tasks & schedules
├── FinanceModule         — Payments, invoices, ledgers
├── ReportsModule         — Aggregated reports & analytics
├── NotificationsModule   — Email, SMS, in-app notifications
└── IntegrationsModule    — Third-party API integrations (PMS, channel managers)
```

## Dependency Injection

NestJS DI is based on constructor injection with `@Injectable()` decorators.

```typescript
@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingRepository: BookingRepository,
    private readonly eventBus: EventBus,
  ) {}
}
```

### Provider scopes

| Scope    | Use case                           |
| -------- | ---------------------------------- |
| DEFAULT  | Singleton — most services, repos   |
| REQUEST  | Per-request — tenant context       |
| TRANSIENT | New instance per injection — stateless utilities |

### Custom providers

- `useFactory` — Dynamic providers (e.g. `ConfigService`-dependent)
- `useClass` — Provider aliasing for testing
- `useValue` — Mock providers in unit tests

## Module Re-Export Pattern

Feature modules export their public services and repositories so consuming modules can use them without direct Prisma access.

```typescript
@Module({
  providers: [BookingsService, BookingRepository],
  exports: [BookingsService, BookingRepository],
})
export class BookingsModule {}
```

## Global Filters, Pipes, and Interceptors

Registered in `CoreModule`:

| Artifact       | Purpose                                |
| -------------- | -------------------------------------- |
| `HttpExceptionFilter` | Unified JSON error responses     |
| `ValidationPipe`      | DTO validation via class-validator |
| `LoggingInterceptor` | Request/response logging with correlation ID |
| `TransformInterceptor` | Wraps responses in standard envelope |

## Main Entry Point

`main.ts` bootstraps the application with OpenAPI/Swagger setup, global prefix (`/api/v1`), CORS, and Pino logger.

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: process.env.FRONTEND_URL });
  app.useLogger(app.get(Logger));
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Triangle Black API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT || 3000);
}
```
