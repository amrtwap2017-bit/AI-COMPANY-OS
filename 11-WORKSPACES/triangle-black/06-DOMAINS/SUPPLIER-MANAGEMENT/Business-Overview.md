# 04-SUPPLIER-MANAGEMENT — Business Overview

## Context

Every purchase requires a supplier. This domain manages the supplier lifecycle: registration, qualification, performance tracking, and framework agreements. Procurement (03) references approved suppliers; Inventory (05) can be linked to preferred suppliers.

## Key Workflow

```
Supplier Application → Document Review → Approval → Rate Card Setup → Active Supplier → Quarterly Evaluation
     ↓                      ↓              ↓             ↓               ↓                  ↓
  Web form              Legal docs    Status =     Price list,      Can receive      Performance
                        Bank details  approved     payment terms    POs              score updated
```
