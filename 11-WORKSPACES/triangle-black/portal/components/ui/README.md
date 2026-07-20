# UI Components

Shared UI components for Triangle Black portal.

## Components

### PageHeader
```tsx
import { PageHeader } from "@/components/ui";
<PageHeader
  title="Work Orders"
  subtitle="Manage engineering work orders"
  badge="WO"
  actions={<Button>New</Button>}
/>
```

### DataTable
```tsx
import { DataTable } from "@/components/ui";
<DataTable
  columns={[{ key: "name", label: "Name", render: (row) => row.name }]}
  data={rows}
/>
```

### StatusPill
```tsx
import { StatusPill } from "@/components/ui";
<StatusPill status="active" />
<StatusPill status="pending" />
<StatusPill status="completed" />
```

### LoadingState
```tsx
import { LoadingState } from "@/components/ui";
<LoadingState type="table" rows={8} />
<LoadingState type="cards" rows={4} cols={3} />
```

### EmptyState
```tsx
import { EmptyState } from "@/components/ui";
<EmptyState
  icon="📭"
  title="No work orders"
  description="Create your first work order"
  action={<Button>New Work Order</Button>}
/>
```

### Button
```tsx
import { Button } from "@/components/ui";
<Button variant="primary" size="sm">Save</Button>
<Button variant="secondary" size="md">Cancel</Button>
```

### AlertBanner
```tsx
import { AlertBanner } from "@/components/ui";
<AlertBanner type="error" title="Something went wrong" />
<AlertBanner type="success" title="Saved!" />
```
