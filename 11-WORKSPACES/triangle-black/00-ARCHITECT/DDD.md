# Domain-Driven Design (DDD)

## Strategic Design

### Domain

Triangle Black operates in the **hospitality operations** domain. The core business involves managing hotel/lodging properties, guest reservations, billing, housekeeping, and related operational workflows.

### Ubiquitous Language

| Term | Definition |
|------|-----------|
| **Property** | A hotel, inn, or lodging establishment |
| **Unit** | A bookable room, suite, cabin, or bed |
| **Guest** | A person who stays at a property |
| **Reservation** | A booking for one or more units for a date range |
| **Folio** | The financial record of charges/payments for a stay |
| **Rate Plan** | Pricing rules for units across date ranges |
| **OTA** | Online Travel Agency (Expedia, Booking.com, etc.) |
| **Channel** | A distribution channel (direct, OTA, GDS, wholesale) |
| **Housekeeping Status** | Dirty, Clean, Inspected, Out-of-Order |
| **Segment** | Market segment (corporate, leisure, group, etc.) |
| **Arrival/Departure** | Guest check-in and check-out dates |

### Bounded Contexts

```
┌──────────────────────────────────────────────────────────┐
│                     Triangle Black                         │
│                                                           │
│  ┌────────────────────┐  ┌────────────────────────────┐  │
│  │     Reservation    │  │        Billing              │  │
│  │     Management     │  │    (Folios, Payments,       │  │
│  │ (Bookings, Avail.) │──│     Invoices, Charges)      │  │
│  └────────┬───────────┘  └────────────────────────────┘  │
│           │                                               │
│  ┌────────┴───────────┐  ┌────────────────────────────┐  │
│  │      Property       │  │      Housekeeping           │  │
│  │    (Units, Rates,   │  │   (Tasks, Status,          │  │
│  │  Amenities, Config) │──│     Schedules)              │  │
│  └────────────────────┘  └────────────────────────────┘  │
│                                                           │
│  ┌────────────────────┐  ┌────────────────────────────┐  │
│  │       Guests        │  │       Analytics             │  │
│  │  (Profile, History, │  │   (Reporting, Dashboards,  │  │
│  │   Preferences)      │  │     KPIs, Insights)         │  │
│  └────────────────────┘  └────────────────────────────┘  │
│                                                           │
│  ┌────────────────────┐  ┌────────────────────────────┐  │
│  │      Channel       │  │        AI Agent             │  │
│  │    (OTA Sync,      │  │   (Chat, Recommendations,  │  │
│  │  Availability Dist) │  │     Automation) [V2+]      │  │
│  └────────────────────┘  └────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Context Map

| Context | Relationships |
|---------|--------------|
| Reservation Management | Uses Property (units, rates), Creates Guest, Produces Billing events |
| Billing | Consumes Reservation events, Uses Guest for payment methods |
| Property | Independent aggregate root, referenced by Reservation |
| Housekeeping | Consumes Reservation (departure triggers cleaning) |
| Guests | Customer/supplier for Reservation; consumed by Analytics |
| Channel | Pushes/pulls from Reservation and Property |

## Tactical Design

### Aggregates

**Reservation Aggregate**
```
Reservation (Root)
├── ReservationUnit (1..*)
├── ReservationGuest (1..*)
├── Payment (0..*)
└── Note (0..*)
```

**Property Aggregate**
```
Property (Root)
├── Unit (1..*)
├── RatePlan (1..*)
├── Amenity (0..*)
└── PropertyImage (0..*)
```

**Guest Aggregate**
```
Guest (Root)
├── GuestAddress (0..1)
├── GuestContact (0..*)
├── LoyaltyProgram (0..1)
└── Preference (0..*)
```

### Value Objects (Examples)

```
DateRange { startDate, endDate }
Money { amount, currency }
Address { street, city, state, zip, country }
BookingStatus (enum: Pending, Confirmed, CheckedIn, CheckedOut, Cancelled, NoShow)
UnitStatus (enum: Available, Occupied, Dirty, Maintenance, OutOfOrder)
PaymentMethod (enum: CreditCard, Cash, Invoice, OTACommission)
```

### Domain Events

| Event | Trigger | Consumers |
|-------|---------|-----------|
| `ReservationCreated` | New booking | Billing, Housekeeping, Channel |
| `ReservationCancelled` | Cancellation | Billing (refund), Housekeeping, Channel |
| `GuestCheckedIn` | Arrival | Billing (open folio), Housekeeping |
| `GuestCheckedOut` | Departure | Billing (close folio, send invoice), Housekeeping |
| `PaymentReceived` | Payment posted | Reservation, Analytics |
| `PropertyRateChanged` | Rate update | Channel |

### Repositories

Each aggregate root has a corresponding repository interface in the Application layer:

- `ReservationRepository` — lookup by ID, guest, date range, status
- `PropertyRepository` — lookup by ID, slug, status
- `GuestRepository` — lookup by ID, email, phone
- `UnitRepository` — lookup by property, status, date range availability

### Domain Services

Business logic that doesn't naturally fit on an entity:

- `PricingService` — calculates rate based on rate plan, length of stay, occupancy
- `AvailabilityService` — checks unit availability across date ranges, channels
- `OverbookingService` — manages overbooking thresholds and policies
- `CancellationService` — applies cancellation policy, calculates fees

## Module Mapping

| NestJS Module | DDD Bounded Context |
|--------------|-------------------|
| `AuthModule` | Platform (subdomain) |
| `TenantModule` | Platform (subdomain) |
| `PropertyModule` | Property |
| `ReservationModule` | Reservation Management |
| `GuestModule` | Guests |
| `BillingModule` | Billing |
| `InventoryModule` | Property / Reservation |
| `HousekeepingModule` | Housekeeping |
| `ChannelModule` | Channel |
| `AnalyticsModule` | Analytics |
| `AiAgentModule` | AI Agent [V2+] |
