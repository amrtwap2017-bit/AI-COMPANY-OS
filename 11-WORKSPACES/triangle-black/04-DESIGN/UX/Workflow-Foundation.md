# Phase 05 — Workflow Foundation

> Workflow engine and state machine foundation for business processes.

## State Machine Pattern

```
Entity (e.g., Lead) has a status field
Status transitions defined in a state machine
Transitions trigger events → notifications → side effects
```

## Supported Workflows

| Workflow | Domain | States | Transitions |
|----------|--------|--------|-------------|
| Lead Lifecycle | Commercial | New → Contacted → Qualified → Converted → Lost | 6 transitions |
| Quotation Approval | Commercial | Draft → Submitted → Approved → Rejected → Expired | 5 transitions |
| Contract Lifecycle | Commercial | Draft → Sent → Signed → Active → Completed → Terminated | 6 transitions |
| Project Execution | Project | Planning → Active → On Hold → Completed → Cancelled | 5 transitions |
| PO Lifecycle | Procurement | Draft → Approved → Issued → Delivered → Closed | 5 transitions |

## State Machine Definition

```typescript
const leadStates = {
  initial: 'new',
  states: {
    new: { transitions: { contact: 'contacted' } },
    contacted: { transitions: { qualify: 'qualified', lose: 'lost' } },
    qualified: { transitions: { convert: 'converted', lose: 'lost' } },
    converted: { transitions: {} },
    lost: { transitions: { reopen: 'new' } },
  }
}
```

## Validation Rules

- Transitions must be defined in state machine
- Invalid transitions return 409 Conflict with available transitions
- State change events emitted for audit and notification

See `05-WORKFLOW-FOUNDATION/` for complete workflow implementation.
