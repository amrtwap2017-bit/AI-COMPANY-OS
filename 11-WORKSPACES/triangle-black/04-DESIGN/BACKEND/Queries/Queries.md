# Queries — All Query Definitions

All CQRS queries live in `src/queries/`. Each query is a plain class with readonly properties. Queries never mutate state.

## Auth Queries

| Query                     | Handler                          | Description                 |
| ------------------------- | -------------------------------- | --------------------------- |
| `GetProfileQuery`         | `GetProfileHandler`              | Get current user profile    |

## Booking Queries

| Query                     | Handler                          | Description                      |
| ------------------------- | -------------------------------- | -------------------------------- |
| `GetBookingQuery`         | `GetBookingHandler`              | Single booking by ID             |
| `ListBookingsQuery`       | `ListBookingsHandler`            | Paginated bookings with filters  |
| `GetCalendarQuery`        | `GetCalendarHandler`             | Availability calendar by month   |
| `GetBookingHistoryQuery`  | `GetBookingHistoryHandler`       | Past bookings for a guest        |
| `GetUpcomingArrivalsQuery`| `GetUpcomingArrivalsHandler`     | Arrivals for a date range        |
| `GetInHouseGuestsQuery`   | `GetInHouseGuestsHandler`        | Currently checked-in guests      |

## Property Queries

| Query                          | Handler                            | Description                  |
| ------------------------------ | ---------------------------------  | ---------------------------- |
| `GetPropertyQuery`             | `GetPropertyHandler`               | Single property/details      |
| `ListPropertiesQuery`          | `ListPropertiesHandler`            | Paginated properties list    |
| `SearchPropertiesQuery`        | `SearchPropertiesHandler`          | Full-text search             |
| `GetPropertyAvailabilityQuery` | `GetPropertyAvailabilityHandler`   | Date availability            |
| `GetPropertyRatesQuery`        | `GetPropertyRatesHandler`          | Rate plans and pricing       |
| `GetAmenitiesQuery`            | `GetAmenitiesHandler`              | Property amenities list      |

## Guest Queries

| Query                     | Handler                          | Description                  |
| ------------------------- | -------------------------------- | ---------------------------- |
| `GetGuestQuery`           | `GetGuestHandler`                | Single guest profile         |
| `ListGuestsQuery`         | `ListGuestsHandler`              | Paginated guest list         |
| `SearchGuestsQuery`       | `SearchGuestsHandler`            | Search by name/email/phone   |
| `GetGuestStayHistoryQuery`| `GetGuestStayHistoryHandler`     | Full stay history            |
| `GetGuestPreferencesQuery`| `GetGuestPreferencesHandler`     | Guest preferences            |

## Finance Queries

| Query                         | Handler                           | Description                  |
| ----------------------------- | --------------------------------- | ---------------------------- |
| `GetInvoiceQuery`             | `GetInvoiceHandler`               | Single invoice               |
| `ListInvoicesQuery`           | `ListInvoicesHandler`             | Paginated invoices           |
| `GetPaymentQuery`             | `GetPaymentHandler`               | Single payment               |
| `ListPaymentsQuery`           | `ListPaymentsHandler`             | Paginated payments           |
| `GetTransactionLogQuery`      | `GetTransactionLogHandler`        | Account transactions         |

## Report Queries

| Query                          | Handler                           | Description                     |
| ------------------------------ | --------------------------------- | ------------------------------- |
| `GetDashboardStatsQuery`       | `GetDashboardStatsHandler`        | Key metrics for dashboard       |
| `GetOccupancyReportQuery`      | `GetOccupancyReportHandler`       | Occupancy rates by date range   |
| `GetRevenueReportQuery`        | `GetRevenueReportHandler`         | Revenue breakdown               |
| `GetHousekeepingStatusQuery`   | `GetHousekeepingStatusHandler`    | Room status summary             |
| `GetBookingSourceReportQuery`  | `GetBookingSourceReportHandler`   | Bookings by channel             |

## User Queries

| Query                     | Handler                          | Description                  |
| ------------------------- | -------------------------------- | ---------------------------- |
| `GetUserQuery`            | `GetUserHandler`                 | Single user by ID            |
| `ListUsersQuery`          | `ListUsersHandler`               | Paginated user list          |
| `GetUserPermissionsQuery` | `GetUserPermissionsHandler`      | Resolved permissions         |

## Query Pattern Template

```typescript
export class ListBookingsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly filters?: {
      propertyId?: string;
      status?: BookingStatus;
      guestId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    public readonly sort?: { field: string; direction: 'asc' | 'desc' },
  ) {}
}
```
