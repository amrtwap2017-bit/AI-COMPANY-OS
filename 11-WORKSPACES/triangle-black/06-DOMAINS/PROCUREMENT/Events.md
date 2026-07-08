# 03-PROCUREMENT — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| requisition.created | Requisition submitted | NotificationService (procurement team) |
| requisition.approved | Requisition approved | PO auto-creation trigger |
| po.created | PO created | AuditService |
| po.approved | PO approved | Supplier notification, InventoryService (reserve budget) |
| po.sent | PO dispatched | EmailNotification (supplier) |
| goods.received | Goods receipt created | InventoryService (adjust stock levels) |
| goods.rejected | Goods receipt items rejected | NotificationService (procurement, supplier) |
