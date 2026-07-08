# 03-PROCUREMENT — Workflows

## W1: Requisition → PO → Receipt

```
[NEED IDENTIFIED] Site engineer creates requisition
    │
    ▼
Requisition: item, quantity, needed_by, project_id, specification
    │
    ▼
Manager approves:
    ├── Approve → Create PO
    └── Reject → Revise or cancel
    │
    ▼
Procurement Officer creates PO:
    ├── Select supplier (04-SUPPLIER-MANAGEMENT)
    ├── Set unit prices, delivery date, terms
    └── Submit for approval
    │
    ▼
PO Approval (by value):
    ├── < EGP 50K → Manager approves
    ├── EGP 50K-500K → Director approves
    └── > EGP 500K → Executive approves
    │
    ▼
Send PO to supplier → PO.status = 'sent'
    │
    ▼
Supplier confirms → PO.status = 'confirmed'
    │
    ▼
Goods arrive → Goods Receipt created:
    ├── Verify quantity vs PO
    ├── Inspect quality
    └── Accept or reject items
    │
    ▼
Status:
    ├── Accept → PO.status = 'received', Inventory updated (05-INVENTORY)
    └── Reject → Return to supplier, create debit note
```
