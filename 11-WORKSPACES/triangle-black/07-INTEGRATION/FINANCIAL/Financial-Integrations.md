# 08 — Financial Integrations

> E-Invoice, banking, payment gateways, ERP, accounting.

## Financial Integration Architecture

```
                    ┌─────────────────────────────────────────┐
                    │         FINANCIAL CONTROL (06)          │
                    │         Internal Domain                  │
                    │                                          │
                    │  Invoices ─┐  Payments ─┐  GL ─┐        │
                    └────────────┬─────────────┬──────┘        │
                                 │             │               │
                    ┌────────────▼─────────────▼──────┐        │
                    │     FINANCIAL INTEGRATION ACL     │        │
                    │                                   │        │
                    │  ┌──────────┐  ┌──────────────┐   │        │
                    │  │ETA ACL   │  │Bank ACL      │   │        │
                    │  └────┬─────┘  └──────┬───────┘   │        │
                    │  ┌────▼─────┐  ┌──────▼───────┐   │        │
                    │  │Payment   │  │ERP/Accounting│   │        │
                    │  │Gateway   │  │ACL           │   │        │
                    │  │ACL       │  │              │   │        │
                    │  └────┬─────┘  └──────┬───────┘   │        │
                    └────────┬──────────────┬────────────┘        │
                             │              │                     │
               ┌─────────────┼──────────────┼──────────────┐      │
               │             │              │              │      │
          ┌────▼────┐  ┌────▼────┐  ┌──────▼─────┐  ┌─────▼───┐  │
          │ ETA     │  │ Bank    │  │ Payment    │  │ ERP /   │  │
          │ E-Inv.  │  │ CSV/API │  │ Gateway    │  │ Accounting│  │
          └─────────┘  └─────────┘  └────────────┘  └──────────┘  │
```

## Integration Matrix

| Integration | Direction | Timing | V1 | V2 | V3 |
|-------------|-----------|--------|----|----|----|
| Egypt E-Invoice (ETA) | Outbound | Real-time | ✅ | — | — |
| Bank Statement Import | Inbound | Daily | ✅ (CSV) | ✅ (API) | — |
| Payment Gateway | Bidirectional | Real-time | ❌ (Manual) | ✅ | — |
| ERP / Accounting Export | Outbound | Daily | ✅ (CSV) | ✅ (API) | — |
| VAT Return Filing | Outbound | Quarterly | ❌ (Manual) | ❌ (Manual) | ✅ |
| Egypt E-Invoice (full) | Bidirectional | Real-time | ❌ (Submit only) | ✅ (Full) | — |

## 1. ETA E-Invoice (Egypt Tax Authority)

### Scope

| Capability | V1 | V2 |
|------------|----|----|
| Invoice submission | ✅ Automatic on invoice.paid | — |
| Credit note submission | ❌ Manual | ✅ |
| Rejected invoice handling | ❌ Manual | ✅ Auto-retry |
| ETA status polling | ✅ Hourly | — |
| VAT return filing | ❌ Manual | ❌ Manual (V3) |

### Submission Flow

```
invoice.paid → Invoice submitted flag = false
    │
    ▼
ETA Service:
    ├── Transform internal invoice → ETA JSON (ACL)
    ├── Get OAuth token (cache 55 min)
    ├── POST /documentsubmissions
    ├──
    ├── 200 UUID → Store ETA reference → invoice.eta_status = 'submitted'
    ├── 4xx → Log error → invoice.eta_status = 'rejected' → notify finance
    └── 5xx → Retry queue → schedule retry in 5 min
    │
    ▼
ETA Status Polling (cron, hourly):
    ├── Query ETA for each submitted invoice
    ├── 200 accepted → invoice.eta_status = 'accepted'
    └── 400 rejected → invoice.eta_status = 'rejected' → notify finance
```

### Rejection Handling

| ETA Rejection Code | Action |
|-------------------|--------|
| Invalid tax ID | Notify finance to fix company record |
| Amount mismatch | Notify finance to verify invoice |
| Duplicate UUID | Update status to accepted |
| Schema validation | Log error, notify dev team |

## 2. Banking Integration

### V1: CSV Statement Import

| Step | Description |
|------|-------------|
| 1 | User downloads CSV from bank portal |
| 2 | Upload to Triangle Black (file upload) |
| 3 | Parse CSV → BankStatement rows (ACL) |
| 4 | Match against unpaid invoices |
| 5 | Auto-match: reference OR (amount + close date) |
| 6 | Unmatched: manual review queue |
| 7 | Matched: record payment, update invoice status |

### Bank CSV Format Support

| Bank | Format | V1/V2 |
|------|--------|-------|
| CIB (Commercial International Bank) | CSV | V1 |
| QNB Al Ahli | CSV | V1 |
| Banque Misr | CSV | V1 |
| HSBC Egypt | CSV | V1 |
| Arab African International Bank | CSV | V1 |

### V2: Direct Bank API

| Bank | API Availability | Method |
|------|-----------------|--------|
| CIB | Corporate API | REST/OAuth |
| Banque Misr | E-Payment gateway | REST |
| QNB | Corporate banking API | REST (V2+) |

## 3. Payment Gateway Integration

### V2+ Scope

| Gateway | Egypt Presence | Transaction Fee | V2/V3 |
|---------|---------------|-----------------|-------|
| Fawry | Highest | 1.5-3% | V2 |
| Paymob | High | 1.5-2.5% | V2 |
| Kiosk (Fawry) | Universal | 2-5 EGP per transaction | V2 |
| Aman | Medium | 1.5-3% | V3 |
| ValU / Sympl | BNPL | 3-5% | V3 |

### Payment Flow (V2)

```
Invoice sent to client → Client views online
    │
    ▼
Client clicks "Pay Now":
    ├── Redirect to payment gateway
    ├── Client pays (card, wallet, kiosk)
    └── Gateway callback → Webhook received
    │
    ▼
Integration Gateway:
    ├── Verify HMAC signature
    ├── Match to invoice
    ├── Record payment
    └── Update invoice status → paid
```

## 4. ERP / Accounting Export

### V1: CSV/Excel Export

| Report | Frequency | Content | Format |
|--------|-----------|---------|--------|
| Journal Entries | Daily | All GL entries for the day | CSV |
| Invoice Register | Weekly | All invoices issued | CSV |
| Payment Report | Weekly | All payments received | CSV |
| Supplier Invoice Log | Weekly | All supplier invoices | CSV |
| Trial Balance | Monthly | GL account balances | CSV |
| Project P&L | Monthly | Per-project revenue and cost | CSV |

### V2: Direct ERP Integration

| ERP | Method | V2/V3 |
|-----|--------|-------|
| Odoo | REST API | V2 |
| Oracle NetSuite | REST API | V3 |
| SAP | RFC / REST | V3 |
| Microsoft Dynamics | REST API | V3 |

## 5. Tax Compliance

### Egypt VAT Requirements

| Requirement | Compliance Method |
|-------------|------------------|
| Invoice within 72 hours | ETA submission on invoice.paid |
| VAT 14% correct | Schema validation before submission |
| Correct tax ID format | Validator in ACL |
| ETA reference on invoice | Stored in invoice.eta_reference |
| Invoice archiving (5 years) | PDF stored in DO Spaces |
| Tax authority audit support | Full audit trail on all submissions |

### VAT Return Support (V3)

| Capability | Description |
|-----------|-------------|
| Input VAT calculation | Sum of supplier invoice VAT |
| Output VAT calculation | Sum of client invoice VAT |
| Net VAT calculation | Output - Input |
| ETA filing | Automated submission to ETA portal |
| Payment scheduling | Schedule VAT payment in cash flow |
