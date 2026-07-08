# 05-INVENTORY — API Endpoints

```
GET    /api/v1/inventory/items                — List inventory
GET    /api/v1/inventory/items/:id            — Item detail
POST   /api/v1/inventory/receipt             — Stock in from PO
POST   /api/v1/inventory/issue               — Issue to project
POST   /api/v1/inventory/transfer            — Transfer between warehouses
POST   /api/v1/inventory/adjustment          — Stock adjustment
GET    /api/v1/inventory/warehouses           — List warehouses
POST   /api/v1/inventory/warehouses          — Create warehouse
PATCH  /api/v1/inventory/items/:id/min-level — Set reorder level
GET    /api/v1/inventory/transactions        — Stock movement log
GET    /api/v1/inventory/project/:id         — Project material consumption
