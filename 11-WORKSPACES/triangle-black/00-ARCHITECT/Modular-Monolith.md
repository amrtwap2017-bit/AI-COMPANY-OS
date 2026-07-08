# Modular Monolith

## Philosophy

Triangle Black uses a **modular monolith** — a single deployment unit with strongly encapsulated modules. This provides the development and testing benefits of a monolith while preserving the option to split into microservices later.

## Module Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    NestJS Application                         │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │  Tenant  │  │ Property │  │Reservation│     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬────┘     │
│       │              │              │               │         │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌──────┴──────┐  │
│  │  Guest   │  │ Billing  │  │Inventory │  │Housekeeping  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
│       │              │              │               │         │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌──────┴──────┐  │
│  │ Channel  │  │Analytics │  │Shared    │  │  AI Agent   │  │
│  │          │  │          │  │ (Lib)    │  │  (V2+)      │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│                                                               │
│  Shared Kernel:                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Common lib (guards, interceptors, pipes, base classes) │  │
│  │ Prisma service (multi-tenant connection management)    │  │
│  │ Config module (env-based configuration)                │  │
│  │ Logger (structured logging)                            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Module Communication Rules

### Internal Communication

Modules communicate via **three mechanisms only**:

| Mechanism | When to Use | Example |
|-----------|------------|---------|
| **Direct method call** (import service class) | Within the same NestJS module | PropertyService.getRates() called internally |
| **Interface-based invocation** (import interface only) | Cross-module calls that must be decoupled | Reservation module calls `PaymentServiceInterface` |
| **Domain Events** (event bus) | When side effects span modules | `ReservationCreated` → Billing opens folio |

### Cross-Module Dependency Rules

```
Rule 1: A module may depend on another module's interface, never its implementation.
Rule 2: A module may emit domain events; any module may subscribe.
Rule 3: No circular dependencies between modules.
Rule 4: Shared Kernel is available to all modules.
Rule 5: A module owns its database tables; other modules cannot query them directly.
```

### Module Dependency Graph

```
Auth  ────► Tenant
Tenant ───► Property
Property ──► Reservation, Inventory, Housekeeping
Reservation ──► Guest, Billing, Channel
Guest ──► Reservation (read-only)
Billing ──► Reservation (read-only)
Channel ──► Property, Reservation
Housekeeping ──► Property, Reservation (read-only)
Analytics ──► All (read-only, via event subscribers)
```

## Module Template

Every module follows this structure:

```
modules/{module-name}/
├── presentation/
├── application/
├── domain/
├── infrastructure/
├── {module-name}.module.ts
├── {module-name}.config.ts
└── index.ts (public exports only)
```

The `index.ts` exports **only** the interface and module class:

```typescript
// modules/reservations/index.ts
export { ReservationModule } from './reservations.module';
export { ReservationServiceInterface } from './application/ports/reservation.service.interface';
export { ReservationCreatedEvent } from './domain/events/reservation-created.event';
```

## Module Isolation Enforcement

| Mechanism | Enforcement |
|-----------|------------|
| **TypeScript barrel exports** | `index.ts` only exports public API (interfaces + module class) |
| **ESLint import restrictions** | No direct import of `infrastructure/` from other modules |
| **NestJS module imports** | Only import the module class, not internal providers |
| **Unit tests** | Mock all cross-module dependencies; test in isolation |
| **Integration tests** | Test module boundaries via event bus |

## Benefits of This Approach

1. **Simpler deployment** — single Docker image, single process
2. **Easier debugging** — single process, unified logs
3. **Faster development** — no network calls between modules
4. **Transactional consistency** — ACID across module boundaries within same database
5. **Refactoring safety** — well-defined interfaces make extraction straightforward
6. **Lower latency** — no IPC overhead between modules
