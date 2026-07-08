# 06 — Synchronization Strategy

> Data movement patterns: push, pull, scheduled, real-time, offline.

## Synchronization Patterns

| Pattern | Direction | Timing | Use Case |
|---------|-----------|--------|----------|
| **Push (Event)** | Outbound | Real-time | Notifications, webhooks |
| **Push (Command)** | Outbound | Real-time | E-Invoice submission, calendar event |
| **Pull (Polling)** | Inbound | Scheduled | Bank statement import |
| **Pull (Webhook)** | Inbound | Real-time | Payment callbacks, delivery receipts |
| **Scheduled Batch** | Bidirectional | Cron | Data export, report generation |
| **Offline Sync** | Bidirectional | On-connect | Mobile field operations |

## Push Strategy (Outbound)

### Real-time Push (Events)

```
Domain Event → Event Bridge → ACL Transform → HTTP POST → External System
                                                              │
                                                     ┌────────┴────────┐
                                                     │ Success → Log   │
                                                     │ Failure → Retry │
                                                     │ Exhaust → DLQ   │
                                                     └─────────────────┘
```

**Systems:** WhatsApp, Email, Calendar, E-Invoice, Webhook dispatch

| Property | Value |
|----------|-------|
| Trigger | Domain event |
| Latency target | < 10 seconds |
| Failure mode | Retry → DLQ |
| Idempotency | Event ID as idempotency key |

### Scheduled Push (Batch)

```
Cron Trigger → Query Service → Generate Payload → ACL Transform → Batch POST
```

**Use Cases:**
| Job | Frequency | Query | Target |
|-----|-----------|-------|--------|
| E-Invoice retry | Every 30 min | Unsubmitted invoices > 2 hours old | ETA |
| Overdue reminders | Daily | Invoices past due | Email / WhatsApp |
| Monthly statements | Monthly | Project financial summary | Email to client |
| Supplier PO summary | Weekly | POs issued this week | Email to supplier |

| Property | Value |
|----------|-------|
| Trigger | Cron (node-cron / NestJS Schedule) |
| Error handling | Per-record error logging, batch partial success |
| Monitoring | Job success/failure metrics |

## Pull Strategy (Inbound)

### Webhook Pull (Real-time)

```
External System → HTTP POST → Integration Gateway → Validate HMAC → ACL Transform → Domain Command
```
**Systems:** Payment gateway callbacks, WhatsApp delivery receipts, ETA responses

| Property | Value |
|----------|-------|
| Authentication | HMAC signature verification |
| Validation | Schema validation before processing |
| Response | 200 OK (accept), 400 (reject), 500 (error) |
| Idempotency | Deduplicate by webhook ID |
| Ordering | Webhook timestamp ordering |

### Polling Pull (Scheduled)

```
Cron Trigger → Fetch External Data → ACL Transform → Match/Import → Notify
```

**Use Cases:**
| Job | Frequency | Source | Action |
|-----|-----------|--------|--------|
| Bank statement import | Daily | CSV file upload | Match payments to invoices |
| ETA status check | Hourly | ETA API | Update invoice submission status |
| WhatsApp template sync | Weekly | Meta API | Refresh available templates |

| Property | Value |
|----------|-------|
| Polling strategy | Incremental (since last poll timestamp) |
| Pagination | Handle paginated API responses |
| Deduplication | Source ID as unique key |
| First sync | Full history import (if supported) |

## Offline Synchronization (Mobile)

```
[Mobile Device]                    [Server]
     │                                │
     │─── Pull: GET /sync/pull ──────►│ Return latest data
     │◄─── Full/Delta snapshot ───────│ Since last sync timestamp
     │                                │
     │─── Push: POST /sync/push ─────►│ Process offline changes
     │                                │ Validate each record
     │◄─── Conflicts (if any) ────────│ Server wins by default
     │◄─── Sync receipt ──────────────│ Processed record IDs
```

### Conflict Resolution Strategy

| Conflict Type | Resolution | Rationale |
|---------------|-----------|-----------|
| Same field edited offline + online | **Server wins** | Platform is system of record |
| Record deleted online, edited offline | **Server deletion respected** | Safety |
| Record created offline | **Always accepted** | New record with server-generated ID |
| Concurrent offline edits (same user) | **Last write wins** | Timestamp comparison |
| Concurrent offline edits (different users) | **Server wins** | Domain rules already enforced server-side |

### Sync Frequency

| Scenario | Trigger |
|----------|---------|
| Push offline changes | On connectivity restore |
| Pull latest data | On app foreground |
| Pull critical updates | Push notification (V2) |
| Full sync | First launch + weekly |
| Delta sync | Every sync after full |

## Master Data Ownership

| Data | System of Record | Direction | Sync Method |
|------|-----------------|-----------|-------------|
| Clients/Companies | Triangle Black | Outbound | Event push |
| Contacts | Triangle Black | Outbound | Event push |
| Invoices | Triangle Black | Outbound (ETA) | Event push |
| Payments | Bank (external) | Inbound | Scheduled pull |
| Calendar Events | Google Calendar | Outbound | Real-time push |
| Documents | DO Spaces | Outbound | Real-time push |
| Supplier data | Triangle Black | Outbound | Manual upload |
| User accounts | Triangle Black | Outbound | Event push |
| PMS properties | Opera PMS (V2) | Inbound | Scheduled pull |

## Caching Strategy

| Cache | Data | TTL | Invalidation |
|-------|------|-----|-------------|
| External API responses | ETA token, WhatsApp templates | 55 min token | Refresh before expiry |
| Rate limit counters | API key usage | 1 min | In-memory |
| Static master data | Currencies, UOM, tax rates | 24 hours | Admin trigger |
| Mobile offline cache | Projects, tasks | Until sync | Sync trigger |

## Synchronization Rules

| Rule | Enforcement |
|------|-------------|
| Every sync records `last_sync_at` per entity | Sync log |
| Idempotency key on all outbound pushes | UUID per event |
| External IDs stored in domain model (`external_id`, `external_system`) | Schema field |
| Sync failures never block internal operations | Async only |
| Full audit trail for all sync operations | Integration log |
| Sensitive data never cached on mobile | Server-side only |
