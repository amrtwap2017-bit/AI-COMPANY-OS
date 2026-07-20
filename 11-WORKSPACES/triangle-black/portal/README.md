# Triangle Black Portal

Enterprise hotel engineering SaaS portal for Egypt market.

## Stack
- Next.js 16 (Turbopack) + TypeScript
- TailwindCSS + shadcn/ui
- React Query (@tanstack/react-query)
- React Hook Form + Zod
- Sonner (toast notifications)

## Getting Started
```bash
npm install
npm run dev    # development (hot reload)
npm run build  # production build
npm run start  # production server
```

## Environment Variables
Copy `.env.example` to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8030
NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8001
```

## Project Structure
```
app/                    Next.js app router
  (app)/                Authenticated routes
    (enterprise)/       Enterprise features
    dashboard/          Main dashboard
    leads/              Lead management
    work-orders/        Work order management
    technicians/        Field team
    assets/             Asset tracking
    warehouses/         Inventory
components/
  ui/                   Shared UI components (20+)
  workspace/            Enterprise workspace components
  shell/                Layout components
lib/
  api/                  API client modules
  hooks/                React Query hooks
  schemas/              Zod validation schemas
  types.ts              TypeScript types
  utils.ts              Utility functions
  constants.ts          App constants
```

## Key Features
- 137 pages covering full hotel engineering operations
- Lead pipeline management
- Work order lifecycle
- Technician dispatch
- Asset & maintenance tracking
- Supply chain management
- Executive intelligence dashboard
- AI-powered engineering assistant

## Pages Count
- Total: 137 pages
- Enterprise: 90+ pages
- Standard: 47 pages

## Components
20+ shared UI components including:
PageHeader, DataTable, StatusPill, LoadingState,
EmptyState, AlertBanner, SearchInput, MetricCard,
MetricStrip, Button, SectionCard, EntityShell

*Generated: 2026-07-20*
