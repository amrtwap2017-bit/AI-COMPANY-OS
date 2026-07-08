# CQRS Implementation

Triangle Black uses the **CQRS pattern** via `@nestjs/cqrs` to separate write models (Commands) from read models (Queries). This provides a clear audit trail, facilitates event sourcing readiness, and keeps the codebase organized as domain complexity grows.

## Setup

```typescript
// app.module.ts
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
})
export class AppModule {}
```

## Commands

A Command is a plain object representing an intent to change state. It is immutable and named in the imperative tense.

```typescript
// commands/create-booking.command.ts
export class CreateBookingCommand {
  constructor(
    public readonly propertyId: string,
    public readonly guestId: string,
    public readonly checkIn: Date,
    public readonly checkOut: Date,
    public readonly adults: number,
    public readonly children: number,
    public readonly requestedBy: string,
  ) {}
}
```

### Command Handler

```typescript
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateBookingCommand): Promise<Booking> {
    const booking = await this.bookingRepository.create({ ...command });
    this.eventBus.publish(new BookingCreatedEvent(booking));
    return booking;
  }
}
```

### Dispatching Commands

```typescript
await commandBus.execute(new CreateBookingCommand(propId, guestId, checkIn, checkOut, 2, 0, userId));
```

## Queries

A Query retrieves data without side effects. Named with a `Get`/`List` prefix.

```typescript
// queries/list-bookings.query.ts
export class ListBookingsQuery {
  constructor(
    public readonly pagination: PaginationParams,
    public readonly filters?: BookingFilters,
    public readonly sort?: SortParams,
  ) {}
}
```

### Query Handler

```typescript
@QueryHandler(ListBookingsQuery)
export class ListBookingsHandler implements IQueryHandler<ListBookingsQuery> {
  constructor(
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(query: ListBookingsQuery): Promise<PaginatedResult<Booking>> {
    return this.bookingRepository.findAll(query.pagination, query.filters, query.sort);
  }
}
```

### Dispatching Queries

```typescript
const result = await queryBus.execute(new ListBookingsQuery(pagination, filters, sort));
```

## Events

Domain events are published after successful command execution. Event handlers react asynchronously.

```typescript
@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHandler implements IEventHandler<BookingCreatedEvent> {
  constructor(
    private readonly notificationService: NotificationsService,
    private readonly financeService: FinanceService,
  ) {}

  async handle(event: BookingCreatedEvent) {
    await this.notificationService.sendBookingConfirmation(event.booking);
    await this.financeService.createPaymentIntent(event.booking);
  }
}
```

## Controller Wiring

Controllers dispatch commands/queries and return results without direct service coupling:

```typescript
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateBookingDto, @CurrentUser() user: AuthUser) {
    const booking = await this.commandBus.execute(
      new CreateBookingCommand(dto.propertyId, dto.guestId, dto.checkIn, dto.checkOut, dto.adults, dto.children, user.id),
    );
    return booking;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetBookingQuery(id));
  }
}
```

## When to Use Each Pattern

| Pattern    | Use when...                                    |
| ---------- | ---------------------------------------------- |
| Command    | Creating, updating, deleting data              |
| Query      | Fetching data with no side effects             |
| Event      | Reacting to state changes (notifications, logs, integrations) |
