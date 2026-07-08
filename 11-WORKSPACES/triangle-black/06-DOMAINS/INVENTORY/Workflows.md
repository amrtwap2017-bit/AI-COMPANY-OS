# 05-INVENTORY — Workflows

## Stock-In (from PO)

```
Goods Receipt (03) → Create Stock-In Record
    ├── Add to warehouse stock
    ├── Update item quantity
    ├── Record unit cost (from PO line item)
    └── Set warehouse location
```

## Stock Issue (to Project)

```
Project Need → Create Stock Issue Request
    ├── Select items + quantities
    ├── Select project (02-PROJECT-DELIVERY)
    └── Select warehouse location
    │
    ▼
Storekeeper issues materials:
    ├── Deduct from warehouse stock
    ├── Add to project material consumption
    └── Update project budget (material cost)
```

## Stock Transfer

```
[NEED] Transfer from Warehouse A to Site B
    ├── Outbound: Deduct from Warehouse A
    └── Inbound: Add to Warehouse B
```

## Stock Adjustment

```
[REASON] Damage / Theft / Count Variance / Return to Supplier
    ├── Type: write_off, found, return
    ├── Quantity adjustment (+/-)
    └── Reason required
```
