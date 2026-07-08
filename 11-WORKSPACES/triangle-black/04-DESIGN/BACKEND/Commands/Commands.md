# Commands — All Command Definitions

All CQRS commands live in `src/commands/`. Each command is a plain TypeScript class with readonly properties and no methods.

## Auth Commands

| Command                | Handler                          | Description              |
| ---------------------- | -------------------------------- | ------------------------ |
| `LoginCommand`         | `LoginHandler`                   | Authenticate user        |
| `RegisterCommand`      | `RegisterHandler`                | Create new account       |
| `RefreshTokenCommand`  | `RefreshTokenHandler`            | Rotate refresh token     |
| `LogoutCommand`        | `LogoutHandler`                  | Invalidate session       |
| `ChangePasswordCommand`| `ChangePasswordHandler`          | Update password          |

## Booking Commands

| Command                    | Handler                          | Description                  |
| -------------------------- | -------------------------------- | ---------------------------- |
| `CreateBookingCommand`     | `CreateBookingHandler`           | Place new reservation        |
| `UpdateBookingCommand`     | `UpdateBookingHandler`           | Modify existing booking      |
| `CancelBookingCommand`     | `CancelBookingHandler`           | Cancel with refund logic     |
| `CheckInGuestCommand`      | `CheckInGuestHandler`            | Record guest check-in        |
| `CheckOutGuestCommand`     | `CheckOutGuestHandler`           | Process checkout + balance   |
| `AddBookingAddonCommand`   | `AddBookingAddonHandler`         | Attach addon to booking      |
| `RequestEarlyCheckinCommand`| `RequestEarlyCheckinHandler`    | Request early arrival        |

## Property Commands

| Command                    | Handler                          | Description                  |
| -------------------------- | -------------------------------- | ---------------------------- |
| `CreatePropertyCommand`    | `CreatePropertyHandler`          | Add new property/unit        |
| `UpdatePropertyCommand`    | `UpdatePropertyHandler`          | Edit property details        |
| `ArchivePropertyCommand`   | `ArchivePropertyHandler`         | Soft-delete a property       |
| `SetPropertyRateCommand`   | `SetPropertyRateHandler`         | Update pricing               |
| `UpdateAvailabilityCommand`| `UpdateAvailabilityHandler`      | Block/unblock dates          |

## Guest Commands

| Command                    | Handler                          | Description                  |
| -------------------------- | -------------------------------- | ---------------------------- |
| `CreateGuestCommand`       | `CreateGuestHandler`             | Register new guest           |
| `UpdateGuestCommand`       | `UpdateGuestHandler`             | Update guest profile         |
| `MergeGuestProfilesCommand`| `MergeGuestProfilesHandler`      | Deduplicate guest records    |
| `AddGuestPreferenceCommand`| `AddGuestPreferenceHandler`      | Save guest preference        |

## Finance Commands

| Command                    | Handler                          | Description                  |
| -------------------------- | -------------------------------- | ---------------------------- |
| `ProcessPaymentCommand`    | `ProcessPaymentHandler`          | Charge payment gateway       |
| `CreateInvoiceCommand`     | `CreateInvoiceHandler`           | Generate invoice             |
| `RefundPaymentCommand`     | `RefundPaymentHandler`           | Process refund               |
| `RecordExpenseCommand`     | `RecordExpenseHandler`           | Log operational expense      |
| `ApplyDiscountCommand`     | `ApplyDiscountHandler`           | Apply promo/discount         |

## Housekeeping Commands

| Command                    | Handler                          | Description                  |
| -------------------------- | -------------------------------- | ---------------------------- |
| `CreateTaskCommand`        | `CreateTaskHandler`              | New housekeeping task        |
| `AssignTaskCommand`        | `AssignTaskHandler`              | Assign to staff              |
| `CompleteTaskCommand`      | `CompleteTaskHandler`            | Mark task done               |
| `ReportIssueCommand`       | `ReportIssueHandler`             | Report maintenance issue     |

## Notification Commands

| Command                    | Handler                          | Description                  |
| -------------------------- | -------------------------------- | ---------------------------- |
| `SendEmailCommand`         | `SendEmailHandler`               | Send transactional email     |
| `SendSmsCommand`           | `SendSmsHandler`                 | Send SMS notification        |
| `SendInAppNotificationCommand` | `SendInAppNotificationHandler`| Show in-app notification     |

## Command Pattern Template

```typescript
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
