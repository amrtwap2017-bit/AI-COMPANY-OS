# Phase 03 — Event Architecture

> Event-driven architecture for cross-domain communication.

## Event Model

```
Domain Event ──► Event Bus (In-process) ──► Handlers ──► Side Effects
                    │
                    ▼
               Audit Store
```

## Event Categories

| Category | Description | Delivery | Examples |
|----------|-------------|----------|----------|
| Domain | Business state changes | Synchronous (in-process) | lead.created, contract.signed |
| Integration | External system triggers | Async (queue) | eta.invoice.submitted |
| Notification | User-facing alerts | Async | notification.send |
| Audit | Compliance trail | Sync + Store | audit.logged |

## Key Domain Events

| Event | Publisher | Consumers | Trigger |
|-------|-----------|-----------|---------|
| `commercial.lead.created` | Commercial | AI (scoring), Notification | Lead form submission |
| `commercial.opportunity.won` | Commercial | Project Delivery, Financial | Opportunity stage = Closed Won |
| `commercial.contract.signed` | Commercial | Project Delivery, Financial | Contract status = Signed |
| `project.milestone.approved` | Project | Financial (revenue), Notification | Milestone approval |
| `project.ncr.created` | Project | Notification, AI (classification) | NCR form submission |
| `procurement.po.approved` | Procurement | Inventory (reserve), Notification | PO approval |
| `inventory.stock.consumed` | Inventory | Financial (costing) | Stock consumption |
| `financial.invoice.paid` | Financial | Integration (ETA), Notification | Payment received |
| `financial.revenue.recognized` | Financial | Executive Intelligence | Revenue recognition |
| `maintenance.sla.breached` | Maintenance | Notification, AI (escalation) | SLA threshold exceeded |

## Event Schema

```json
{
  "id": "evt-uuid",
  "type": "commercial.lead.created",
  "source": "commercial",
  "subject": "lead:Ld-000001",
  "data": { "lead_id": "...", "source": "website" },
  "timestamp": "2026-01-15T10:30:00Z",
  "correlation_id": "req-uuid"
}
```

## Dead Letter Queue

Failed events are stored in a DLQ table for retry and debugging. See `Event-Integration.md` in Phase 7.

## Related Documents

- `09-Event-Architecture/` in Phase 3 — Detailed event design
- [Event Integration](../PHASE-07-ENTERPRISE-INTEGRATION/Event-Integration.md) — Integration event bridge
