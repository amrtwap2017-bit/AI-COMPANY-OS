# Domain Ownership & Aggregate Root Registry

| Aggregate Root | Primary Owner | Secondary Consumers | Storage Table |
|---|---|---|---|
| `WorkOrder` | Operations | Maintenance, Procurement, AI | `work_orders` |
| `ServiceRequest` | Operations | Customer Portal, Workflow | `service_requests` |
| `Asset` | Maintenance | Digital Twin, Work Orders | `assets` |
| `Contract` | Commercial | Invoicing, SLAs, Work Orders | `contracts` |
| `PurchaseOrder` | Procurement | Goods Receipts, Financial GL | `purchase_orders` |
| `Supplier` | Procurement | Inventory, Scorecards | `suppliers` |
| `Invoice` | Financial | Commercial, Work Orders | `invoices` |
| `AIRecommendation`| AI Gateway | Operations, Executive | `platform_audit_log` |
