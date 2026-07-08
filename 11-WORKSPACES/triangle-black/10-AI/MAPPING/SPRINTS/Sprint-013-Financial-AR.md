# Sprint 013 — Financial AR — Invoicing and Revenue

## Goal
Build accounts receivable with customer invoicing, revenue recognition, payment tracking, and collections to manage incoming revenue.

## Capabilities
- FIN-001 — Customer Invoicing — from Financial Control
- FIN-002 — Revenue Recognition — from Financial Control
- FIN-003 — Payment Tracking — from Financial Control
- FIN-004 — Collections Management — from Financial Control
- FIN-005 — Credit Notes — from Financial Control

## Context Pack Required
**Pack ID:** CP-Financial-Invoicing
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/05-Financial-Control/Customer-Invoicing.md` — Customer Invoicing
- `../02-DOMAIN-DOCS/05-Financial-Control/Revenue-Recognition.md` — Revenue Recognition
- `../02-DOMAIN-DOCS/05-Financial-Control/Payment-Tracking.md` — Payment Tracking
- `../02-DOMAIN-DOCS/05-Financial-Control/Collections.md` — Collections
- `../02-DOMAIN-DOCS/05-Financial-Control/Credit-Notes.md` — Credit Notes

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Integration-Standards.md` — Integration Standards

## Entities to Build
- CustomerInvoice — Financial Control
- InvoiceLineItem — Financial Control
- InvoiceMilestone — Financial Control
- RevenueRecognition — Financial Control
- RevenueSchedule — Financial Control
- Payment — Financial Control
- PaymentAllocation — Financial Control
- CollectionCase — Financial Control
- CreditNote — Financial Control
- CreditNoteLine — Financial Control

## APIs to Build
- `/api/financial/invoices` — GET/POST — Invoice list and create
- `/api/financial/invoices/{id}` — GET/PUT/DELETE — Invoice detail
- `/api/financial/invoices/{id}/items` — GET/POST — Line items
- `/api/financial/invoices/{id}/send` — POST — Send invoice to customer
- `/api/financial/invoices/{id}/pdf` — GET — Invoice PDF
- `/api/financial/invoices/{id}/payments` — GET/POST — Record payment
- `/api/financial/invoices/{id}/credit-note` — POST — Create credit note
- `/api/financial/revenue-recognition` — GET — Revenue schedule
- `/api/financial/revenue-recognition/{id}` — GET/PUT — Recognition detail
- `/api/financial/revenue-recognition/recognize` — POST — Run recognition
- `/api/financial/payments` — GET — Payment list
- `/api/financial/payments/{id}` — GET — Payment detail
- `/api/financial/collections` — GET — Collection cases
- `/api/financial/collections/{id}` — GET/PUT — Case detail
- `/api/financial/credit-notes` — GET/POST — Credit notes
- `/api/financial/credit-notes/{id}` — GET — Credit note detail

## Screens to Build
- `/financial/invoices` — Invoice list with filters
- `/financial/invoices/new` — Create invoice from contract/milestone
- `/financial/invoices/{id}` — Invoice detail
- `/financial/invoices/{id}/edit` — Edit invoice
- `/financial/invoices/{id}/preview` — PDF preview
- `/financial/invoices/{id}/payments` — Payment history
- `/financial/revenue-recognition` — Revenue schedule view
- `/financial/payments` — Payment list
- `/financial/payments/{id}` — Payment detail
- `/financial/collections` — Collections dashboard
- `/financial/collections/{id}` — Collection case detail
- `/financial/credit-notes` — Credit note list
- `/financial/credit-notes/new` — Create credit note

## AI Agents Assigned
- Backend Lead AI — Invoice, payment, revenue, collection APIs
- Frontend Lead AI — Invoicing and financial screens
- Database Architect AI — Financial schema with audit trail
- Document AI — Invoice PDF generation
- Integration AI — Payment gateway integration

## Dependencies
- Sprint 005 — Commercial Contracts (contract milestones generate invoices)
- Sprint 007 — Project Basics (project milestones trigger invoicing)

## Quality Gates
- Invoice can be generated from contract or project milestones
- Revenue recognition supports percentage-of-completion methods
- Payment allocations balance exactly to invoice amounts
- Credit notes reverse the correct invoice lines
- PDF invoice matches the data exactly

## Estimated Deliverables
- 4 backend modules (invoice, revenue, payment, collections)
- 13 frontend pages
- 70 unit tests
- 9 integration tests
- 4 documents
