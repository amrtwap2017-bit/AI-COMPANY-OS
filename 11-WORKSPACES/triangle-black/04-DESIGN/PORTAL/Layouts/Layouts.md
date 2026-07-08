# Layouts — Layout Hierarchy

The layout hierarchy follows Next.js nested layout pattern. Each layout can be a server or client component depending on needs.

## Root Layout

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={locale} dir={direction}>
      <body>
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider>
              <Toaster />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

## Layout Hierarchy

```
RootLayout (server)                    ← Providers, fonts, metadata
├── AuthLayout (server)                ← Centered card container
│   ├── /login
│   └── /register
│
├── DashboardLayout (server)           ← Auth check + sidebar shell
│   ├── Sidebar (client)               ← Navigation links, user menu
│   ├── Header (client)                ← Breadcrumb, search, notifications
│   └── <slot>                         ← Page content with Suspense
│       ├── /dashboard
│       ├── /bookings
│       │   ├── /bookings/new
│       │   └── /bookings/[id]
│       ├── /properties
│       │   ├── /properties/new
│       │   └── /properties/[id]
│       ├── /guests
│       │   ├── /guests/new
│       │   └── /guests/[id]
│       ├── /housekeeping
│       ├── /calendar
│       ├── /reports
│       │   └── /reports/revenue
│       ├── /finance
│       │   ├── /finance/payments
│       │   └── /finance/invoices
│       └── /settings
│           ├── /settings/profile
│           └── /settings/users
│
└── MarketingLayout (server)           ← Public header + footer
    └── / (landing)
        └── /about
```

## Dashboard Shell Component

```typescript
// src/components/layout/dashboard-shell.tsx
'use client';
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<DashboardSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

## Layout Responsibilities

| Layout            | Handles                                                      |
| ----------------- | ------------------------------------------------------------ |
| RootLayout        | HTML/body, i18n direction, global providers, fonts, toast    |
| AuthLayout        | Centered card with logo, no sidebar                          |
| DashboardLayout   | Auth guard, sidebar, header, breadcrumb, user menu           |
| MarketingLayout   | Public nav, CTA banner, footer                               |
