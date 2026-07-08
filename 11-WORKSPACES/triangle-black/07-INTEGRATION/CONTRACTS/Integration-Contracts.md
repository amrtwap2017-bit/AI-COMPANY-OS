# 04 — Integration Contracts

> Formal contracts for every external system integration.

## Contract Template

Every integration contract documents:

```
ID:          INT-{NNN}
System:      {External System Name}
Version:     {Contract Version}
Status:      draft | active | deprecated | sunset
Owner:       {Responsible Team}
SLA:         {Availability, Latency, Throughput}
```

---

## INT-001 — ETA E-Invoice (Egypt Tax Authority)

| Attribute | Specification |
|-----------|--------------|
| **Purpose** | Submit invoices to Egypt Tax Authority for VAT compliance |
| **Version** | 1.0 |
| **Status** | Active |
| **Owner** | Finance |
| **SLA** | 99.5% availability, < 5s per submission |

### Authentication
| Attribute | Value |
|-----------|-------|
| Method | OAuth 2.0 Client Credentials |
| Token URL | `https://api.invoicing.eta.gov.eg/connect/token` |
| Credentials | Client ID + Client Secret (stored in Secrets Vault) |
| Refresh | Auto-refresh before expiry (55 min for 60-min tokens) |

### Endpoints
| Operation | Method | URL | Purpose |
|-----------|--------|-----|---------|
| Submit Invoice | POST | `/api/v1.0/documentsubmissions` | Submit single invoice |
| Check Status | GET | `/api/v1.0/documentsubmissions/{uuid}` | Check submission status |
| Get Document | GET | `/api/v1.0/documents/{uuid}` | Retrieve submitted document |

### Payload — Internal → ETA

Internal invoice → ACL → ETA JSON:

```json
{
  "issuer": {
    "address": { "country": "EG", ... },
    "type": "B",
    "id": { "issuerId": "{taxId}", "type": "TN" }
  },
  "receiver": { ... },
  "documentType": "i",
  "documentTypeVersion": "1.0",
  "dateTimeIssued": "2026-07-15T14:30:00Z",
  "taxActivity": "EGS",
  "totalSales": 100000.00,
  "totalDiscount": 0.00,
  "netAmount": 100000.00,
  "totalAmount": 114000.00,
  "items": [...],
  "taxTotals": [{ "taxType": "T1", "amount": 14000.00 }]
}
```

### Validation
| Rule | Enforcement |
|------|-------------|
| Tax ID format | Egypt format: 9 digits + check digit |
| Total = sum(line items) + VAT | Reject if mismatch |
| VAT = 14% of net | Reject if mismatch |
| Required fields all present | Schema validation |

### Retry Strategy
| Attempt | Delay | Notes |
|---------|-------|-------|
| 1 | 0s | Initial attempt |
| 2 | 5s | Transient error |
| 3 | 30s | Service unavailable |
| 4 | 120s | Rate limited |
| Final | — | DLQ — manual review |

### Error Handling
| HTTP Code | ETA Code | Action |
|-----------|----------|--------|
| 400 | VALIDATION_ERROR | Fix invoice data, resubmit |
| 401 | UNAUTHORIZED | Refresh token, retry |
| 403 | FORBIDDEN | Check credentials, escalate |
| 409 | DUPLICATE | Invoice already submitted, update status |
| 422 | BUSINESS_ERROR | Check rejection reason, manual review |
| 429 | RATE_LIMITED | Backoff and retry |
| 5xx | SERVER_ERROR | Retry with backoff |

### Timeout
| Setting | Value |
|---------|-------|
| Connection | 10s |
| Request | 30s |
| Response | 30s |

### Fallback
| Scenario | Action |
|----------|--------|
| ETA unavailable | Queue invoice, retry every 30 min. Notify finance if > 2 hours |
| Validation failure | Return to invoice with specific error, block payment |

### Audit
| Field | Captured |
|-------|----------|
| Submission UUID | Integration log |
| Request payload | Logged (full) |
| Response payload | Logged (full) |
| Timestamp | UTC |
| Status | success / failed / pending |
| Duration | ms |

### Monitoring
| Metric | Alert Threshold |
|--------|----------------|
| Submission failure rate | > 5% in 1 hour |
| Response time | > 10s average |
| ETA unavailable | Any 5xx in 5 minutes |

### Deprecation
| Attribute | Value |
|-----------|-------|
| Notice period | 6 months |
| Sunset header | On deprecated versions |
| Migration path | Documented in release notes |

---

## INT-002 — SMTP Email

| Attribute | Specification |
|-----------|--------------|
| **Purpose** | Send transactional emails (quotations, invoices, notifications) |
| **Version** | 1.0 |
| **Status** | Active |
| **Owner** | System |
| **SLA** | 99% delivery within 5 minutes |

### Authentication
| Method | Value |
|--------|-------|
| SMTP | Username + Password (Postfix credentials) |
| Port | 587 (STARTTLS) or 465 (SSL/TLS) |

### Payload
| Field | Type | Max |
|-------|------|-----|
| To | Email[] | 50 recipients |
| CC | Email[] | 20 recipients |
| Subject | String | 998 chars |
| Body (HTML) | String | 2MB |
| Body (Text) | String | 2MB |
| Attachments | File[] | 10MB total |

### Retry
| Attempt | Delay |
|---------|-------|
| 1 | 0s |
| 2 | 60s |
| 3 | 300s |
| 4 | 900s |
| Final | DLQ |

### Timeout
| Setting | Value |
|---------|-------|
| Connection | 15s |
| Send | 30s |

### Fallback
Queue email for retry. After 4 failures, notify system admin.

---

## INT-003 — WhatsApp Business API

| Attribute | Specification |
|-----------|--------------|
| **Purpose** | Send client notifications (quotations, status updates) |
| **Version** | 1.0 |
| **Status** | Active |
| **Owner** | Commercial |
| **SLA** | 99% delivery within 2 minutes |

### Authentication
| Method | Value |
|--------|-------|
| Type | Bearer Token (Meta Business API) |
| URL | `https://graph.facebook.com/v21.0/{phone-number-id}/messages` |
| Token | Permanent access token (Secrets Vault) |

### Payload
```json
{
  "messaging_product": "whatsapp",
  "to": "{recipient_phone}",
  "type": "template",
  "template": {
    "name": "quotation_ready",
    "language": { "code": "ar" },
    "components": [{
      "type": "body",
      "parameters": [
        { "type": "text", "text": "{client_name}" },
        { "type": "text", "text": "{quotation_number}" }
      ]
    }]
  }
}
```

### Rate Limits
| Limit | Window |
|-------|--------|
| 250 messages | Per business phone number per day |
| 80 messages | Per conversation per day |

### Retry
| Attempt | Delay |
|---------|-------|
| 1 | 0s |
| 2 | 30s |
| 3 | 120s |
| Final | DLQ |

### Fallback
After WhatsApp failure → send SMS (if configured) → send email.

---

## INT-004 — Google Calendar API

| Attribute | Specification |
|-----------|--------------|
| **Purpose** | Create site survey events in Google Calendar |
| **Version** | 1.0 |
| **Status** | Active |
| **Owner** | Operations |
| **SLA** | 99% creation within 10 seconds |

### Authentication
| Method | Value |
|--------|-------|
| Type | OAuth 2.0 (Service Account) |
| Scopes | `https://www.googleapis.com/auth/calendar.events` |
| Credentials | Service account JSON key (Secrets Vault) |

### Endpoint
`POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`

### Payload
```json
{
  "summary": "Site Survey: {company} - {project}",
  "description": "Surveyor: {name}\nOpportunity: {id}\nContact: {phone}",
  "start": { "dateTime": "{iso_date}", "timeZone": "Africa/Cairo" },
  "end": { "dateTime": "{iso_date_end}", "timeZone": "Africa/Cairo" },
  "attendees": [{ "email": "{engineer_email}" }],
  "reminders": {
    "useDefault": false,
    "overrides": [
      { "method": "email", "minutes": 1440 },
      { "method": "popup", "minutes": 30 }
    ]
  }
}
```

---

## INT-005 — DigitalOcean Spaces (S3-compatible)

| Attribute | Specification |
|-----------|--------------|
| **Purpose** | Document and photo storage |
| **Version** | 1.0 |
| **Status** | Active |
| **Owner** | System |
| **SLA** | 99.9% availability (DO SLA) |

### Authentication
| Method | Value |
|--------|-------|
| Type | Access Key + Secret Key (AWS Signature V4) |
| Endpoint | `https://{region}.digitaloceanspaces.com` |

### Usage
| Operation | SDK Method | Notes |
|-----------|-----------|-------|
| Upload | `PutObject` | Public-read for shared docs |
| Download | `GetObject` | Signed URL for private docs |
| Delete | `DeleteObject` | Soft-delete first |
| List | `ListObjects` | Paginated |

### Security
| Setting | Value |
|---------|-------|
| Default bucket | Private |
| Signed URL expiry | 1 hour (extendable) |
| Server-side encryption | AES-256 |

---

## INT-006 — Bank Statement Import (CSV)

| Attribute | Specification |
|-----------|--------------|
| **Purpose** | Import bank statements for payment reconciliation |
| **Version** | 1.0 |
| **Status** | Active |
| **Owner** | Finance |
| **SLA** | Best effort |

### Format
CSV file with columns:
```
Date, Description, Reference, Debit, Credit, Balance
```

### ACL Processing
```typescript
interface BankRow {
  date: string;        // ISO format after parse
  description: string; // Free text
  reference: string;   // Cheque/transaction number
  debit: number;       // 0 if credit
  credit: number;      // 0 if debit
  balance: number;     // Running balance
}

// Match to internal Payment record
// Match on: reference OR (amount AND close date)
// Unmatched rows → manual review queue
```

### Validation
| Rule | Action |
|------|--------|
| Balance continuity check | Flag gap or mismatch |
| Duplicate reference | Flag for review |
| Unknown transaction | Manual categorization |

---

## INT-007 — Webhook Dispatch (Outbound)

| Attribute | Specification |
|-----------|--------------|
| **Purpose** | Notify external systems of platform events |
| **Version** | 1.0 |
| **Status** | Active |
| **Owner** | System |
| **SLA** | 99.9% delivery within 30 seconds |

### Authentication
| Method | Value |
|--------|-------|
| HMAC | SHA-256 signature in header `X-Signature` |
| Payload | `{ "version": "1.0", "event": "...", "data": {...} }` |

### Retry
| Attempt | Delay |
|---------|-------|
| 1 | 0s |
| 2 | 10s |
| 3 | 60s |
| Final | Disable webhook, notify admin |

### Response Expectations
| Code | Action |
|------|--------|
| 200/204 | Success — mark delivered |
| 400/422 | Invalid payload — disable webhook, notify admin |
| 401/403 | Auth error — disable webhook, notify admin |
| 429 | Rate limited — retry with backoff |
| 5xx | Server error — retry |

---

## Integration Contract Registry

All contracts stored at:
```
docs/integration/contracts/
├── INT-001-eta-einvoice.md
├── INT-002-smtp-email.md
├── INT-003-whatsapp.md
├── INT-004-google-calendar.md
├── INT-005-do-spaces.md
├── INT-006-bank-csv.md
├── INT-007-webhook-dispatch.md
└── TEMPLATE.md
```

Each contract must be reviewed annually and updated if external system API changes.
