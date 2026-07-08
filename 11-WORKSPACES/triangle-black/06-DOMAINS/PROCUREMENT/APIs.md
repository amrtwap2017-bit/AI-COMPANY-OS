# 03-PROCUREMENT — API Endpoints

```
POST   /api/v1/procurement/requisitions          — Create requisition
GET    /api/v1/procurement/requisitions          — List
GET    /api/v1/procurement/requisitions/:id      — Detail
PATCH  /api/v1/procurement/requisitions/:id      — Update
POST   /api/v1/procurement/requisitions/:id/submit     — Submit for approval
POST   /api/v1/procurement/requisitions/:id/approve    — Approve
POST   /api/v1/procurement/requisitions/:id/reject     — Reject
POST   /api/v1/procurement/purchase-orders       — Create PO
GET    /api/v1/procurement/purchase-orders       — List
GET    /api/v1/procurement/purchase-orders/:id   — Detail
PATCH  /api/v1/procurement/purchase-orders/:id   — Update
POST   /api/v1/procurement/purchase-orders/:id/submit  — Submit for approval
POST   /api/v1/procurement/purchase-orders/:id/approve — Approve
POST   /api/v1/procurement/purchase-orders/:id/send    — Send to supplier
POST   /api/v1/procurement/purchase-orders/:id/receive — Receive goods
GET    /api/v1/procurement/goods-receipts         — List receipts
GET    /api/v1/procurement/goods-receipts/:id     — Receipt detail
POST   /api/v1/procurement/goods-receipts/:id/inspect — Inspect/reject items
```
