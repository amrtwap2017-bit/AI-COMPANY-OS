# Next.js App Router Architecture

## Server vs Client Components

| Type               | Default | Can use hooks | Can use state   | Data fetching     |
| ------------------ | ------- | ------------- | --------------- | ----------------- |
| Server Component   | Yes     | No            | No              | `async` component |
| Client Component   | No      | Yes           | Yes             | React Query       |

**Rule of thumb:** Start as a server component. Add `'use client'` only when interactivity is required.

## Data Fetching Pattern

### Server Component (default)

```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const stats = await api.getDashboardStats();
  return <DashboardStatsClient data={stats} />;
}
```

### Client Component (when needed)

```typescript
'use client';
// src/components/dashboard/dashboard-stats-client.tsx
export function DashboardStatsClient({ data }: { data: DashboardStats }) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  // ... interactive UI here
}
```

## Route Groups

Routes are organized using Next.js route groups to share layouts without affecting URL paths:

```
src/app/
├── (auth)/              # Route group — no layout prefix in URL
│   ├── login/
│   └── register/
├── (dashboard)/          # Route group
│   ├── dashboard/
│   ├── bookings/
│   ├── properties/
│   ├── guests/
│   ├── housekeeping/
│   ├── reports/
│   └── settings/
└── (marketing)/          # Public pages
    └── (home)/
```

## API Client

All API calls go through a typed client using `ky`:

```typescript
// src/lib/api/client.ts
import ky from 'ky';
import { getSession } from 'next-auth/react';

export const api = ky.extend({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const session = await getSession();
        if (session?.accessToken) {
          request.headers.set('Authorization', `Bearer ${session.accessToken}`);
        }
      },
    ],
  },
  retry: { limit: 2, methods: ['get'] },
});
```

## React Query Integration

```typescript
// src/lib/api/queries.ts
export function useBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => api.get('bookings', { searchParams: filters }).json<PaginatedResult<Booking>>(),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBookingDto) => api.post('bookings', { json: dto }).json<Booking>(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
```

## Middleware

```typescript
// src/middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/bookings/:path*', '/settings/:path*'],
};
```

## Loading & Error States

```typescript
// src/app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// src/app/dashboard/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState message={error.message} onRetry={reset} />;
}
```
