# OpenAPI -- Specification Structure & Maintenance

The API specification is maintained as an **OpenAPI 3.1** document, used as the source of truth for all API contracts.

## Spec Location

```
openapi/
├── openapi.yaml              -- Root spec file (imports components)
├── paths/
│   ├── auth.yaml
│   ├── bookings.yaml
│   ├── properties.yaml
│   ├── guests.yaml
│   ├── housekeeping.yaml
│   ├── finance.yaml
│   ├── reports.yaml
│   ├── users.yaml
│   └── health.yaml
├── components/
│   ├── schemas/
│   │   ├── Booking.yaml
│   │   ├── Property.yaml
│   │   ├── Guest.yaml
│   │   ├── User.yaml
│   │   ├── Payment.yaml
│   │   ├── Invoice.yaml
│   │   ├── HousekeepingTask.yaml
│   │   ├── ApiResponse.yaml
│   │   ├── PaginatedResponse.yaml
│   │   └── ErrorResponse.yaml
│   ├── parameters/
│   │   ├── pagination.yaml
│   │   └── filters.yaml
│   ├── headers/
│   │   └── correlation-id.yaml
│   └── securitySchemes/
│       ├── jwt.yaml
│       └── apiKey.yaml
└── examples/
    ├── booking-created.json
    ├── booking-list.json
    └── error-validation.json
```

## Root Structure

```yaml
# openapi/openapi.yaml
openapi: 3.1.0
info:
  title: Triangle Black API
  description: Hospitality management platform API
  version: 1.0.0
  contact:
    name: Engineering Team
    email: dev@triangleblack.com
servers:
  - url: https://api.triangleblack.com/v1
    description: Production
  - url: https://api-staging.triangleblack.com/v1
    description: Staging
paths:
  /auth/login:
    $ref: paths/auth.yaml#/paths/~1auth~1login
  /bookings:
    $ref: paths/bookings.yaml#/paths/~1bookings
  /bookings/{id}:
    $ref: paths/bookings.yaml#/paths/~1bookings~1{id}
components:
  securitySchemes:
    $ref: components/securitySchemes/jwt.yaml
  schemas:
    Booking:
      $ref: components/schemas/Booking.yaml
    Property:
      $ref: components/schemas/Property.yaml
```

## How the Spec Is Maintained

### Workflow

1. Backend developer creates or modifies a NestJS controller
2. Changes are reflected in the OpenAPI spec file (manual update or auto-generated)
3. Spec is committed alongside the implementation code
4. CI validates spec against implementation (contract testing)
5. Frontend types are regenerated from the spec via `openapi-typescript`

### Auto-Generation (NestJS Swagger)

In development, the spec can be auto-generated from decorators and served via Swagger UI:

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

const config = new DocumentBuilder()
  .setTitle("Triangle Black API")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);

// Export for external use
import * as fs from "fs";
fs.writeFileSync("./openapi/openapi.json", JSON.stringify(document, null, 2));
```

### Decorator Usage

```typescript
@ApiTags("Bookings")
@Controller("bookings")
export class BookingsController {
  @Post()
  @ApiOperation({ summary: "Create a new booking" })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: "Booking created", type: BookingResponseDto })
  @ApiResponse({ status: 409, description: "Booking overlap conflict" })
  async create(@Body() dto: CreateBookingDto) {
    // ...
  }
}
```

## Client Generation

Frontend types are generated from the OpenAPI spec:

```bash
pnpm add -D openapi-typescript
pnpm openapi-typescript ./openapi/openapi.yaml -o ./src/types/api.ts
```

This generates fully typed fetch functions and response types.

## Contract Testing

```
+-----------+         +------------+        +------------+
|  OpenAPI  | ------> |  Backend   | -----> |  Frontend  |
|  Spec     |         |  (NestJS)  |        |  (Next.js) |
|           |         |            |        |            |
|           | <------ |  Validation| <----- |  Type gen  |
+-----------+         +------------+        +------------+
```

Contract tests ensure the backend implementation matches the spec.