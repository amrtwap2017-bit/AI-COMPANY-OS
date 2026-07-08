# 12-Frontend — Next.js Application

The Triangle Black frontend is a **Next.js 15** application using the **App Router** with React 19 and TypeScript.

## Stack

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| Framework       | Next.js 15 (App Router)             |
| Language        | TypeScript 5                        |
| Styling         | Tailwind CSS 4 + shadcn/ui          |
| State           | React Query (Server state) + Zustand (Client state) |
| Forms           | React Hook Form + Zod               |
| i18n            | next-intl (Arabic RTL + English LTR) |
| Auth            | next-auth (Auth.js) v5              |
| HTTP Client     | ky (lightweight fetch wrapper)      |
| Testing         | Vitest + React Testing Library      |
| Lint/Format     | ESLint + Prettier                   |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
pnpm test:e2e

# Build for production
pnpm build
```

## Key Principles

- **Server Components first** — data fetching and business logic default to the server
- **Client Components** — only when interactivity is needed (forms, tables, real-time updates)
- **Suspense boundaries** — every data-fetching segment wraps in `<Suspense>` with fallbacks
- **RSC-compatible** — no direct Prisma calls in client components
- **Accessible** — WCAG 2.2 AA compliant, full keyboard navigation
- **RTL-aware** — proper Arabic layout with bidirectional styling

## Directory Layout

```
src/
├── app/              # App Router pages & layouts
├── components/       # Shared UI components (shadcn/ui based)
├── lib/              # Utilities, API client, helpers
├── hooks/            # Custom React hooks
├── locales/          # Translation JSON files (en, ar)
├── providers/        # React context providers
└── types/            # TypeScript type definitions
```

See [Folder-Structure.md](./Folder-Structure.md) for the full tree.
