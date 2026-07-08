# Procurement — Procurement Lifecycle

## Overview

The end-to-end procurement lifecycle covering requisition, approval, RFQ, vendor selection, purchase order, goods delivery, and payment. This workflow ensures that materials and services are procured efficiently, compliantly, and within budget.

---

## BPMN Description

**Start Event:** Material or service need identified

1. **Create Procurement Request** — Requisitioner raises request with item details, quantity, required date
2. **Submit for Approval** — Route request based on value and category
3. **Approve Request** — Manager/director reviews and approves (or rejects)
4. **Check Existing Stock** — Inventory check before external procurement
5. **Determine Procurement Method** — Direct purchase (low value) or RFQ (high value)
6. **Prepare RFQ** — Create request for quotation with specs and terms
7. **Send RFQ to Vendors** — Distribute to at least 3 qualified vendors
8. **Receive Vendor Responses** — Collect quotations from vendors
9. **Evaluate Responses** — Score based on price, delivery, quality, terms
10. **Select Vendor** — Award to best-evaluated vendor
11. **Create Purchase Order** — Generate PO with line items, pricing, delivery terms
12. **Submit PO for Approval** — Route based on PO value
13. **Approve PO** — Authorize purchase
14. **Issue PO to Vendor** — Send official purchase order
15. **Vendor Acknowledges PO** — Vendor confirms order acceptance
16. **Track Delivery** — Monitor expected delivery date
17. **Receive Goods** — Inspect and accept delivery
18. **Complete Goods Receipt** — Record received quantities, note discrepancies
19. **Submit to Inventory** — Update stock levels
20. **Receive Vendor Invoice** — Process invoice for payment
21. **Match Invoice** — 3-way matching: PO ↔ Goods Receipt ↔ Invoice
22. **Approve for Payment** — Route invoice for payment approval
23. **Process Payment** — Execute payment per terms

**End Event:** Payment completed

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Requisitioner | Raises procurement request | Procurement, Project |
| Procurement Manager | Reviews and manages procurement | Procurement |
| Approving Manager | Approves requests and POs | Procurement |
| Director/CEO | Approves high-value procurement | Procurement |
| Vendor | Responds to RFQ, delivers goods | Vendor portal, Email |
| Warehouse/Store Keeper | Receives and inspects goods | Inventory |
| Finance / Accounts Payable | Processes invoices and payments | Finance |
| Project Manager | Tracks procurement for project | Project |

---

## Inputs

| Input | Source |
|-------|--------|
| Material/service requirement | Project, Maintenance, Operations |
| Bill of Quantities | Engineering Assessment |
| Approved vendor list | Procurement |
| Historical pricing data | Procurement |
| Budget allocation | Project, Finance |
| Inventory stock levels | Inventory |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Procurement request | Approved requisition | Procurement |
| RFQ package | Vendor solicitation | Vendors |
| Vendor evaluation | Award recommendation | Procurement |
| Purchase order | Binding order document | Vendor |
| Goods receipt record | Delivery confirmation | Inventory |
| Payment instruction | Fund transfer authorization | Finance |
| Procurement report | Spend analysis | Management |

---

## Business Rules

- Procurement > $5,000 requires at least 3 vendor quotations
- Requests > $10,000 require manager approval; > $50,000 require director
- POs > $25,000 require director approval; > $100,000 require CEO
- Goods receipt tolerance: 5% variance; above triggers discrepancy process
- Preferred vendors (from approved list) get first consideration
- No PO can be issued to a suspended or blacklisted vendor
- Archival: procurement records retained for 7 years

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Procurement request form | Requisition details |
| RFQ document | Request for quotation |
| Vendor quotation | Supplier pricing response |
| Evaluation matrix | Vendor scoring sheet |
| Purchase order | Official order document |
| Delivery note / packing slip | Shipment details |
| Goods receipt note | Receipt confirmation |
| Vendor invoice | Billing document |
| Payment voucher | Payment authorization |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Requisition-to-PO cycle | < 10 business days | Request - PO issued |
| PO accuracy rate | > 98% | Error-free POs / Total POs |
| On-time delivery rate | > 90% | On-time deliveries / Total deliveries |
| Goods receipt accuracy | > 95% | Accurate receipts / Total receipts |
| Invoice matching pass rate (first pass) | > 85% | Auto-matched / Total invoices |
| Cost savings achieved | Target % per category | (Est. cost - Actual cost) / Est. cost |
| Vendor fill rate | > 95% | Items delivered / Items ordered |
| Payment within terms | > 95% | On-time payments / Total payments |
