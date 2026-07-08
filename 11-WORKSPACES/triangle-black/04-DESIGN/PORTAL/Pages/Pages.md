# Pages — V1 URL Map

All public pages are under route groups. The dashboard pages require authentication.

## Auth Pages

| URL Path         | Page Component       | Description            |
| ---------------- | -------------------- | ---------------------- |
| `/login`         | `(auth)/login/page`  | Sign in with email/pwd |
| `/register`      | `(auth)/register/page` | Create new account     |

## Dashboard Pages

| URL Path                     | Page Component                           | Description                  |
| ---------------------------- | ---------------------------------------- | ---------------------------- |
| `/dashboard`                 | `(dashboard)/dashboard/page`             | Home dashboard with widgets  |
| `/bookings`                  | `(dashboard)/bookings/page`              | Booking list (data table)    |
| `/bookings/new`              | `(dashboard)/bookings/new/page`          | Create booking form          |
| `/bookings/[id]`             | `(dashboard)/bookings/[id]/page`         | Booking detail view          |
| `/properties`                | `(dashboard)/properties/page`            | Property list                |
| `/properties/new`            | `(dashboard)/properties/new/page`        | Add property form            |
| `/properties/[id]`           | `(dashboard)/properties/[id]/page`       | Property detail / edit       |
| `/guests`                    | `(dashboard)/guests/page`                | Guest list (data table)      |
| `/guests/new`                | `(dashboard)/guests/new/page`            | Register guest form          |
| `/guests/[id]`               | `(dashboard)/guests/[id]/page`           | Guest profile                |
| `/housekeeping`              | `(dashboard)/housekeeping/page`          | Housekeeping dashboard       |
| `/calendar`                  | `(dashboard)/calendar/page`              | Availability calendar        |
| `/reports`                   | `(dashboard)/reports/page`               | Reports overview             |
| `/reports/revenue`           | `(dashboard)/reports/revenue/page`       | Revenue report detail        |
| `/finance`                   | `(dashboard)/finance/page`               | Finance overview             |
| `/finance/payments`          | `(dashboard)/finance/payments/page`      | Payment transactions         |
| `/finance/invoices`          | `(dashboard)/finance/invoices/page`      | Invoice list                 |
| `/settings`                  | `(dashboard)/settings/page`              | Settings overview            |
| `/settings/profile`          | `(dashboard)/settings/profile/page`      | User profile edit            |
| `/settings/users`            | `(dashboard)/settings/users/page`        | User management (admin only) |

## Marketing Pages

| URL Path         | Page Component            | Description         |
| ---------------- | ------------------------- | ------------------- |
| `/`              | `(marketing)/(home)/page` | Landing page        |
| `/about`         | `(marketing)/(home)/about/page` | About Triangle Black |

## Utility Pages

| URL Path         | Page Component | Description      |
| ---------------- | -------------- | ---------------- |
| `/not-found`     | `not-found`    | 404 page         |
| `/error`         | `error`        | Error boundary   |
