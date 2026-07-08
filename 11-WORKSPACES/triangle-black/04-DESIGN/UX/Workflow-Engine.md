# WFE-001 — Workflow Engine

## Status Machine

All business entities follow a status machine pattern powered by a shared engine.

### Quotation Status Flow

```
draft → sent → under_review → approved
         ↓          ↓
      expired    rejected
```

### Project Status Flow

```
planning → in_progress → completed
              ↓             ↓
           on_hold      cancelled
```

### Milestone Status Flow

```
not_started → in_progress → completed → approved
```

## `apps/api/src/common/workflow/workflow.engine.ts`

```typescript
type WorkflowTransition = {
  from: string[];
  to: string;
  requiredRole?: string[];
  validate?: (entity: any) => boolean;
};

type Workflow = Record<string, WorkflowTransition[]>;

const quotationWorkflow: Workflow = {
  draft: [
    { from: ['draft'], to: 'sent', requiredRole: ['sales_rep', 'manager', 'admin'] },
  ],
  sent: [
    { from: ['sent'], to: 'under_review' },
    { from: ['sent'], to: 'expired', validate: (q) => new Date(q.validUntil) < new Date() },
  ],
  under_review: [
    { from: ['under_review'], to: 'approved', requiredRole: ['manager', 'admin'] },
    { from: ['under_review'], to: 'rejected', requiredRole: ['manager', 'admin'] },
  ],
};

export function validateTransition(
  workflow: Workflow,
  currentStatus: string,
  targetStatus: string,
  userRole: string,
  entity?: any,
): { valid: boolean; reason?: string } {
  const transitions = workflow[currentStatus];
  if (!transitions) {
    return { valid: false, reason: `No transitions defined for status '${currentStatus}'` };
  }

  const transition = transitions.find((t) => t.to === targetStatus);
  if (!transition) {
    return {
      valid: false,
      reason: `Cannot transition from '${currentStatus}' to '${targetStatus}'`,
    };
  }

  if (transition.requiredRole && !transition.requiredRole.includes(userRole)) {
    return {
      valid: false,
      reason: `Requires one of these roles: ${transition.requiredRole.join(', ')}`,
    };
  }

  if (transition.validate && entity && !transition.validate(entity)) {
    return { valid: false, reason: 'Validation failed for transition' };
  }

  return { valid: true };
}
```
