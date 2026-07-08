# Repository Pattern with Prisma

The Repository pattern decouples data access from business logic. All Prisma queries are encapsulated in repository classes; no other part of the codebase imports Prisma directly.

## Base Repository

```typescript
// database/base.repository.ts
export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract get model(): PrismaDelegate;

  async create(dto: CreateDto): Promise<T> {
    return this.model.create({ data: dto });
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(params: PaginationParams, filters?: any, sort?: SortParams): Promise<PaginatedResult<T>> {
    const [data, total] = await this.prisma.$transaction([
      this.model.findMany({
        where: filters,
        orderBy: sort ? { [sort.field]: sort.direction } : { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.model.count({ where: filters }),
    ]);
    return { data, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
  }

  async update(id: string, dto: UpdateDto): Promise<T> {
    return this.model.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}
```

## Feature Repository Example

```typescript
// modules/bookings/bookings.repository.ts
@Injectable()
export class BookingRepository extends BaseRepository<Booking, CreateBookingDto, UpdateBookingDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.booking;
  }

  async findByDateRange(propertyId: string, start: Date, end: Date): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        propertyId,
        OR: [
          { checkIn: { lte: end }, checkOut: { gte: start } },
        ],
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });
  }

  async findUpcomingCheckIns(date: Date): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: { checkIn: { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }, status: 'CONFIRMED' },
      include: { guest: true, property: true },
    });
  }
}
```

## PrismaService

```typescript
// database/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

## Rules

1. **No raw Prisma calls in controllers or services** — always call a repository method.
2. **Repositories return domain types** — the shape matches Prisma models, not external DTOs.
3. **Complex joins / aggregations** live in the repository, not the service.
4. **Transactions** are handled at the service layer using `this.prisma.$transaction(...)`.
5. **Soft deletes** use a `deletedAt` column; repositories expose `findActive()` / `deleteSoft()` helpers.
