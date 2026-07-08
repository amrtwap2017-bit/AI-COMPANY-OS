# Phase 06 — Financial Control

> Accounts receivable, accounts payable, 3-way match, revenue recognition, and GL.

## Domain Scope

| Capability | Description | Priority |
|------------|-------------|----------|
| Accounts Receivable | Invoicing, collections, aging | P0 |
| Accounts Payable | Bill capture, approval, payment | P0 |
| 3-Way Match | PO-GR-Invoice matching | P0 |
| Revenue Recognition | Milestone-based, percentage complete | P0 |
| General Ledger | Chart of accounts, journal entries | P1 |

## Entity Relationship

```
Invoice ──► 1:N ──► InvoiceLine
    │ 1:N ──► CreditNote
    │ 1:1 ──► ThreeWayMatch ──► PurchaseOrder (Procurement)
    │                         ──► GoodsReceipt (Procurement)
    │
    └─► RevenueRecognition ──► 1:1 ──► Milestone (Project Delivery)
                                      ──► Project

GL (General Ledger)
└─► GLEntry ──► N:1 ──► Invoice / Payment / CreditNote
```

## Key Business Rules

- Revenue recognized only on milestone approval
- 3-way match must pass before payment processing
- ETA invoice submission within 24 hours of creation

## Location

`06-FINANCIAL-CONTROL/` — 20 files following the standard template.

**Phase 7 Integration:** INT-001 (ETA E-Invoice), INT-007 (Bank CSV Import).
