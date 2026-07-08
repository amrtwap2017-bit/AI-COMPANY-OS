# 08 — Frontend Standards

## Routing (Next.js App Router)

```
app/
├── (public)/          # Public website routes
│   ├── page.tsx       # Landing page (Server Component)
│   ├── about/
│   └── contact/
├── (auth)/            # Auth routes
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/       # Authenticated routes (layout with sidebar)
│   ├── layout.tsx
│   ├── crm/
│   │   ├── leads/
│   │   ├── opportunities/
│   │   └── companies/
│   ├── quotations/
│   ├── projects/
│   └── admin/
└── (portal)/          # Client portal routes
    └── service-requests/
```

## Component Architecture

```
components/
├── ui/                  # Primitive components (shadcn/ui)
├── forms/               # Form components
├── tables/              # Data table components
├── charts/              # Chart components
├── layout/              # Layout components (sidebar, header)
├── shared/              # Shared business components
└── modules/             # Module-specific components
```

## Server vs Client Components

```typescript
// ✅ Server Component (default)
export default async function LeadPage({ params }: Props) {
  const leads = await prisma.lead.findMany();  // Direct DB access
  return <LeadList leads={leads} />;
}

// ✅ Client Component (only when needed)
'use client';
export function LeadActions({ leadId }: { leadId: string }) {
  const [isOpen, setIsOpen] = useState(false);  // Interactivity
  return <Button onClick={() => setIsOpen(true)}>Convert</Button>;
}
```

## State Management Rules

| Type | Solution | When |
|------|----------|------|
| Server state | Server Component + direct fetch | Default for all data |
| URL state | searchParams | Filters, pagination, search |
| Form state | React Hook Form + Zod | All forms |
| Client state | useState / useReducer | UI interactions only |
| Shared client state | React Context | Theme, auth, tenant |

## Data Fetching

```typescript
// Server Component: direct fetch
const res = await fetch('http://localhost:4000/api/v1/crm/leads');
const { data: leads } = await res.json();

// Or for admin: direct Prisma (same server)
import { prisma } from '@tb/database';
const leads = await prisma.lead.findMany();
```

## Accessibility Standards

- WCAG 2.1 AA minimum
- All images have alt text
- All forms have labels
- All interactive elements are keyboard accessible
- Color contrast ratio >= 4.5:1
- Focus indicators visible
- ARIA labels where semantic HTML is insufficient
