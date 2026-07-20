# P5 — Add Documentation + README + API Docs
import os, glob, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/p5.log'
ROOT   = '/home/amr/AI-COMPANY-OS'
PORTAL = ROOT + '/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write_doc(path, content, label):
    os.makedirs(os.path.dirname(path),exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('P5 START — Documentation')
today = datetime.date.today().strftime('%Y-%m-%d')

# Portal README
write_doc(PORTAL+'/README.md', '''# Triangle Black Portal

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

*Generated: ''' + today + '''*
''',
    'portal/README.md')

# Component documentation
write_doc(PORTAL+'/components/ui/README.md', '''# UI Components

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
''',
    'components/ui/README.md')

# API documentation
write_doc(PORTAL+'/lib/README.md', '''# Library Files

## API Client
```typescript
import { workOrdersApi, leadsApi, techniciansApi } from "@/lib/api";

// List work orders
const wos = await workOrdersApi.list({ limit: 20, status: "open" });

// Create work order
const wo = await workOrdersApi.create({ title: "...", priority: "high" });

// Get single
const wo = await workOrdersApi.get(id);
```

## React Query Hooks
```typescript
import { useWorkOrders, useCreateWorkOrder } from "@/lib/hooks";

const { data, isLoading, error } = useWorkOrders({ status: "open" });
const create = useCreateWorkOrder();

await create.mutateAsync({ title: "HVAC Repair", priority: "high" });
```

## Validation Schemas
```typescript
import { WorkOrderSchema, createWorkOrderSchema } from "@/lib/schemas/workOrder";

const result = WorkOrderSchema.safeParse(formData);
if (!result.success) console.log(result.error.flatten());
```

## Constants
```typescript
import { PRIORITIES, WO_STATUSES, EGYPT_CITIES } from "@/lib/constants";
```
''',
    'lib/README.md')

# Main project README update
write_doc(ROOT+'/ARCHITECTURE.md', '''# AI Company OS — Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│              NGINX HTTPS :443                   │
│  Hub :3000  │  Portal :3001  │  Engine :8001   │
└─────────────────────────────────────────────────┘
         │           │              │
    Next.js 16   Next.js 16     FastAPI
    16 agents    137 pages      283 modules
         │           │              │
┌─────────────────────────────────────────────────┐
│  PostgreSQL :5432  │  Qdrant :6333  │  Redis   │
│  TB Admin :8030    │  Ollama :11434            │
└─────────────────────────────────────────────────┘
```

## Services
| Service | Port | Purpose |
|---------|------|---------|
| AI Engine | :8001 | FastAPI + AI agents |
| TB Admin | :8030 | Triangle Black business API |
| Hub Dashboard | :3000 | AI OS control center |
| TB Portal | :3001 | Hotel SaaS portal (137 pages) |
| Nginx | :443 | HTTPS reverse proxy |
| PostgreSQL | :5432 | Main database |
| Qdrant | :6333 | Vector search |
| Redis | :6379 | Cache |
| Ollama | :11434 | Local LLM inference |
| OpenWebUI | :3400 | Direct Ollama chat |

## AI Models
| Model | Size | Use |
|-------|------|-----|
| qwen2.5-coder:7b | 4.7GB | Code + analysis (primary) |
| llama3.2:3b | 2.0GB | Fast tasks |
| nomic-embed-text | 274MB | Embeddings |
| deepseek-r1:8b | 5.2GB | Complex reasoning |

## Daily Operations
```bash
bash START-SAFE.sh      # start all services
bash HEALTH-MONITOR.sh  # live dashboard
bash STOP-ALL.sh        # stop cleanly
```

*Updated: ''' + today + '''*
''',
    'ARCHITECTURE.md')

log(chr(10)+'='*40)
log('P5 COMPLETE — Created: '+str(len(results['created']))+' docs')
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/p5_result.json','w') as f:
    _j.dump(results,f,indent=2)