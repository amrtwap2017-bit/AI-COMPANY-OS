# Endpoints -- V1 API Reference

All endpoints are prefixed with `/v1`. Request and response bodies are JSON.

## Auth

### `POST /v1/auth/login`

Authenticate user and return tokens.

```
Request Body:
{
  "email": "admin@triangleblack.com",
  "password": "securePassword123"
}

Response 200:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "admin@triangleblack.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### `POST /v1/auth/register`

Create new user account.

```
Request Body:
{
  "name": "New User",
  "email": "user@example.com",
  "password": "securePassword123"
}

Response 201:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "uuid", "email": "user@example.com", "name": "New User", "role": "GUEST" }
}
```

### `POST /v1/auth/refresh`

Get new access token.

```
Request Body: { "refreshToken": "eyJ..." }
Response 200: { "accessToken": "eyJ..." }
```

### `POST /v1/auth/logout`

Invalidate refresh token. Requires JWT.

```
Headers: Authorization: Bearer <accessToken>
Response: 204 No Content
```

## Users

### `GET /v1/users`

List users (admin only).

```
Query: ?page=1&limit=20&role=MANAGER&search=john
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MANAGER",
      "isActive": true,
      "lastLogin": "2026-06-29T10:00:00Z",
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

### `GET /v1/users/:id`

Get user details.

```
Response 200:
{
  "data": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "MANAGER", "isActive": true, "permissions": ["bookings:read", "bookings:write"], "createdAt": "2026-01-15T08:00:00Z", "updatedAt": "2026-06-29T10:00:00Z" }
}
```

### `PATCH /v1/users/:id`

Update user.

```
Request Body: { "name": "John Updated", "role": "ADMIN" }
Response 200: { "data": { ...updated user } }
```

### `DELETE /v1/users/:id`

Deactivate user (soft delete).

```
Response: 204 No Content
```

## Properties

### `GET /v1/properties`

List properties.

```
Query: ?page=1&limit=20&type=HOTEL&status=ACTIVE&search=beach
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "Beachfront Villa",
      "type": "VILLA",
      "maxGuests": 8,
      "baseRate": 1500.00,
      "currency": "SAR",
      "status": "ACTIVE",
      "amenities": ["POOL", "WIFI", "PARKING"],
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 }
}
```

### `GET /v1/properties/:id`

Get property details.

```
Response 200:
{
  "data": {
    "id": "uuid",
    "name": "Beachfront Villa",
    "description": "A beautiful villa...",
    "type": "VILLA",
    "address": { "line1": "...", "city": "Jeddah", "country": "SA" },
    "maxGuests": 8,
    "baseRate": 1500.00,
    "currency": "SAR",
    "status": "ACTIVE",
    "amenities": ["POOL", "WIFI", "PARKING"],
    "images": [{ "url": "https://...", "isPrimary": true }],
    "createdAt": "2026-03-01T00:00:00Z",
    "updatedAt": "2026-06-15T12:00:00Z"
  }
}
```

### `POST /v1/properties`

Create property.

```
Request Body:
{
  "name": "New Villa",
  "type": "VILLA",
  "address": { "line1": "123 Street", "city": "Jeddah", "country": "SA" },
  "maxGuests": 6,
  "baseRate": 1200.00,
  "currency": "SAR",
  "amenities": ["WIFI", "POOL"]
}

Response 201: { "data": { ...created property } }
```

### `PATCH /v1/properties/:id`

Update property.

```
Request Body: { "baseRate": 1300.00, "status": "MAINTENANCE" }
Response 200: { "data": { ...updated property } }
```

### `DELETE /v1/properties/:id`

Archive property (soft delete).

```
Response: 204 No Content
```

## Bookings

### `GET /v1/bookings`

List bookings.

```
Query: ?page=1&limit=20&status=CONFIRMED&propertyId=uuid&guestId=uuid&dateFrom=2026-06-01&dateTo=2026-06-30&sort=checkIn&direction=asc
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "propertyName": "Beachfront Villa",
      "guestId": "uuid",
      "guestName": "Ahmed Ali",
      "checkIn": "2026-07-01",
      "checkOut": "2026-07-05",
      "adults": 2,
      "children": 1,
      "status": "CONFIRMED",
      "total": 6000.00,
      "currency": "SAR",
      "createdAt": "2026-06-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

### `GET /v1/bookings/:id`

Get booking details.

```
Response 200:
{
  "data": {
    "id": "uuid",
    "property": { "id": "uuid", "name": "Beachfront Villa" },
    "guest": { "id": "uuid", "name": "Ahmed Ali", "email": "ahmed@example.com", "phone": "+966..." },
    "checkIn": "2026-07-01",
    "checkOut": "2026-07-05",
    "adults": 2,
    "children": 1,
    "status": "CONFIRMED",
    "addons": [{ "name": "Extra Bed", "price": 200.00 }],
    "subtotal": 6000.00,
    "discount": 0,
    "total": 6000.00,
    "currency": "SAR",
    "paymentStatus": "PAID",
    "notes": "Late arrival",
    "createdAt": "2026-06-15T10:00:00Z",
    "updatedAt": "2026-06-15T10:00:00Z"
  }
}
```

### `POST /v1/bookings`

Create booking.

```
Request Body:
{
  "propertyId": "uuid",
  "guestId": "uuid",
  "checkIn": "2026-07-01",
  "checkOut": "2026-07-05",
  "adults": 2,
  "children": 1,
  "addons": ["EXTRA_BED"],
  "notes": "Late arrival",
  "source": "DIRECT"
}

Response 201: { "data": { ...created booking } }
```

### `PATCH /v1/bookings/:id`

Update booking.

```
Request Body: { "checkOut": "2026-07-06", "addons": ["EXTRA_BED", "BREAKFAST"] }
Response 200: { "data": { ...updated booking } }
```

### `DELETE /v1/bookings/:id`

Cancel booking.

```
Response: 204 No Content
```

### `POST /v1/bookings/:id/check-in`

Record check-in.

```
Request Body: { "idDocument": "AB123456", "notes": "Arrived 2pm" }
Response 200: { "data": { ...booking with status CHECKED_IN } }
```

### `POST /v1/bookings/:id/check-out`

Record check-out.

```
Request Body: { "finalBalance": 0, "notes": "Departed 11am" }
Response 200: { "data": { ...booking with status CHECKED_OUT } }
```

### `GET /v1/bookings/upcoming`

Get upcoming arrivals.

```
Query: ?date=2026-07-01
Response 200:
{
  "data": [
    { "id": "uuid", "guestName": "Ahmed Ali", "propertyName": "Beachfront Villa", "checkIn": "2026-07-01", "status": "CONFIRMED" }
  ]
}
```

## Guests

### `GET /v1/guests`

List guests.

```
Query: ?page=1&limit=20&search=ahmed&nationality=SA
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "nationality": "SA",
      "totalStays": 3,
      "lastStay": "2026-05-20",
      "createdAt": "2026-01-10T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 120, "totalPages": 6 }
}
```

### `GET /v1/guests/:id`

Get guest profile.

```
Response 200:
{
  "data": {
    "id": "uuid",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "nationality": "SA",
    "idDocument": { "type": "NATIONAL_ID", "number": "AB123456" },
    "preferences": { "roomType": "NON_SMOKING", "floor": "HIGH" },
    "totalStays": 3,
    "totalSpent": 18000.00,
    "recentBookings": [ ... ],
    "createdAt": "2026-01-10T00:00:00Z"
  }
}
```

### `POST /v1/guests`

Register guest.

```
Request Body:
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "phone": "+966501234567",
  "nationality": "SA",
  "idDocument": { "type": "NATIONAL_ID", "number": "AB123456" }
}

Response 201: { "data": { ...created guest } }
```

### `PATCH /v1/guests/:id`

Update guest.

```
Request Body: { "email": "newemail@example.com", "phone": "+966507654321" }
Response 200: { "data": { ...updated guest } }
```

## Housekeeping

### `GET /v1/housekeeping/tasks`

List housekeeping tasks.

```
Query: ?status=PENDING&propertyId=uuid&assignedTo=uuid&priority=HIGH
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "propertyName": "Room 101",
      "taskType": "CLEANING",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "assignedTo": { "id": "uuid", "name": "Staff Name" },
      "scheduledAt": "2026-06-30T10:00:00Z",
      "notes": "Deep clean requested",
      "createdAt": "2026-06-30T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
}
```

### `POST /v1/housekeeping/tasks`

Create task.

```
Request Body:
{
  "propertyId": "uuid",
  "taskType": "CLEANING",
  "priority": "NORMAL",
  "scheduledAt": "2026-06-30T14:00:00Z",
  "notes": "Check-in tomorrow"
}

Response 201: { "data": { ...created task } }
```

### `PATCH /v1/housekeeping/tasks/:id`

Update task (assign, complete, reschedule).

```
Request Body: { "status": "COMPLETED", "completedAt": "2026-06-30T11:00:00Z" }
Response 200: { "data": { ...updated task } }
```

### `GET /v1/housekeeping/summary`

Get housekeeping summary.

```
Response 200:
{
  "data": {
    "total": 20,
    "clean": 12,
    "dirty": 5,
    "inspection": 3,
    "outOfOrder": 0,
    "maintenance": 0
  }
}
```

## Finance

### `GET /v1/finance/payments`

List payments.

```
Query: ?page=1&limit=20&status=COMPLETED&method=CREDIT_CARD&dateFrom=2026-06-01&dateTo=2026-06-30
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "guestName": "Ahmed Ali",
      "amount": 6000.00,
      "currency": "SAR",
      "method": "CREDIT_CARD",
      "status": "COMPLETED",
      "transactionId": "txn_abc123",
      "paidAt": "2026-06-15T10:05:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

### `POST /v1/finance/payments`

Process payment.

```
Request Body:
{
  "bookingId": "uuid",
  "amount": 6000.00,
  "method": "CREDIT_CARD",
  "paymentToken": "tok_abc123"
}

Response 201: { "data": { ...payment with status PROCESSING } }
```

### `GET /v1/finance/invoices`

List invoices.

```
Query: ?page=1&limit=20&status=PAID&bookingId=uuid
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2026-0001",
      "bookingId": "uuid",
      "guestName": "Ahmed Ali",
      "amount": 6000.00,
      "currency": "SAR",
      "status": "PAID",
      "issuedAt": "2026-06-15T10:00:00Z",
      "dueAt": "2026-06-20T00:00:00Z",
      "paidAt": "2026-06-15T10:05:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

## Reports

### `GET /v1/reports/dashboard`

Dashboard KPI data.

```
Query: ?period=month&dateFrom=2026-06-01&dateTo=2026-06-30
Response 200:
{
  "data": {
    "occupancyRate": 72.5,
    "revenue": 250000.00,
    "averageDailyRate": 850.00,
    "revPAR": 616.25,
    "checkInsToday": 12,
    "checkOutsToday": 10,
    "inHouseGuests": 45,
    "pendingTasks": 5,
    "comparisons": {
      "occupancyRate": { "value": 5.2, "direction": "up" },
      "revenue": { "value": 12.5, "direction": "up" }
    }
  }
}
```

### `GET /v1/reports/occupancy`

Occupancy report.

```
Query: ?propertyId=uuid&dateFrom=2026-06-01&dateTo=2026-06-30&groupBy=day
Response 200:
{
  "data": [
    { "date": "2026-06-01", "occupancy": 65.0, "available": 20, "occupied": 13 },
    { "date": "2026-06-02", "occupancy": 70.0, "available": 20, "occupied": 14 }
  ]
}
```

### `GET /v1/reports/revenue`

Revenue report.

```
Query: ?propertyId=uuid&dateFrom=2026-01-01&dateTo=2026-06-30&groupBy=month
Response 200:
{
  "data": [
    { "period": "2026-01", "revenue": 120000.00, "bookings": 45, "adr": 800.00 },
    { "period": "2026-02", "revenue": 135000.00, "bookings": 50, "adr": 820.00 }
  ]
}
```

## Health

### `GET /v1/health`

Liveness check.

```
Response 200:
{
  "status": "ok",
  "info": { "database": { "status": "up" }, "memory": { "status": "up" } },
  "timestamp": "2026-06-30T14:30:00Z"
}
```

### `GET /v1/health/ready`

Readiness check.

```
Response 200: { "status": "ok", "info": { "database": { "status": "up" } } }
```