# Purchase Orders — PO Creation, Approval, and Management

## Overview

The purchase order process covers the creation, approval workflow, issuance, tracking, and closure of purchase orders. This is a core procurement control mechanism ensuring all expenditures are authorized and tracked.

---

## BPMN Description

**Start Event:** Vendor selected and award decision made

1. **Collect PO Data** — Gather vendor info, line items, pricing, delivery terms, payment terms
2. **Create Purchase Order** — Draft PO in the system
3. **Add Line Items** — Items, quantities, unit prices, totals
4. **Assign Budget Code** — Link to project budget or cost center
5. **Set Delivery Schedule** — Expected delivery dates and location
6. **Set Payment Terms** — Net terms, milestone payments if applicable
7. **Validate PO** — System checks: budget sufficiency, vendor status, pricing consistency
8. **Route for Approval** — Send through approval chain based on PO value
9. **Approve PO** — Approver reviews and authorizes (or rejects with reason)
10. **Issue PO to Vendor** — Send official PO document
11. **Vendor Acknowledges** — Vendor confirms receipt and acceptance
12. **Monitor Delivery** — Track against expected delivery dates
13. **Receive Expediting Alerts** — System triggers if delivery is overdue
14. **Receive Goods** — Goods receipt process triggered
15. **Match PO to Goods Receipt** — Verify quantities and condition
16. **Receive Invoice** — Vendor sends invoice
17. **Perform 3-Way Match** — PO ↔ Goods Receipt ↔ Invoice
18. **Resolve Discrepancies** — Handle mismatches in quantity, price, or terms
19. **Approve Invoice for Payment** — Confirm invoice is correct
20. **Close Purchase Order** — Mark PO as complete when fully delivered and paid
21. **Archive PO Record** — Store for audit and reference

**End Event:** Purchase order closed

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Procurement Officer | Creates and manages POs | Procurement |
| Requisitioner | Initiates procurement need | Procurement |
| Approving Manager | Reviews and approves POs | Procurement |
| Director/CEO | Approves high-value POs | Procurement |
| Vendor | Receives PO, delivers goods | Vendor portal, Email |
| Store Keeper / Goods Receiver | Receives goods against PO | Inventory |
| Finance / AP | Processes invoices and payments | Finance |
| Project Manager | Monitors PO status for project | Project |

---

## Inputs

| Input | Source |
|-------|--------|
| Award decision / vendor selection | Vendor Selection |
| Approved procurement request | Procurement |
| Vendor details and pricing | Vendor / Evaluation |
| Budget allocation | Finance / Project |
| Delivery requirements | Project / Requisitioner |
| Contract terms (if applicable) | Contract |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Purchase order document | Official order | Vendor, Document |
| PO record (system) | Trackable order record | Procurement |
| Budget commitment | Encumbrance against budget | Finance |
| Delivery tracking record | Expected delivery schedule | Procurement |
| PO closure record | Completed order archive | Audit |
| Payment instruction | Approved for payment | Finance |

---

## Business Rules

- POs > $25,000 require director approval; > $100,000 require CEO
- POs cannot be issued to unapproved or suspended vendors
- PO value must not exceed remaining project budget
- Partial delivery is allowed unless specified otherwise
- PO amendments require same approval level as original
- 3-way match must pass before payment is processed
- POs cannot be closed with outstanding deliveries unless cancelled
- PO retention: 7 years after project completion

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Purchase order | Primary order document |
| PO amendment | Change to original PO |
| Delivery schedule | Expected delivery timeline |
| Goods receipt note | Receipt confirmation |
| Vendor invoice | Billing document |
| 3-way match report | Matching results |
| Payment voucher | Authorization to pay |
| PO close-out report | Final order summary |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| PO creation-to-approval cycle | < 3 business days | Draft - Approved |
| PO approval first-pass rate | > 85% | Approved first time / Total POs |
| Budget compliance | 100% | On-budget POs / Total POs |
| 3-way match pass rate (first pass) | > 85% | Auto-matched / Total invoices |
| PO amendment rate | < 10% | Amended POs / Total POs |
| On-time delivery (by PO) | > 90% | On-time POs / Total POs |
| PO cycle time (creation to close) | Per category target | Issue - Close |
| Percentage of POs with complete receipts | > 95% | Fully received / Total POs |
