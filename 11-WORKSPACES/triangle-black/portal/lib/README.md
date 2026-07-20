# Library Files

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
