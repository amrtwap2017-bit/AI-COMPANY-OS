# Sprint 014 — Financial AP — Payables and Matching

## Goal
Build accounts payable with supplier invoice processing, 3-way matching, payment runs, and expense management to manage outgoing payments.

## Capabilities
- FIN-006 — Supplier Invoice Processing — from Financial Control
- FIN-007 — 3-Way Matching — from Financial Control
- FIN-008 — Payment Runs — from Financial Control
- FIN-009 — Expense Management — from Financial Control
- FIN-010 — Supplier Payments — from Financial Control

## Context Pack Required
**Pack ID:** CP-Financial-Invoicing
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/05-Financial-Control/Supplier-Invoicing.md` — Supplier Invoicing
- `../02-DOMAIN-DOCS/05-Financial-Control/3-Way-Matching.md` — 3-Way Matching
- `../02-DOMAIN-DOCS/05-Financial-Control/Payment-Runs.md` — Payment Runs
- `../02-DOMAIN-DOCS/05-Financial-Control/Expense-Management.md` — Expense Management

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Integration-Standards.md` — Integration Standards

## Entities to Build
- SupplierInvoice — Financial Control
- SupplierInvoiceLine — Financial Control
- MatchResult — Financial Control
- PaymentRun — Financial Control
- PaymentRunItem — Financial Control
- SupplierPayment — Financial Control
- ExpenseReport — Financial Control
- ExpenseLine — Financial Control
- ExpenseCategory — Financial Control

## APIs to Build
- `/api/financial/supplier-invoices` — GET/POST — Supplier invoices
- `/api/financial/supplier-invoices/{id}` — GET/PUT — Invoice detail
- `/api/financial/supplier-invoices/{id}/lines` — GET/POST — Invoice lines
- `/api/financial/supplier-invoices/{id}/match` — POST — Run 3-way match
- `/api/financial/supplier-invoices/{id}/match/result` — GET — Match result
- `/api/financial/supplier-invoices/{id}/approve` — POST — Approve for payment
- `/api/financial/payment-runs` — GET/POST — Payment runs
- `/api/financial/payment-runs/{id}` — GET/PUT — Run detail
- `/api/financial/payment-runs/{id}/execute` — POST — Execute payment run
- `/api/financial/payment-runs/{id}/items` — GET — Run items
- `/api/financial/supplier-payments` — GET — Payment history
- `/api/financial/supplier-payments/{id}` — GET — Payment detail
- `/api/financial/expense-reports` — GET/POST — Expense reports
- `/api/financial/expense-reports/{id}` — GET/PUT — Report detail
- `/api/financial/expense-reports/{id}/approve` — POST — Approve expense
- `/api/financial/expense-categories` — GET/POST — Categories

## Screens to Build
- `/financial/supplier-invoices` — Supplier invoice list
- `/financial/supplier-invoices/new` — Create/upload invoice
- `/financial/supplier-invoices/{id}` — Invoice detail with lines
- `/financial/supplier-invoices/{id}/match` — 3-way match result
- `/financial/payment-runs` — Payment run list
- `/financial/payment-runs/new` — Create payment run
- `/financial/payment-runs/{id}` — Run detail with items
- `/financial/payment-runs/{id}/execute` — Execute run
- `/financial/supplier-payments` — Payment history
- `/financial/expense-reports` — Expense report list
- `/financial/expense-reports/new` — Create expense report
- `/financial/expense-reports/{id}` — Report detail
- `/financial/expense-categories` — Category management

## AI Agents Assigned
- Backend Lead AI — Supplier invoice, match, payment, expense APIs
- Frontend Lead AI — AP and expense screens
- Database Architect AI — AP schema with audit trail
- Integration AI — Bank file format generation

## Dependencies
- Sprint 010 — Procurement (PO and goods receipt data)
- Sprint 011 — Supplier Management (supplier payment details)

## Quality Gates
- 3-way match compares PO, goods receipt, and supplier invoice
- Match exceptions are flagged for manual review
- Payment run batches payments by due date and payment method
- Payment run generates bank-compatible file format
- Expense reports enforce approval policy based on amount

## Estimated Deliverables
- 3 backend modules (supplier invoice, payment run, expense)
- 13 frontend pages
- 65 unit tests
- 8 integration tests
- 4 documents
