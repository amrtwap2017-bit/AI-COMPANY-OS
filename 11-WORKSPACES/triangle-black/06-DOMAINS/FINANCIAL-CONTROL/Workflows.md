# 06-FINANCIAL-CONTROL — Workflows

## W1: Client Invoice from Milestone

```
[Milestone Approved] → Create Invoice
    ├── Draft invoice from milestone value
    ├── Add taxes (14% VAT)
    ├── Set due date (per contract terms)
    └── Status = 'draft'
    │
    ▼
Finance reviews → Submit
    │
    ▼
Send to client:
    ├── Status = 'sent'
    ├── Email to client with PDF
    └── AR aging starts

Client pays:
    ├── Record payment → Status = 'paid'
    └── Recognize revenue → Update project P&L
    │
    If overdue:
    ├── Status = 'overdue'
    ├── Send reminder (7d, 14d, 30d overdue)
    └── Escalate if > 60 days
```

## W2: Supplier Invoice Matching

```
[Supplier Invoice Received] → Enter invoice
    ├── Reference PO number
    ├── Invoice amount
    └── Upload invoice document
    │
    ▼
3-Way Match:
    ├── PO amount match
    ├── Goods Receipt quantity match
    └── Invoice total match
    │
    ├── All match → Approve → Schedule payment
    └── Mismatch → Flag discrepancy → Resolve
```

## W3: Revenue Recognition

```
[Milestone Approved] → Invoice sent → Payment received
    │
    ▼
Revenue recognized:
    ├── Credit: Revenue (P&L)
    ├── Debit: Cash / Accounts Receivable
    └── Update project P&L
```
