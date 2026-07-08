# Integrations Module Map

## Scope
External system integrations including accounting systems, project management systems, ERP systems, maps/geocoding, email, messaging/notifications, payment gateways, and calendar synchronization.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Accounting Integration | 5 | 240 |
| PMS Integration | 4 | 190 |
| ERP Integration | 5 | 250 |
| Maps Integration | 4 | 160 |
| Email Integration | 5 | 210 |
| Messaging Integration | 4 | 180 |
| Payments Integration | 5 | 230 |
| Calendar Integration | 4 | 170 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/11-Integrations-Domain.md` — Full integrations domain spec
- `05-INTEGRATIONS/01-Integration-Architecture.md` — Integration architecture
- `05-INTEGRATIONS/02-External-System-Mappings.md` — External system mappings
- `05-INTEGRATIONS/03-Webhook-Design.md` — Webhook and event design

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 8 |
| Frontend pages | Next.js pages | 8 |
| Database tables | Prisma models | 10 |
| API endpoints | REST routes | 40 |
| Test files | spec/test files | 48 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| IntegrationConnection | IntegrationConnection | Connection config to external system |
| SyncLogEntry | SyncLogEntry | Data sync audit log |
| FieldMapping | FieldMapping | Field-level mapping rule |
| ERPConnection | ERPConnection | ERP system connection |
| ERPEntityMapping | ERPEntityMapping | Entity mapping for ERP sync |
| EmailConfig | EmailConfig | Email integration settings |
| EmailMessage | EmailMessage | Synced email message |
| MessagingConfig | MessagingConfig | Messaging channel config |
| WebhookEndpoint | WebhookEndpoint | Registered webhook endpoint |
| PaymentGateway | PaymentGateway | Payment gateway config |
| PaymentTransaction | PaymentTransaction | Payment transaction record |
| CalendarConfig | CalendarConfig | Calendar integration config |
| CalendarEvent | CalendarEvent | Synced calendar event |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /integrations/accounting/config | GET/POST | Configure accounting integration |
| /integrations/accounting/sync | POST | Trigger accounting sync |
| /integrations/pms/config | GET/POST | Configure PMS integration |
| /integrations/pms/sync/tasks | POST | Sync tasks with PMS |
| /integrations/erp/config | GET/POST | Configure ERP integration |
| /integrations/erp/sync | POST | Trigger ERP sync |
| /integrations/maps/geocode | POST | Geocode address |
| /integrations/maps/route | POST | Calculate optimized route |
| /integrations/email/config | GET/POST | Configure email integration |
| /integrations/email/send | POST | Send email |
| /integrations/messaging/send | POST | Send message |
| /integrations/messaging/webhooks | POST | Register webhook |
| /integrations/payments/charge | POST | Process payment |
| /integrations/payments/refund | POST | Process refund |
| /integrations/calendar/sync | POST | Trigger calendar sync |
| /integrations/calendar/events | POST | Create calendar event |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /integrations/accounting | AccountingConfigForm, SyncStatusView | Accounting integration |
| /integrations/pms | PMSConfigForm, TaskSyncView | PMS integration |
| /integrations/erp | ERPConfigForm, DataFlowView | ERP integration |
| /integrations/maps | MapsConfigForm, GeocodingView | Maps integration |
| /integrations/email | EmailConfigForm, EmailListView | Email integration |
| /integrations/messaging | MessagingConfigForm, ChannelStatusView | Messaging integration |
| /integrations/payments | PaymentConfigForm, TransactionListView | Payments integration |
| /integrations/calendar | CalendarConfigForm, EventSyncView | Calendar integration |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| SyncErrorResolutionAI | Auto-resolve sync errors |
| SyncConflictResolutionAI | Resolve sync conflicts |
| ERPDataMappingAI | Suggest ERP field mappings |
| RouteOptimizationAI | Optimize map routes |
| SmartReplyAI | Suggest email replies |
| EmailPriorityAI | Prioritize incoming emails |
| MessageRoutingAI | Route messages to channels |
| FraudDetectionAI | Detect payment fraud |
| SmartSchedulingAI | Optimize meeting scheduling |

## Estimated Sprint Allocation: 4 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Financial Control — Weak (accounting/payments integration)
- Project Delivery — Weak (PMS integration)
- Procurement — Weak (ERP integration)
- Document Management — Weak (email attachment sync)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for sync flow
- Prisma — Schema validation
- OWASP — Security scanning (API keys, webhooks)
- k6 — Performance testing (sync throughput)
