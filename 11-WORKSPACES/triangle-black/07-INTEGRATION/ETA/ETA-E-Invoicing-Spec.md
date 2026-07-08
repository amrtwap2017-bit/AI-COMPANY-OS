# ETA E-Invoicing Integration Specification

> Egyptian Tax Authority (ETA) e-invoicing integration contract for Triangle Black.

## Overview

Egypt's e-invoicing mandate (Law 67/2016) requires all B2B invoices to be submitted to the ETA in real-time. This document specifies the integration contract between Triangle Black's Financial Control domain and the ETA e-invoicing system.

## ETA API Version

| Property | Value |
|----------|-------|
| API Version | v1.2 |
| Base URL (Production) | `https://api.invoicing.eta.gov.eg/` |
| Base URL (Sandbox) | `https://api.invoicing.eta.gov.eg/apis/portalintegrationtest` |
| Authentication | OAuth 2.0 (Client Credentials Grant) |
| Token Lifetime | 60 minutes (renew at 55 min) |
| Rate Limit | 100 requests/minute per client |

## Authentication

### Credentials Required

| Credential | Source | Storage |
|------------|--------|---------|
| Client ID | ETA portal registration | Environment variable (encrypted) |
| Client Secret | ETA portal registration | Secret manager / encrypted env |
| Tax ID (registration number) | Company tax card | Per-tenant configuration |

### Token Acquisition

```
POST /api/auth/token
Content-Type: application/json

{
  "client_id": "...",
  "client_secret": "...",
  "grant_type": "client_credentials"
}

→ 200 Response:
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

Token stored in Redis with 55-minute TTL. Auto-refresh on expiry.

## Invoice Submission

### Endpoint

```
POST /api/v1.2/documentsubmissions
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Request Body

```json
{
  "documents": [
    {
      "issuer": {
        "address": {
          "branchID": "0",
          "country": "EG",
          "governate": "Cairo",
          "regionCity": "New Cairo",
          "street": "Fifth Settlement",
          "buildingNumber": "12",
          "postalCode": "11835",
          "floor": "3",
          "room": "302",
          "landmark": "Infinity Tower"
        },
        "type": "B",
        "id": "{tax_id}",
        "name": "Triangle Black for Engineering"
      },
      "receiver": {
        "address": {
          "country": "EG",
          "governate": "string",
          "regionCity": "string",
          "street": "string",
          "buildingNumber": "string"
        },
        "type": "B",
        "id": "{client_tax_id}",
        "name": "{client_legal_name}"
      },
      "documentType": "I",
      "documentTypeVersion": "1.0",
      "dateTimeIssued": "2026-07-02T14:30:00Z",
      "taxpayerActivityCode": "432100",
      "internalID": "{triangle_black_invoice_number}",
      "purchaseOrderReference": "{purchase_order_number_or_null}",
      "invoiceLines": [
        {
          "description": "AC Maintenance Service - Month June 2026",
          "itemType": "GS1",
          "itemCode": "EG-432100-001",
          "unitType": "EA",
          "quantity": 1,
          "unitValue": {
            "currencySold": "EGP",
            "amountSold": 50000.00
          },
          "valueDifference": 0,
          "totalSales": 50000.00,
          "totalDiscount": 0,
          "netTotal": 50000.00,
          "valueDifference": 0,
          "itemsDiscount": 0,
          "discount": {
            "rate": 0,
            "amount": 0
          },
          "taxableItems": [
            {
              "taxType": "T1",
              "amount": 7000.00,
              "subType": "V009",
              "rate": 14
            }
          ],
          "internalCode": "SVC-001"
        }
      ],
      "totalDiscount": 0,
      "totalSales": 50000.00,
      "netTotal": 50000.00,
      "totalAmount": 57000.00,
      "extraDiscount": 0,
      "totalItemsDiscount": 0,
      "taxTotals": [
        {
          "taxType": "T1",
          "amount": 7000.00
        }
      ],
      "documentNote": "Payment terms: Net 30 days",
      "signatures": []
    }
  ]
}
```

### Success Response (200)

```json
{
  "acceptedDocuments": [
    {
      "uuid": "638a6cbf-4e5b-4a9b-8f56-1b2c3d4e5f6a",
      "internalId": "{triangle_black_invoice_number}",
      "longId": "120000123456",
      "status": "Submitted"
    }
  ],
  "rejectedDocuments": []
}
```

### Error Response (4xx)

```json
{
  "rejectedDocuments": [
    {
      "internalId": "INV-2026-00123",
      "error": {
        "code": "INVALID_INVOICE_LINE",
        "message": "Gross price mismatch",
        "details": [
          {
            "field": "invoiceLines[0].netTotal",
            "value": "50001.00",
            "expected": "50000.00"
          }
        ]
      }
    }
  ]
}
```

## Invoice Status Polling

### Endpoint

```
GET /api/v1.2/documents/{uuid}/status
Authorization: Bearer {token}
```

### Response

```json
{
  "uuid": "638a6cbf-4e5b-4a9b-8f56-1b2c3d4e5f6a",
  "status": "Accepted",
  "longId": "120000123456",
  "dateTimeReceived": "2026-07-02T14:31:00Z",
  "dateTimeIssued": "2026-07-02T14:30:00Z"
}
```

Possible statuses: `Submitted`, `Accepted`, `Rejected`, `Cancelled`, `Pending`

## QR Code Generation

Every invoice issued in Egypt must include an ETA-compliant QR code. The QR code encodes a TLV (Tag-Length-Value) structure:

| Tag | Field | Example |
|-----|-------|---------|
| 1 | Seller Name | "Triangle Black for Engineering" |
| 2 | VAT Registration Number | "123-456-789" |
| 3 | Time Stamp | "2026-07-02T14:30:00Z" |
| 4 | Invoice Total | "57000.00" |
| 5 | Total VAT | "7000.00" |

Generated on the backend using `qrcode` npm package with TLV encoding. Included in:
- PDF invoice (printed)
- API response (`invoice.qr_code` as base64 PNG)

## Submission Workflow

```
[START] Invoice approved for sending
    │
    ▼
Financial Control marks invoice as 'ready_for_eta'
    │
    ▼
ETA Submission Service picks up (polling or event):
    │
    ├── 1. Validate invoice data completeness
    │     ├── Tax ID present and valid
    │     ├── All required fields populated
    │     └── VAT calculation matches (net × 0.14)
    │
    ├── 2. Get OAuth token (cache with 55min TTL)
    │
    ├── 3. Transform invoice → ETA JSON (via ACL)
    │
    ├── 4. POST /documentsubmissions
    │     │
    │     ├── 200 → Store UUID → invoice.eta_status = 'submitted'
    │     ├── 400 → Log error → invoice.eta_status = 'rejected' → Notify finance
    │     ├── 401 → Refresh token → Retry (max 1)
    │     └── 5xx → Enqueue retry (exponential backoff: 5min, 15min, 1h)
    │
    ├── 5. Poll status (cron, hourly):
    │     ├── 'Accepted' → invoice.eta_status = 'accepted', store longId
    │     ├── 'Rejected' → invoice.eta_status = 'rejected', notify finance
    │     └── 'Pending' → Keep polling
    │
    └── 6. Generate QR code → Store as base64 on invoice record
[END]
```

## Retry Logic

| Attempt | Delay | Notes |
|---------|-------|-------|
| 1 | Immediate | Original submission |
| 2 | 5 minutes | Network error or 5xx |
| 3 | 15 minutes | Exponential backoff |
| 4 | 1 hour | Exponential backoff |
| Final | — | Mark as failed, alert finance team |

Max 3 retries for 4xx errors (invalid data). Max 4 retries for 5xx errors (server/network). After final retry failure, invoice is marked `eta_failed` with error details, and a notification is sent to the finance team for manual intervention.

## Database Schema Extensions

### invoices table additions

| Column | Type | Notes |
|--------|------|-------|
| eta_status | ENUM | not_submitted, ready, submitting, submitted, accepted, rejected, failed |
| eta_uuid | VARCHAR(36) | ETA document UUID (nullable) |
| eta_long_id | VARCHAR(20) | ETA long ID (nullable) |
| eta_submitted_at | TIMESTAMPTZ | Submission timestamp |
| eta_accepted_at | TIMESTAMPTZ | Acceptance timestamp |
| eta_rejection_code | VARCHAR(50) | ETA rejection code (nullable) |
| eta_rejection_reason | TEXT | ETA rejection details (nullable) |
| eta_retry_count | INTEGER | Current retry attempt |
| eta_qr_code | TEXT | Base64-encoded QR code PNG |

## Reconciliation

| Scenario | Action |
|----------|--------|
| Invoice submitted, pending acceptance | Poll hourly, update status |
| Invoice accepted | Store longId, mark invoice as tax-compliant |
| Invoice rejected (data error) | Alert finance, fix data, resubmit |
| Invoice rejected (duplicate) | Check if previous UUID was accepted, update status |
| ETA service unavailable (5xx) | Queue for retry, alert dev team after 4 failures |
| ETA response timeout | Query status by internalId, reconcile |

## Invoice Types

| ETA Code | Description | Used For |
|----------|-------------|----------|
| I | Invoice | Standard B2B invoice |
| C | Credit Note | Invoice correction, refund |
| D | Debit Note | Additional charges post-invoice |

## Testing & Validation

| Test | Description | Expected |
|------|-------------|----------|
| Connection test | POST token endpoint | 200 + access_token |
| Schema validation | Submit minimal valid invoice | 200 + accepted |
| Schema rejection | Submit invoice with missing fields | 400 + rejectedDocuments |
| Duplicate detection | Submit same invoice twice | Second = duplicate error |
| Retry logic | Cause 5xx (invalid endpoint) | 4 retries, then manual flag |
| QR code generation | Generate QR for sample invoice | Valid TLV structure readable by ETA app |
| Status polling | Submit invoice, poll status | Status transitions Submitted → Accepted |
| Reconciliation | Mark invoice accepted, verify DB update | eta_status = 'accepted' |

## Monitoring & Alerts

| Alert Condition | Severity | Action |
|----------------|----------|--------|
| ETA submission failure (5xx × 4) | Critical | Notify dev team via PagerDuty |
| ETA rejection (data error) | High | Notify finance team in-app + email |
| ETA token expiry (401) | Medium | Auto-refresh, log warning |
| ETA rate limit exceeded (429) | Medium | Back off, log warning |
| Invoice pending > 1 hour | Low | Flag for review |
| ETA API latency > 5s | Low | Monitor, log for optimization |

## Compliance Notes

- Egyptian e-invoicing is mandatory for all B2B transactions since July 2024
- All invoices must be submitted within 24 hours of issuance
- Credit/debit notes must reference the original invoice UUID
- QR code must be printed on all invoice copies
- ETA requires 5-year archival of all invoice records
- VAT rate: 14% (standard), 5% (some services), 0% (export)
- Taxpayer activity codes must match the registered business activities
