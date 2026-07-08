# Errors -- Error Response Format & Codes

All API errors follow a consistent JSON format.

## Error Response Envelope

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "checkIn",
      "message": "checkIn must be a future date",
      "code": "IS_FUTURE_DATE"
    }
  ],
  "meta": {
    "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-06-30T14:30:00Z",
    "path": "/api/v1/bookings",
    "method": "POST"
  }
}
```

## Error Fields

| Field        | Type              | Description                                 |
| ------------ | ----------------- | ------------------------------------------- |
| `statusCode` | number            | HTTP status code                            |
| `error`      | string            | Short error name                            |
| `message`    | string or string[] | Human-readable error description            |
| `details`    | array (optional)  | Field-level validation errors               |
| `meta`       | object            | Request metadata for debugging              |

## Standard Error Codes

### 4xx Client Errors

| Code  | Error                  | Typical Cause                        |
| ----- | ---------------------- | ------------------------------------ |
| 400   | `BAD_REQUEST`          | Malformed JSON, invalid query params |
| 401   | `UNAUTHORIZED`         | Missing or invalid JWT               |
| 401   | `TOKEN_EXPIRED`        | Access token expired                 |
| 403   | `FORBIDDEN`            | Insufficient role/permissions        |
| 404   | `NOT_FOUND`            | Resource ID not found                |
| 409   | `CONFLICT`             | Duplicate email, double booking      |
| 422   | `UNPROCESSABLE_ENTITY` | Business rule violation              |
| 429   | `RATE_LIMIT_EXCEEDED`  | Too many requests                    |

### 5xx Server Errors

| Code  | Error                  | Typical Cause                        |
| ----- | ---------------------- | ------------------------------------ |
| 500   | `INTERNAL_ERROR`       | Unexpected exception                 |
| 502   | `BAD_GATEWAY`          | Upstream service failure             |
| 503   | `SERVICE_UNAVAILABLE`  | Database unreachable, maintenance    |

## Business Error Codes (422)

| Code                        | Message                                       |
| --------------------------- | --------------------------------------------- |
| `BOOKING_OVERLAP`           | Property is already booked for those dates    |
| `PROPERTY_UNAVAILABLE`      | Property does not have availability           |
| `GUEST_ALREADY_CHECKED_IN`  | Guest already has an active stay              |
| `BOOKING_CANNOT_BE_CANCELLED` | Booking cannot be cancelled in current state |
| `PAYMENT_ALREADY_PROCESSED` | Payment already exists for this booking       |
| `INSUFFICIENT_INVENTORY`    | Not enough units available                    |
| `CHECK_IN_TOO_EARLY`        | Check-in must be at least 1 hour from now     |
| `MAX_OCCUPANCY_EXCEEDED`    | Guest count exceeds property max occupancy    |
| `EMAIL_ALREADY_EXISTS`      | Email is already registered                   |
| `INVALID_PROMO_CODE`        | Promo code not found or expired               |

## Exception Filter (Backend)

```typescript
// common/exceptions/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = "Internal Server Error";
    let message = "An unexpected error occurred";
    let details: any[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
        error = getErrorMessage(status);
      } else if (typeof res === "object") {
        message = (res as any).message || message;
        error = (res as any).error || getErrorMessage(status);
        details = (res as any).details;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.CONFLICT;
      error = "Conflict";
      message = handlePrismaError(exception);
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      ...(details && { details }),
      meta: {
        requestId: (request as any).correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    });
  }
}
```

## Validation Error Details

Validation errors include field-level details:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "email must be a valid email", "code": "IS_EMAIL" },
    { "field": "password", "message": "password must be at least 8 characters", "code": "MIN_LENGTH" }
  ],
  "meta": { ... }
}
```

## Error Handling in Frontend

```typescript
// src/lib/api/client.ts
const api = ky.extend({
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (!response.ok) {
          const error = await response.json<ApiError>();
          toast.error(error.message);
          if (error.statusCode === 401) {
            redirect("/login");
          }
          throw error;
        }
      },
    ],
  },
});
```