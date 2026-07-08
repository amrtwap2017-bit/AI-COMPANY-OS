# Purchasing SOP — Standard Operating Procedure

## Purpose
Define the purchasing process from requisition to payment, ensuring approved spend, supplier compliance, audit trails, and timely delivery.

## Scope
All purchasing activities across Triangle Black and managed client properties.

## Actors
- Requisitioner — creates purchase requisition
- Department Head — approves requisition
- Procurement Officer — issues RFQ, selects supplier, creates PO
- Finance Controller — approves payment
- Storekeeper — confirms receipt

## Process Flow

### 1. Purchase Requisition
| Step | Action | Owner | System |
|------|--------|-------|--------|
| 1.1 | Requisitioner creates PR in procurement module | Requisitioner | Platform |
| 1.2 | Selects category, description, quantity, estimated cost | Requisitioner | Platform |
| 1.3 | Attaches supporting documents (specs, quotes) | Requisitioner | Platform |
| 1.4 | Submits PR for approval | Requisitioner | Platform |

### 2. Approval Routing
| Threshold | Approval Required |
|-----------|------------------|
| < EGP 5,000 | Department Head |
| EGP 5,000 – 50,000 | Department Head + Procurement Manager |
| EGP 50,000 – 200,000 | Department Head + Procurement Manager + Finance Controller |
| > EGP 200,000 | Full chain + Operations Director |

| Step | Action | Owner |
|------|--------|-------|
| 2.1 | Notification sent to approver | Platform |
| 2.2 | Approver reviews PR details and documents | Approver |
| 2.3 | Approve, reject with reason, or request revision | Approver |
| 2.4 | Escalation if no action within 24 hours | Platform |

### 3. RFQ and Supplier Selection
| Step | Action | Owner |
|------|--------|-------|
| 3.1 | Procurement Officer reviews approved PR | Procurement Officer |
| 3.2 | RFQ issued to minimum 3 qualified suppliers | Procurement Officer |
| 3.3 | Suppliers submit quotes via platform or email | Supplier |
| 3.4 | Quote comparison: price, delivery time, payment terms | Procurement Officer |
| 3.5 | Supplier selected and noted with justification | Procurement Officer |

### 4. Purchase Order Issuance
| Step | Action | Owner |
|------|--------|-------|
| 4.1 | PO created from approved PR and selected quote | Procurement Officer |
| 4.2 | PO contains: item description, quantity, unit price, total, delivery date, terms | Procurement Officer |
| 4.3 | PO approved by Procurement Manager | Procurement Manager |
| 4.4 | PO sent to supplier via platform or email | Procurement Officer |
| 4.5 | Supplier acknowledges PO | Supplier |

### 5. Delivery Tracking
| Step | Action | Owner |
|------|--------|-------|
| 5.1 | Supplier confirms dispatch with tracking info | Supplier |
| 5.2 | Delivery received at site | Storekeeper |
| 5.3 | Quantity and condition verified against PO and delivery note | Storekeeper |
| 5.4 | Discrepancies logged and escalated | Storekeeper |
| 5.5 | Goods receipt note (GRN) created in system | Storekeeper |

### 6. Invoice Matching
| Step | Action | Owner |
|------|--------|-------|
| 6.1 | Supplier submits invoice to finance | Supplier |
| 6.2 | Three-way match: PO vs GRN vs Invoice | Finance Controller |
| 6.3 | Match = 100% → approved for payment | Finance Controller |
| 6.4 | Match discrepancy → hold and notify Procurement Officer | Finance Controller |
| 6.5 | Discrepancy resolved or rejected | Procurement Officer |
| 6.6 | Approved invoice queued for payment run | Finance Controller |

## Business Rules
- No PO, no payment — hard rule
- Emergency purchases: post-facto approval within 48 hours, maximum EGP 10,000
- Split orders to avoid approval thresholds prohibited
- Preferred suppliers get first consideration if pricing within 5% of lowest bid
- All supplier communication must be on-platform or copied to platform

## Inputs / Outputs
| Inputs | Outputs |
|--------|---------|
| Purchase requisition | Purchase order |
| Supplier quotes | Goods receipt note |
| Budget allocation | Matched invoice for payment |
| Delivery documentation | Audit trail |

## KPIs
| KPI | Target | Frequency |
|-----|--------|-----------|
| PR-to-PO cycle time | < 5 business days | Monthly |
| PO accuracy rate | > 98% | Monthly |
| On-time delivery | > 90% | Monthly |
| Three-way match exceptions | < 5% | Monthly |
| Emergency purchase ratio | < 10% of total spend | Monthly |

## Exceptions
- Emergency purchases — verbal approval from Department Head, documented within 48 hours
- Sole-source items — require single-source justification form
- Service contracts — follow contract management process, not RFQ
