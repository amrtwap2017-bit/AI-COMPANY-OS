# Phase 05 — Application Foundation

> Next.js application foundation and configuration.

## Application Setup

| Feature | Implementation | Status |
|---------|---------------|--------|
| App Router | Next.js 15 App Router | Built |
| Layout | Shell layout (sidebar + header + content) | Built |
| Theme | next-themes + CSS variables | Built |
| API Client | Axios wrapper with auth interceptor | Built |
| Auth Context | React context + localStorage tokens | Built |
| Form Library | React Hook Form + Zod | Built |
| Query Client | React Query (TanStack Query) | Built |
| State Store | Zustand | Built |

## Route Structure

- `(auth)/` — Login, register, forgot-password
- `(dashboard)/` — All authenticated routes
  - `(overview)/` — Dashboard home
  - `commercial/` — CRM routes
  - `projects/` — Project routes
  - `procurement/` — Procurement routes
  - `inventory/` — Inventory routes
  - `financial/` — Financial routes
  - `maintenance/` — Maintenance routes
  - `documents/` — Document routes
  - `reports/` — Intelligence routes
  - `settings/` — Settings routes

## Component Architecture

- Server components by default
- Client components (`'use client'`) only when interactivity needed
- Shared UI components from shadcn/ui
- Domain components organized by domain

## Performance Configuration

- Image optimization via Next.js `<Image>` component
- Route prefetching for linked pages
- React Server Components for data-fetching pages
- Bundle analysis via `@next/bundle-analyzer`

See `08-APPLICATION-FOUNDATION/` for detailed frontend setup.
