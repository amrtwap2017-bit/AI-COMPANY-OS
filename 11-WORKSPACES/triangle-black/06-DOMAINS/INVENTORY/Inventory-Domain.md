# Phase 06 — Inventory Domain

> Stock control, warehouse management, transfers, and adjustments.

## Domain Scope

| Capability | Description | Priority |
|------------|-------------|----------|
| Stock Control | Receive, store, pick, dispatch, count | P0 |
| Warehouse Management | Multi-warehouse, bin locations | P1 |
| Inventory Adjustment | Write-off, transfer, reconciliation | P1 |

## Entity Relationship

```
Warehouse ──► 1:N ──► StockItem
StockItem ──► 1:N ──► StockTransfer (source → destination)
StockItem ──► 1:N ──► StockAdjustment (reason: write-off, damage, loss)
StockItem ◄── 1:1 ── GoodsReceipt (in Procurement)
StockItem ◄── 1:N ── ProjectConsumption (in Project Delivery)
```

## Location

`05-INVENTORY/` — 20 files following the standard template.
