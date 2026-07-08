# Sprint 004 — Commercial Quotations — Pricing Engine

## Goal
Build the quotation builder with BOQ management, pricing engine, and PDF generation to produce customer-ready proposals.

## Capabilities
- CRM-013 — Quotation Builder — from Commercial
- CRM-014 — Bill of Quantities (BOQ) — from Commercial
- CRM-015 — Pricing Engine — from Commercial
- CRM-016 — PDF Generation — from Commercial
- CRM-017 — Approval Workflow — from Commercial

## Context Pack Required
**Pack ID:** CP-CRM-Quotations
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/01-Commercial/Quotation-Process.md` — Quotation Process
- `../02-DOMAIN-DOCS/01-Commercial/BOQ-Structure.md` — BOQ Structure
- `../02-DOMAIN-DOCS/01-Commercial/Pricing-Rules.md` — Pricing Rules
- `../02-DOMAIN-DOCS/01-Commercial/Approval-Workflows.md` — Approval Workflows

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/PDF-Templates.md` — PDF Templates

## Entities to Build
- Quotation — Commercial
- QuotationLineItem — Commercial
- QuotationVersion — Commercial
- BillOfQuantities — Commercial
- BOQLineItem — Commercial
- PricingRule — Commercial
- ProductCatalog — Commercial
- ProductPricing — Commercial
- ApprovalRequest — Commercial

## APIs to Build
- `/api/quotations` — GET/POST — Quotation list and create
- `/api/quotations/{id}` — GET/PUT/DELETE — Quotation detail
- `/api/quotations/{id}/versions` — GET/POST — Version management
- `/api/quotations/{id}/versions/{vId}` — GET — Version detail
- `/api/quotations/{id}/pdf` — GET — Generate PDF
- `/api/quotations/{id}/approve` — POST — Submit for approval
- `/api/quotations/{id}/approve/action` — POST — Approve/reject
- `/api/boq` — GET/POST — BOQ management
- `/api/boq/{id}` — GET/PUT — BOQ detail
- `/api/boq/{id}/line-items` — GET/POST — BOQ line items
- `/api/pricing/rules` — GET/POST — Pricing rule configuration
- `/api/pricing/calculate` — POST — Calculate quotation price
- `/api/products` — GET/POST — Product catalog
- `/api/products/{id}` — GET/PUT/DELETE — Product detail

## Screens to Build
- `/quotations` — Quotation list with status filters
- `/quotations/new` — Create quotation from opportunity
- `/quotations/{id}` — Quotation detail with line items
- `/quotations/{id}/edit` — Edit quotation
- `/quotations/{id}/preview` — PDF preview
- `/quotations/{id}/approvals` — Approval workflow view
- `/boq` — BOQ list
- `/boq/new` — Create BOQ
- `/boq/{id}` — BOQ detail with line items
- `/products` — Product catalog
- `/products/new` — Create product
- `/products/{id}` — Product detail
- `/pricing/rules` — Pricing rules configuration

## AI Agents Assigned
- Backend Lead AI — Quotation, BOQ, pricing, product APIs
- Frontend Lead AI — Quotation builder, BOQ editor, product catalog
- Database Architect AI — Pricing rule and BOQ schema
- Document AI — PDF template generation

## Dependencies
- Sprint 002 — Commercial Pipeline (opportunities)
- Sprint 003 — Commercial Surveys (site assessment data)

## Quality Gates
- Quotation can be generated from an opportunity
- Pricing engine correctly applies all rules and discounts
- PDF output matches the quotation data exactly
- Approval workflow enforces chain-of-approval rules
- Version history is preserved for all quotation changes

## Estimated Deliverables
- 4 backend modules (quotation, boq, pricing, product)
- 13 frontend pages
- 70 unit tests
- 10 integration tests
- 4 documents
