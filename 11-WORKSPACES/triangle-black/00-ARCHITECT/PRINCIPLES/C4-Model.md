# C4 Model

This document describes the Triangle Black system using the C4 model for visualizing software architecture.

## Level 1: Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Person] Hotel Staff                                                │
│  Uses the system to manage reservations, guests, billing, and        │
│  housekeeping operations daily.                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  [Software System] Triangle Black Digital Operations Ecosystem        │
│                                                         │
│  A multi-tenant hospitality operations platform that manages         │
│  properties, reservations, guests, billing, housekeeping, and        │
│  channel distribution.                                               │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ Auth System  │  │ Payment     │  │ Email       │                 │
│  │ (JWT-based)  │  │ (Stripe)    │  │ (SendGrid)  │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ OTA Systems  │  │ PMS Systems │  │ SMS Gateway  │                 │
│  │ (Expedia,    │  │ (Oracle,    │  │ (Twilio)     │                 │
│  │  Booking.com)│  │  Local)     │  │              │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  [Person] Guest                                                       │
│  Interacts via booking widget or portal to make/manage reservations   │
└──────────────────────────────────────────────────────────────────────┘
```

## Level 2: Container Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [Person: Hotel Staff]                                                    │
│  [Person: Guest]                                                          │
│  [Person: Admin]                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  [Container: Web Browser]                                                 │
│  Single Page Application (React/Next.js)                                  │
│  Makes API calls to backend, renders UI                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  [Container: Nginx Reverse Proxy]                                        │
│  TLS termination, rate limiting, static file serving                      │
│  Routes: /api/* → NestJS, /* → Next.js                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  [Container: Next.js Frontend]   │  │  [Container: NestJS Backend]    │
│  App Router, SSR, React Server   │  │  Modular monolith, REST API    │
│  Components, BFF API routes      │  │  Modules: Auth, Tenant,        │
│  Port: 3000                      │  │  Property, Reservation,        │
│                                   │  │  Guest, Billing, Inventory,   │
│                                   │  │  Housekeeping, Analytics       │
│                                   │  │  Port: 4000                    │
└─────────────────────────────────┘  └───────────────┬─────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  [Container: PostgreSQL]                                                  │
│  Primary database. Schema-per-tenant isolation.                           │
│  Shared: tenants, users. Per-tenant: property, reservation, guest data    │
│  Port: 5432                                                                │
└──────────────────────────────────────────────────────────────────────────┘
                                                    ▲
                                                    │
┌──────────────────────────────────────────────────────────────────────────┐
│  [Container: Redis]                                                       │
│  Caching (API responses, session data), Bull queue backend                │
│  Port: 6379                                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

## Level 3: Component Diagram (NestJS Backend)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       [Container: NestJS Backend]                              │
│                                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ AuthModule │  │TenantModule│  │PropertyMod │  │Reservation │            │
│  │            │  │            │  │            │  │ Module     │            │
│  │ JWT Guard  │  │ Tenant     │  │ Property   │  │ Reservation│            │
│  │ Auth       │  │ Resolver   │  │ Controller  │  │ Controller │            │
│  │ Controller │  │ Controller │  │ Unit       │  │ Service    │            │
│  │ User       │  │ Service    │  │ Controller │  │ Domain     │            │
│  │ Service    │  │            │  │ RatePlan   │  │ Events     │            │
│  └─────┬──────┘  └─────┬──────┘  │ Controller │  │            │            │
│        │               │          └──────┬─────┘  └──────┬─────┘            │
│        ▼               ▼                 ▼                 ▼                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Shared Kernel                                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐   │  │
│  │  │ Prisma   │ │ Config   │ │ Logger   │ │ Common (guards,      │   │  │
│  │  │ Service  │ │ Module   │ │ (Pino)   │ │  pipes, interceptors) │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │GuestModule │  │BillingMod  │  │InventoryMod│  │Housekeeping│            │
│  │            │  │            │  │            │  │ Module     │            │
│  │ Guest      │  │ Folio      │  │ UnitStatus │  │ Task       │            │
│  │ Controller │  │ Controller │  │ Controller │  │ Controller │            │
│  │ Service    │  │ Payment    │  │ Service    │  │ Schedule   │            │
│  │            │  │ Service    │  │            │  │ Service    │            │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘            │
│                                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                             │
│  │ChannelMod  │  │AnalyticsMod│  │AIAgentMod  │                             │
│  │            │  │            │  │ (V2+)      │                             │
│  │ OTA Sync   │  │ Dashboard  │  │ Chat       │                             │
│  │ Controller │  │ Controller │  │ Controller  │                             │
│  │ Service    │  │ Report Gen │  │ Agent       │                             │
│  │            │  │ Service    │  │ Service     │                             │
│  └────────────┘  └────────────┘  └────────────┘                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Level 4: Code Diagram (Reservation Creation Flow)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Code Element: create-reservation.use-case.ts]                             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  execute(dto: CreateReservationDto): ReservationResponseDto           │  │
│  │                                                                       │  │
│  │  1. Validate input (DTO validation)                                   │  │
│  │  2. Check unit availability (AvailabilityService)                     │  │
│  │  3. Calculate price (PricingService)                                  │  │
│  │  4. Create Reservation entity (domain)                                │  │
│  │  5. Save via ReservationRepository (Prisma)                           │  │
│  │  6. Apply rate plan rules (domain service)                            │  │
│  │  7. Publish ReservationCreated event (EventBus)                       │  │
│  │  8. Return response DTO                                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Event subscribers (in other modules):                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ BillingMod   │ │Housekeeping  │ │ ChannelMod   │ │ GuestMod     │     │
│  │ Open Folio   │ │ Schedule     │ │ Push          │ │ Create if    │     │
│  │              │ │ Cleaning     │ │ Availability  │ │ new          │     │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘     │
└────────────────────────────────────────────────────────────────────────────┘
```

## C4 Diagram Legend

```
Notation:
[Person]        ──  Person (user, actor)
[Software Sys]  ──  Software System boundary
[Container]     ──  Container (app, database, etc.)
[Component]     ──  Component within a container
[Code Element]  ──  Specific code unit (class, function)

Relationships:
────►  Synchronous call (HTTP, RPC)
- - ►  Asynchronous (event, message queue)
- - -  Data flow / dependency
