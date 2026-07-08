# UX-001 — Navigation

## Sidebar Structure

```
{tenant.name}
├── Dashboard
├── CRM
│   ├── Leads
│   ├── Opportunities
│   └── Companies
├── Quotations
│   ├── All Quotations
│   ├── Contracts
│   └── RFQs
├── Projects
│   ├── Active Projects
│   ├── Milestones
│   └── Surveys
├── Client Portal
│   └── Service Requests
├── Reporting
│   ├── Pipeline
│   └── Revenue
└── Administration
    ├── Users
    ├── Audit Logs
    └── Settings
```

## `apps/web/src/app/(dashboard)/layout.tsx`

```typescript
import { Sidebar } from './components/sidebar';
import { Topbar } from './components/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## Key UX Standards

| Element | Standard |
|---------|----------|
| Sidebar | 280px wide, collapsible to 64px icons-only |
| Topbar | 64px height, search, notifications, user menu |
| Breadcrumbs | Auto-generated from route segments |
| Content max-width | 1280px, centered with 24px padding |
| Page titles | H1 at top of content area |
| Empty states | Illustration + message + CTA button |
| Loading | Skeleton components, no spinners |
| Error states | Inline error + retry button |
