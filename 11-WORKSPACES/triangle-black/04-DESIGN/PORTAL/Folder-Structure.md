# Frontend Folder Structure

```
frontend/
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-ar.svg
│   │   └── favicon.ico
│   └── fonts/
│       └── tajawal/             — Arabic font files
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          — Root layout (html, body, providers)
│   │   ├── page.tsx            — Landing / home page
│   │   ├── not-found.tsx       — 404 page
│   │   ├── error.tsx           — Global error boundary
│   │   ├── loading.tsx         — Root loading state
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx      — Auth pages layout (centered card)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      — Dashboard shell (sidebar, header)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── guests/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── housekeeping/
│   │   │   │   └── page.tsx
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   └── revenue/
│   │   │   │       └── page.tsx
│   │   │   ├── finance/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── payments/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── invoices/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── profile/
│   │   │       │   └── page.tsx
│   │   │       └── users/
│   │   │           └── page.tsx
│   │   │
│   │   └── (marketing)/
│   │       └── (home)/
│   │           ├── page.tsx
│   │           └── about/
│   │               └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                  — shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── dashboard-shell.tsx
│   │   │   └── auth-layout.tsx
│   │   ├── data-table/
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-toolbar.tsx
│   │   │   └── data-table-column-header.tsx
│   │   ├── forms/
│   │   │   ├── booking-form.tsx
│   │   │   ├── property-form.tsx
│   │   │   ├── guest-form.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── form-field.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   ├── occupancy-chart.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── upcoming-arrivals.tsx
│   │   │   ├── recent-bookings.tsx
│   │   │   └── alerts-widget.tsx
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-state.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── status-badge.tsx
│   │       └── search-input.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts        — ky instance with auth interceptor
│   │   │   ├── queries.ts       — React Query hooks
│   │   │   └── mutations.ts     — React Query mutations
│   │   ├── utils/
│   │   │   ├── cn.ts            — clsx + tailwind-merge utility
│   │   │   ├── format.ts        — Date, currency, number formatters
│   │   │   └── constants.ts     — App-wide constants
│   │   └── validations/
│   │       ├── booking.schema.ts
│   │       ├── property.schema.ts
│   │       ├── auth.schema.ts
│   │       └── guest.schema.ts
│   │
│   ├── hooks/
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   └── use-local-storage.ts
│   │
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── dashboard.json
│   │   │   ├── bookings.json
│   │   │   ├── properties.json
│   │   │   ├── guests.json
│   │   │   └── housekeeping.json
│   │   └── ar/
│   │       ├── common.json
│   │       ├── auth.json
│   │       ├── dashboard.json
│   │       ├── bookings.json
│   │       ├── properties.json
│   │       ├── guests.json
│   │       └── housekeeping.json
│   │
│   ├── providers/
│   │   ├── session-provider.tsx — next-auth session context
│   │   ├── query-provider.tsx   — React Query provider
│   │   ├── theme-provider.tsx   — next-themes (light/dark)
│   │   └── locale-provider.tsx  — next-intl provider
│   │
│   ├── types/
│   │   ├── api.ts              — API response types
│   │   ├── booking.ts
│   │   ├── property.ts
│   │   ├── guest.ts
│   │   ├── user.ts
│   │   └── common.ts           — Pagination, sorting, filters
│   │
│   └── middleware.ts           — Auth middleware for protected routes
│
├── tests/
│   ├── components/
│   ├── hooks/
│   └── e2e/
│
├── tailwind.config.ts
├── next.config.ts
├── next-intl.config.ts
├── components.json            — shadcn/ui config
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vitest.config.ts
└── .env.example
```
