# Events — Domain Event Handling

Domain events are published by command handlers and consumed asynchronously by event handlers. Events are immutable records of something that happened.

## Event Bus

The NestJS `EventBus` publishes events from command handlers. `EventsHandler` decorators subscribe to events.

```typescript
// In command handler
this.eventBus.publish(new BookingCreatedEvent(booking));
```

## Domain Events

| Event                       | Published By                    | Trigger                              |
| --------------------------- | ------------------------------- | ------------------------------------ |
| `BookingCreatedEvent`       | `CreateBookingHandler`          | New reservation placed               |
| `BookingUpdatedEvent`       | `UpdateBookingHandler`          | Booking modified                     |
| `BookingCancelledEvent`     | `CancelBookingHandler`          | Booking cancelled                    |
| `GuestCheckedInEvent`       | `CheckInGuestHandler`           | Guest arrives and checks in          |
| `GuestCheckedOutEvent`      | `CheckOutGuestHandler`          | Guest departs                        |
| `PaymentProcessedEvent`     | `ProcessPaymentHandler`         | Payment successfully charged         |
| `PaymentRefundedEvent`      | `RefundPaymentHandler`          | Refund processed                     |
| `GuestCreatedEvent`         | `CreateGuestHandler`            | New guest registered                 |
| `PropertyCreatedEvent`      | `CreatePropertyHandler`         | New property added                   |
| `TaskAssignedEvent`         | `AssignTaskHandler`             | Housekeeping task assigned           |
| `InvoiceGeneratedEvent`     | `CreateInvoiceHandler`          | Invoice created for booking          |
| `UserRegisteredEvent`       | `RegisterHandler`               | New user account created             |
| `LowOccupancyAlertEvent`    | (Scheduled)                     | Occupancy drops below threshold      |
| `CheckInReminderEvent`      | (Scheduled)                     | 24h before check-in                  |

## Event Definition

```typescript
// events/booking-created.event.ts
export class BookingCreatedEvent {
  constructor(
    public readonly booking: Booking,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
```

## Event Handler

```typescript
// modules/bookings/event-handlers/booking-created.handler.ts
@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHandler implements IEventHandler<BookingCreatedEvent> {
  constructor(
    private readonly notificationService: NotificationsService,
    private readonly financeService: FinanceService,
    private readonly integrationService: IntegrationsService,
  ) {}

  async handle(event: BookingCreatedEvent) {
    const { booking } = event;
    await Promise.all([
      this.notificationService.sendBookingConfirmation(booking),
      this.financeService.authorizePayment(booking),
      this.integrationService.syncBookingToPms(booking),
    ]);
  }
}
```

## Sagas (Orchestration)

For multi-step processes, sagas coordinate across events:

```typescript
@Injectable()
export class BookingSaga {
  @Saga()
  bookingCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(BookingCreatedEvent),
      delay(1000 * 60 * 30), // 30 min hold
      map((event) => {
        if (!event.booking.isConfirmed) {
          return new CancelBookingCommand(event.booking.id, 'SYSTEM', 'Payment timeout');
        }
      }),
    );
  };
}
```

## Registration

Event handlers are registered in the feature module:

```typescript
@Module({
  providers: [
    BookingCreatedHandler,
    BookingCancelledHandler,
    GuestCheckedInHandler,
    BookingSaga,
  ],
})
export class BookingsModule {}
```
