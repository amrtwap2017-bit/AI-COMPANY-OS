# Clean Architecture

## Layer Structure

Each NestJS module follows clean architecture principles with four distinct layers.

```
┌────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  Controllers, DTOs, Guards, Interceptors, Filters        │
│  HTTP concerns only — no business logic                  │
├────────────────────────────────────────────────────────┤
│                   Application Layer                       │
│  Use Cases / Application Services, Port interfaces       │
│  Orchestrates domain objects, coordinates workflows      │
├────────────────────────────────────────────────────────┤
│                    Domain Layer (Core)                    │
│  Entities, Aggregates, Value Objects, Domain Events      │
│  Business rules — no framework dependencies              │
├────────────────────────────────────────────────────────┤
│                 Infrastructure Layer                      │
│  Prisma repositories, external API clients, file storage │
│  Implements Port interfaces from Application layer       │
└────────────────────────────────────────────────────────┘
```

## Layer Rules (Dependency Rule)

Dependencies point **inward only**:

```
Presentation ──► Application ──► Domain
     │                                ▲
     └─────────── Infrastructure ─────┘
```

- **Presentation** depends on Application (calls use cases)
- **Application** depends on Domain (uses entities, defines ports)
- **Domain** has zero dependencies on any other layer or framework
- **Infrastructure** implements Application ports; depends on both Domain and Application

## Directory Structure per Module

```
modules/reservations/
├── presentation/
│   ├── reservations.controller.ts
│   ├── reservations.controller.spec.ts
│   ├── dtos/
│   │   ├── create-reservation.dto.ts
│   │   └── search-reservations.dto.ts
│   └── guards/
│       └── reservation-ownership.guard.ts
├── application/
│   ├── use-cases/
│   │   ├── create-reservation.use-case.ts
│   │   ├── cancel-reservation.use-case.ts
│   │   └── check-in.use-case.ts
│   └── ports/
│       ├── reservation.repository.interface.ts
│       └── payment.service.interface.ts
├── domain/
│   ├── entities/
│   │   ├── reservation.entity.ts
│   │   └── reservation-guest.entity.ts
│   ├── value-objects/
│   │   ├── money.ts
│   │   ├── date-range.ts
│   │   └── booking-status.ts
│   ├── events/
│   │   ├── reservation-created.event.ts
│   │   └── reservation-cancelled.event.ts
│   └── services/
│       ├── pricing.service.ts
│       └── availability.service.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-reservation.repository.ts
│   │   └── prisma-mappers.ts
│   ├── external/
│   │   ├── stripe-payment.service.ts
│   │   └── ota-integration.service.ts
│   └── config/
│       └── reservation.config.ts
└── reservations.module.ts
```

## Layer Responsibilities

### Domain Layer (`domain/`)

- **Entities** — objects with identity, mutable state, business rules
- **Value Objects** — immutable, no identity, equality by value
- **Domain Events** — what happened (past tense), triggers side effects
- **Domain Services** — stateless operations involving multiple entities
- **Zero framework imports** — pure TypeScript only

### Application Layer (`application/`)

- **Use Cases / Application Services** — single-responsibility orchestration
- **Port Interfaces** — contracts for infrastructure to implement
- **DTOs** — data transfer objects for input/output
- **No HTTP imports** — no `@Req`, `@Res`, `@Headers`

### Infrastructure Layer (`infrastructure/`)

- **Repository implementations** — Prisma-specific data access
- **External service clients** — Stripe, SendGrid, OTA APIs
- **Mappers** — translate between domain and persistence models
- **Config** — environment-specific infrastructure configuration

### Presentation Layer (`presentation/`)

- **Controllers** — route handling, request parsing
- **DTOs** — input validation (class-validator / Zod)
- **Guards** — authentication, authorization
- **Interceptors** — logging, transformation, timing
- **Filters** — exception handling, error formatting

## Why Clean Architecture?

1. **Testability** — domain logic tests without framework or database
2. **Framework independence** — swap Express for Fastify without touching domain
3. **Database independence** — swap Prisma for TypeORM by changing only infrastructure
4. **Use-case clarity** — each use case is a class with a single `execute()` method
5. **Module isolation** — modules communicate only through Application interfaces
