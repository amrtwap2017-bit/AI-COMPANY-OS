# 03-PROCUREMENT — Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Requisition List | /procurement/requisitions | Table with status, project, urgency |
| Requisition Create | /procurement/requisitions/new | Line item entry form |
| Requisition Detail | /procurement/requisitions/:id | Items + approval timeline |
| PO List | /procurement/purchase-orders | Table with status, supplier, value |
| PO Create | /procurement/purchase-orders/new | From requisition or manual |
| PO Detail | /procurement/purchase-orders/:id | Line items + receipt history |
| PO Approve | /procurement/purchase-orders/:id/approve | Review + approve/reject |
| Goods Receipt | /procurement/goods-receipts | Receiving log |
| Goods Receipt Create | /procurement/goods-receipts/new | Select PO → receive qty |
| Receipt Inspect | /procurement/goods-receipts/:id/inspect | Pass/fail per line item |
