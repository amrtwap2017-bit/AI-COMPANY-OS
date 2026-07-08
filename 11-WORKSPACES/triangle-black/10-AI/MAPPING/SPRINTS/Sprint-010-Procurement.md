# Sprint 010 — Procurement — Purchase and Receiving

## Goal
Build the procurement system with purchase requests, RFQ management, purchase orders, and goods receipt to enable project material sourcing.

## Capabilities
- PROC-001 — Purchase Request — from Procurement
- PROC-002 — RFQ Management — from Procurement
- PROC-003 — Supplier Quotation — from Procurement
- PROC-004 — Purchase Order — from Procurement
- PROC-005 — Goods Receipt — from Procurement
- PROC-006 — Procurement Dashboard — from Procurement

## Context Pack Required
**Pack ID:** CP-Procurement
**Total Documents:** 6

### Domain Documents
- `../02-DOMAIN-DOCS/03-Procurement/Purchase-Request.md` — Purchase Request
- `../02-DOMAIN-DOCS/03-Procurement/RFQ-Process.md` — RFQ Process
- `../02-DOMAIN-DOCS/03-Procurement/Purchase-Order.md` — Purchase Order
- `../02-DOMAIN-DOCS/03-Procurement/Goods-Receipt.md` — Goods Receipt

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Data-Modeling.md` — Data Modeling

## Entities to Build
- PurchaseRequest — Procurement
- PurchaseRequestItem — Procurement
- RFQ — Procurement
- RFQResponse — Procurement
- RFQLineItemResponse — Procurement
- PurchaseOrder — Procurement
- PurchaseOrderItem — Procurement
- GoodsReceipt — Procurement
- GoodsReceiptLine — Procurement
- ProcurementDashboard — Procurement

## APIs to Build
- `/api/procurement/requests` — GET/POST — Purchase requests
- `/api/procurement/requests/{id}` — GET/PUT/DELETE — Request detail
- `/api/procurement/requests/{id}/submit` — POST — Submit for approval
- `/api/procurement/requests/{id}/approve` — POST — Approve/reject
- `/api/procurement/rfq` — GET/POST — RFQ management
- `/api/procurement/rfq/{id}` — GET/PUT — RFQ detail
- `/api/procurement/rfq/{id}/responses` — GET/POST — Supplier responses
- `/api/procurement/rfq/{id}/award` — POST — Award to supplier
- `/api/procurement/orders` — GET/POST — Purchase orders
- `/api/procurement/orders/{id}` — GET/PUT — PO detail
- `/api/procurement/orders/{id}/items` — GET/POST — PO items
- `/api/procurement/orders/{id}/receive` — POST — Create goods receipt
- `/api/procurement/orders/{id}/receive/{gId}` — GET — Receipt detail
- `/api/procurement/dashboard` — GET — Procurement dashboard

## Screens to Build
- `/procurement/requests` — Purchase request list
- `/procurement/requests/new` — Create purchase request
- `/procurement/requests/{id}` — Request detail and approvals
- `/procurement/rfq` — RFQ list
- `/procurement/rfq/new` — Create RFQ from request
- `/procurement/rfq/{id}` — RFQ detail with responses
- `/procurement/rfq/{id}/responses` — Supplier response comparison
- `/procurement/orders` — Purchase order list
- `/procurement/orders/new` — Create PO from RFQ
- `/procurement/orders/{id}` — PO detail with items
- `/procurement/orders/{id}/receive` — Goods receipt form
- `/procurement/dashboard` — Procurement KPIs

## AI Agents Assigned
- Backend Lead AI — PR, RFQ, PO, goods receipt APIs
- Frontend Lead AI — Procurement screens and dashboard
- Database Architect AI — Procurement schema
- Business Analyst AI — Approval workflow and routing rules

## Dependencies
- Sprint 007 — Project Basics (projects create procurement demand)

## Quality Gates
- Purchase request approval enforces budget limits
- RFQ can be generated from one or more purchase requests
- PO creation locks pricing from awarded RFQ
- Goods receipt matches PO line items with quantity tolerance
- Procurement dashboard reflects real-time order status

## Estimated Deliverables
- 4 backend modules (purchase request, rfq, po, goods receipt)
- 12 frontend pages
- 65 unit tests
- 8 integration tests
- 4 documents
