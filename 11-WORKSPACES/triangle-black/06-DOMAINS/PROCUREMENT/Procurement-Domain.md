# Phase 06 — Procurement Domain

> Purchase requisition, purchase orders, and goods receipt.

## Domain Scope

| Capability | Description | Priority |
|------------|-------------|----------|
| Requisition | Internal requests, approval, budget check | P0 |
| Purchase Order | Supplier orders, approval, dispatch | P0 |
| Goods Receipt | Receive, inspect, match to PO | P0 |

## Entity Relationship

```
Project (need) ──► 1:N ──► Requisition ──► 1:N ──► PurchaseOrder ──► 1:N ──► GoodsReceipt
                                         │ 1:N ──► POLine ──► Inventory (stock item)
```

## Location

`03-PROCUREMENT/` — 20 files following the standard template.

**Phase 7 Integration:** INT-001 (ETA E-Invoice) references procurement POs for 3-way match.
