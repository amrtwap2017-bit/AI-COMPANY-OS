# Components — Shared Component Catalog

All shared components are in src/components/. Components are organized by category.

## UI Primitives (shadcn/ui)

Radix-based accessible components, customized with Tailwind:

| Component         | Description                        |
| ----------------- | ---------------------------------- |
| Button          | Variants: default, secondary, ghost, destructive, outline |
| Input           | Text input with error state        |
| Select          | Native select with styling         |
| Textarea        | Multi-line text input              |
| Label           | Form label with error indicator    |
| Card            | Content card with header/footer    |
| Dialog          | Modal dialog with overlay          |
| Sheet           | Slide-in panel (mobile sidebar)    |
| DropdownMenu    | Context menu / actions menu        |
| Table           | Semantic table primitive           |
| Badge           | Status/color badges                |
| Avatar          | User avatar with fallback          |
| Skeleton        | Loading placeholder                |
| Toast           | Notification toast                 |
| Tabs            | Tabbed content                     |
| Switch          | Toggle switch                      |
| Checkbox        | Checkbox input                     |
| RadioGroup      | Radio button group                 |
| Separator       | Horizontal/vertical divider        |
| Progress        | Progress bar                       |
| Tooltip         | Hover tooltip                      |
| Pagination      | Page navigation                    |

## Layout Components

| Component           | Description                           |
| ------------------- | ------------------------------------- |
| Sidebar           | Collapsible navigation sidebar        |
| Header            | Top bar with breadcrumb + actions     |
| DashboardShell    | Sidebar + header + main content frame |
| AuthLayout        | Centered card for auth pages          |
| PageHeader        | Page title + action buttons           |
| Breadcrumb        | Auto-generated breadcrumb trail       |

## Data Display Components

| Component           | Description                           |
| ------------------- | ------------------------------------- |
| DataTable         | Sortable, filterable, paginated table |
| DataTablePagination | Page controls for data table        |
| DataTableToolbar  | Search, filters, column visibility    |
| EmptyState        | Empty/no-results placeholder          |
| ErrorState        | Error message with retry button       |
| StatusBadge       | Color-coded status indicator          |
| LoadingSpinner    | Spinner for async operations          |
| SearchInput       | Debounced search input                |
| ConfirmDialog     | Destructive action confirmation       |

## Dashboard Widgets

| Component           | Description                           |
| ------------------- | ------------------------------------- |
| StatsCard         | Single KPI with icon, trend arrow     |
| OccupancyChart    | Bar/line chart for occupancy rates    |
| RevenueChart      | Revenue over time (area/line)         |
| UpcomingArrivals  | Today's / tomorrow's check-ins list   |
| RecentBookings    | Last 10 booking cards                 |
| AlertsWidget      | System alerts and notifications       |

## Form Components

| Component           | Description                           |
| ------------------- | ------------------------------------- |
| FormField         | Wrapper: label + input + error        |
| BookingForm       | Full booking creation form            |
| PropertyForm      | Property add/edit form                |
| GuestForm         | Guest registration form               |
| LoginForm         | Email + password with validation      |
| RegisterForm      | Registration with role selection      |

## Component Conventions

1. **Server components** by default — add 'use client' only when hooks/state/interactivity needed
2. **Props interface** — always define and export a TypeScript interface
3. **Tailwind classes** — use cn() utility from src/lib/utils/cn.ts
4. **i18n** — use useTranslations() hook or 
ext-intl server-side getTranslations()
5. **Loading states** — every data-fetching component shows a skeleton
