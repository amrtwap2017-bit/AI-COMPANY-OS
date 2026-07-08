# Phase 02 — Frontend Architecture

> Next.js 15 frontend architecture for Triangle Black.

## Architecture Overview

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register, forgot-password)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/               # Authenticated routes
│   │   ├── (overview)/            # Dashboard home
│   │   ├── commercial/            # CRM screens
│   │   ├── projects/              # Project delivery screens
│   │   ├── procurement/           # Procurement screens
│   │   ├── inventory/             # Inventory screens
│   │   ├── financial/             # Financial control screens
│   │   ├── maintenance/           # Maintenance screens
│   │   ├── documents/             # Document management screens
│   │   ├── reports/               # Executive intelligence screens
│   │   └── settings/              # User/settings screens
│   └── api/                       # API routes (if needed)
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── layout/                    # Shell, sidebar, header
│   ├── shared/                    # Shared business components
│   └── domain/                    # Domain-specific components
│       ├── commercial/
│       ├── projects/
│       └── ...
├── lib/
│   ├── api-client.ts              # Axios/Fetch wrapper
│   ├── auth.ts                    # Auth context, token management
│   └── utils.ts                   # Shared utilities
├── hooks/                         # Custom React hooks
├── stores/                        # Zustand stores
├── types/                         # TypeScript types
└── styles/                        # Tailwind + custom styles
```

## Component Library

- **Base**: [shadcn/ui](https://ui.shadcn.com/) — accessible, customizable
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (client), React Query (server)
- **Tables**: TanStack Table
- **Charts**: Recharts

## State Management

| State Type | Tool | Purpose |
|-----------|------|---------|
| Server state | React Query (TanStack Query) | API data caching, pagination, mutations |
| Client state | Zustand | UI state, form wizards, filters |
| Auth state | React Context + localStorage | JWT tokens, user profile |
| Form state | React Hook Form | Form inputs, validation |

## Authentication Flow

```
1. User submits credentials → POST /api/v1/auth/login
2. Backend validates → Returns { accessToken, refreshToken, user }
3. Store tokens in localStorage (access) + httpOnly cookie (refresh)
4. AccessTokenInterceptor attaches Bearer token to all requests
5. On 401 → Attempt token refresh → On failure → Redirect to login
```

## Performance

- SSR for initial page load
- Client components for interactive elements
- Route prefetching for linked pages
- Image optimization via Next.js
- Bundle analysis with `@next/bundle-analyzer`

## Related Documents

- [Design System](../PHASE-03-DIGITAL-TWIN-DESIGN/Design-System.md) — UI component specifications
- [UX Architecture](../PHASE-03-DIGITAL-TWIN-DESIGN/UX-Architecture.md) — User experience design
