# Input Validation

All external input is validated using **class-validator** + **class-transformer** decorators on DTOs, enforced by NestJS's global `ValidationPipe`.

## Global ValidationPipe

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    transform: true,           // Auto-transform types (string -> number)
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

## DTO Pattern

```typescript
// modules/bookings/dto/create-booking.dto.ts
export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsUUID()
  @IsNotEmpty()
  guestId: string;

  @IsDateString()
  @IsNotEmpty()
  checkIn: string;

  @IsDateString()
  @IsNotEmpty()
  checkOut: string;

  @IsInt()
  @Min(1)
  @Max(100)
  adults: number;

  @IsInt()
  @Min(0)
  @Max(50)
  children: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addons?: string[];
}
```

## Custom Validation Decorators

```typescript
// common/decorators/validators/is-future-date.decorator.ts
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && new Date(value) > new Date();
        },
        defaultMessage() {
          return '$property must be a future date';
        },
      },
    });
  };
}
```

## Validation for Query Parameters

```typescript
// common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction?: 'asc' | 'desc' = 'desc';
}
```

## DTO Naming Conventions

| Suffix         | Purpose                         | Example                  |
| -------------- | ------------------------------- | ------------------------ |
| `*Dto`         | Input validation for request    | `CreateBookingDto`       |
| `*ResponseDto` | Output shape for responses      | `BookingResponseDto`     |
| `*FilterDto`   | Filtering query parameters      | `BookingFilterDto`       |
| `*ParamsDto`   | Route params validation         | `BookingParamsDto`       |

## Error Messages

Validation errors return a consistent format:

```json
{
  "statusCode": 400,
  "message": [
    "checkIn must be a future date",
    "adults must not be greater than 100"
  ],
  "error": "Bad Request"
}
```
