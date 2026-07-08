# Backend Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma              — Database schema definition
│   ├── migrations/                — Generated migration files
│   └── seed.ts                    — Development seed script
│
├── src/
│   ├── main.ts                    — Application entry point (NestFactory)
│   ├── app.module.ts              — Root module
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   ├── exceptions/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── interfaces/
│   │   │   ├── result.interface.ts
│   │   │   └── pagination.interface.ts
│   │   └── types/
│   │       └── express.d.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/
│   │   ├── prisma.service.ts       — PrismaClient singleton
│   │   ├── prisma.module.ts
│   │   ├── base.repository.ts      — Generic CRUD repository
│   │   └── database.module.ts
│   │
│   ├── commands/                   — CQRS command definitions
│   │   ├── create-booking.command.ts
│   │   ├── update-booking.command.ts
│   │   ├── cancel-booking.command.ts
│   │   ├── check-in-guest.command.ts
│   │   ├── check-out-guest.command.ts
│   │   ├── create-property.command.ts
│   │   ├── update-property.command.ts
│   │   ├── create-user.command.ts
│   │   ├── update-user-profile.command.ts
│   │   └── process-payment.command.ts
│   └── Commands.md
│
│   ├── queries/                    — CQRS query definitions
│   │   ├── get-booking.query.ts
│   │   ├── list-bookings.query.ts
│   │   ├── get-property.query.ts
│   │   ├── list-properties.query.ts
│   │   ├── get-user.query.ts
│   │   ├── list-users.query.ts
│   │   ├── get-dashboard-stats.query.ts
│   │   └── get-occupancy-report.query.ts
│   └── Queries.md
│
│   ├── events/                     — Domain events
│   │   ├── booking-created.event.ts
│   │   ├── booking-cancelled.event.ts
│   │   ├── guest-checked-in.event.ts
│   │   ├── guest-checked-out.event.ts
│   │   └── payment-processed.event.ts
│   └── Events.md
│
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   │
│   │   ├── properties/
│   │   │   ├── properties.module.ts
│   │   │   ├── properties.controller.ts
│   │   │   ├── properties.service.ts
│   │   │   ├── properties.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-property.dto.ts
│   │   │       └── update-property.dto.ts
│   │   │
│   │   ├── bookings/
│   │   │   ├── bookings.module.ts
│   │   │   ├── bookings.controller.ts
│   │   │   ├── bookings.service.ts
│   │   │   ├── bookings.repository.ts
│   │   │   ├── command-handlers/
│   │   │   │   ├── create-booking.handler.ts
│   │   │   │   └── cancel-booking.handler.ts
│   │   │   ├── query-handlers/
│   │   │   │   ├── get-booking.handler.ts
│   │   │   │   └── list-bookings.handler.ts
│   │   │   └── dto/
│   │   │       ├── create-booking.dto.ts
│   │   │       └── booking-response.dto.ts
│   │   │
│   │   ├── guests/
│   │   │   ├── guests.module.ts
│   │   │   ├── guests.controller.ts
│   │   │   ├── guests.service.ts
│   │   │   ├── guests.repository.ts
│   │   │   └── dto/
│   │   │
│   │   ├── housekeeping/
│   │   │   ├── housekeeping.module.ts
│   │   │   ├── housekeeping.controller.ts
│   │   │   ├── housekeeping.service.ts
│   │   │   ├── housekeeping.repository.ts
│   │   │   └── dto/
│   │   │
│   │   ├── finance/
│   │   │   ├── finance.module.ts
│   │   │   ├── finance.controller.ts
│   │   │   ├── finance.service.ts
│   │   │   ├── finance.repository.ts
│   │   │   └── dto/
│   │   │
│   │   ├── reports/
│   │   │   ├── reports.module.ts
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   └── query-handlers/
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── channels/
│   │   │       ├── email.channel.ts
│   │   │       ├── sms.channel.ts
│   │   │       └── in-app.channel.ts
│   │   │
│   │   └── integrations/
│   │       ├── integrations.module.ts
│   │       └── integrations.service.ts
│   │
│   └── logger/
│       ├── logger.module.ts
│       └── logger.service.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── jest-e2e.json
│
├── Dockerfile
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.build.json
└── .env.example
```
