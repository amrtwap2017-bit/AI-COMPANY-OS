# 05-INVENTORY — Business Overview

## Context

Materials received from procurement (03) are stored for project consumption. Inventory tracks stock levels, warehouse locations, material transfers between sites, and stock adjustments (waste, damage, returns).

## Key Flow

```
PO Received → Stock In → Warehouse → Project Issue → Consumption → Reorder Alert
                                                    ↓
                                              Stock Transfer
                                              (warehouse → site)
```
