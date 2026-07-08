# 05 — Event Integration

> Domain events that cross the system boundary into external integrations.

## Event Integration Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Internal Domain  │     │  Event Bridge    │     │  External System  │
│                   │     │  (Phase 7)       │     │                   │
│  Domain Event ───►│────►│  ACL Transform   │────►│  REST / Webhook  │
│  e.g.,            │     │  ┌────────────┐  │     │                   │
│  invoice.paid     │     │  │ Rate Limit │  │     │                   │
│                   │     │  │ Retry Queue│  │     │                   │
│                   │     │  │ DLQ        │  │     │                   │
│                   │     │  └────────────┘  │     │                   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Integration Events Catalog

Every integration event maps to a Phase 6 domain event and triggers one or more external actions.

### 01-COMMERCIAL Events

| Internal Event | External Action | System | V1/V2 |
|---------------|----------------|--------|-------|
| `lead.created` | Notify sales team | WhatsApp / Email | V1 |
| `lead.converted` | — | — | — |
| `opportunity.stage_changed` | Notify client (won/lost) | WhatsApp | V1 |
| `survey.scheduled` | Create calendar event | Google Calendar | V1 |
| `survey.completed` | — | — | — |
| `quotation.created` | — | — | — |
| `quotation.sent` | Notify client with link | WhatsApp / Email | V1 |
| `quotation.client_approved` | Notify sales + finance | WhatsApp / Email | V1 |
| `quotation.client_rejected` | Notify sales | In-app | V1 |
| `contract.signed` | Archive contract | DO Spaces | V1 |
| `contract.activated` | Notify project team | WhatsApp / Email | V1 |

### 02-PROJECT-DELIVERY Events

| Internal Event | External Action | System | V1/V2 |
|---------------|----------------|--------|-------|
| `project.created` | Create project folder | DO Spaces | V1 |
| `milestone.approved` | Generate milestone invoice | Internal (triggers financial) | V1 |
| `ncr.created (critical)` | Notify management | WhatsApp / Email | V1 |
| `ncr.closed` | — | — | — |
| `project.completed` | Archive project docs | DO Spaces | V1 |
| `project.handover_initiated` | Notify client | Email | V1 |

### 03-PROCUREMENT Events

| Internal Event | External Action | System | V1/V2 |
|---------------|----------------|--------|-------|
| `requisition.approved` | — | — | — |
| `po.created` | — | — | — |
| `po.approved` | Notify supplier | Email (V1), Portal (V2) | V1 |
| `po.sent` | Send PO to supplier | Email with PDF | V1 |
| `goods.received` | Update inventory + notify requester | In-app | V1 |

### 06-FINANCIAL-CONTROL Events

| Internal Event | External Action | System | V1/V2 |
|---------------|----------------|--------|-------|
| `invoice.sent` | Notify client with PDF | Email / WhatsApp | V1 |
| `invoice.paid` | Submit to E-Invoice | ETA E-Invoice | V1 |
| `invoice.overdue` | Send reminder | Email / WhatsApp | V1 |
| `invoice.overdue_30` | Escalate to management | Email | V1 |
| `invoice.overdue_60` | Legal notification | Email | V1 |
| `supplier_invoice.matched` | Schedule payment | In-app | V1 |
| `supplier_invoice.paid` | Notify supplier | Email | V1 |
| `revenue.recognized` | Update BI dashboard | Metabase (DB refresh) | V1 |

### 07-MAINTENANCE Events

| Internal Event | External Action | System | V1/V2 |
|---------------|----------------|--------|-------|
| `service.created (critical)` | Notify maintenance team | WhatsApp / SMS | V1 |
| `service.assigned` | Notify engineer | In-app | V1 |
| `service.resolved` | Notify client for sign-off | WhatsApp | V1 |
| `maintenance.due` | Notify maintenance team | Email / In-app | V1 |
| `warranty.claimed` | — | — | — |

### 08-DOCUMENT-MANAGEMENT Events

| Internal Event | External Action | System | V1/V2 |
|---------------|----------------|--------|-------|
| `document.uploaded` | — | — | — |
| `document.shared` | Notify recipient with link | Email | V1 |
| `document.archived` | Move to long-term storage | DO Spaces / Glacier | V2 |

## Event Bridge Implementation

### Architecture

```
Domain Event (NestJS EventEmitter)
    │
    ▼
Event Bridge Module
    ├── Read event from internal bus
    ├── Match to integration config
    │   ├── Is this event enabled for external dispatch?
    │   └── Which external system(s)?
    ├── Transform via ACL
    ├── Apply rate limiter
    ├── Dispatch to external system
    ├── Log result
    └── Handle failure
        ├── Retry (exponential backoff)
        └── DLQ → Manual review
```

### Event Configuration

```typescript
// integration/config/event-routing.config.ts
export const eventRouting: EventRoute[] = [
  {
    event: 'quotation.sent',
    targets: [
      {
        system: 'whatsapp',
        transform: 'whatsapp-quotation-template',
        enabled: true,
        retry: { attempts: 3, backoff: 'exponential' },
        timeout: 10000,
      },
      {
        system: 'email',
        transform: 'email-quotation-sent',
        enabled: true,
        retry: { attempts: 4, backoff: 'exponential' },
        timeout: 30000,
      },
    ],
  },
];
```

### Dead Letter Queue

| Attribute | Value |
|-----------|-------|
| Storage | Database table `integration_dlq` |
| Schema | id, event_type, payload, error, retry_count, created_at |
| Retention | 30 days |
| Manual retry | UI button or API endpoint |
| Auto-retry | Notify admin, offer retry from DLQ UI |
| Alert | If DLQ count > 10 in 1 hour |

### DLQ Schema

```prisma
model IntegrationDlq {
  id         String   @id @default(uuid())
  eventType  String
  payload    Json
  target     String   // which external system
  error      String
  retryCount Int      @default(0)
  status     String   @default("pending") // pending, retrying, failed, resolved
  createdAt  DateTime @default(now())
  resolvedAt DateTime?
  notes      String?
}
```

## Event Ordering & Delivery Guarantees

| Guarantee | Implementation |
|-----------|---------------|
| At-least-once delivery | Retry until acknowledged |
| No strict ordering | Events are independent per target |
| Deduplication | Idempotency key on external systems |
| Ordering per entity | Event sequence number per aggregate |

## Future Event Automation (V2+)

| Event | Future Automation |
|-------|-------------------|
| `quotation.client_approved` | Auto-generate contract (Phase 6 has logic) |
| `contract.activated` | Auto-notify procurement to mobilize |
| `milestone.approved` | Auto-generate invoice (Phase 6 has logic) |
| `invoice.paid` | Auto-reconcile with bank statement |
| `ncr.created` | Auto-assign based on category |
| `maintenance.due` | Auto-dispatch engineer |
