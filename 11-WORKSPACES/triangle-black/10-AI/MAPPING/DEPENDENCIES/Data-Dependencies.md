# Data Dependencies

## Entity-Level Foreign Key Relationships

| Entity | References Entity | Domain | Reference Type |
|--------|-----------------|--------|---------------|
| Customer | Tenant | 00 Shared Kernel | FK |
| User | Tenant | 00 Shared Kernel | FK |
| User | Role | 00 Shared Kernel | FK |
| SalesOrder | Customer | 01 Commercial | FK |
| SalesOrder | User (CreatedBy) | 00 Shared Kernel | FK |
| SalesOrderLine | SalesOrder | 01 Commercial | FK |
| SalesOrderLine | Product | 01 Commercial | FK |
| Contract | SalesOrder | 01 Commercial | FK |
| ContractLine | Contract | 01 Commercial | FK |
| ContractLine | Product | 01 Commercial | FK |
| RevenueSchedule | ContractLine | 01 Commercial | FK |
| Project | SalesOrder | 01 Commercial | FK |
| Project | Customer | 01 Commercial | FK |
| ProjectBudget | Project | 02 Project Delivery | FK |
| ProjectBudget | CostCode | 02 Project Delivery | FK |
| Milestone | Project | 02 Project Delivery | FK |
| Milestone | ContractLine | 01 Commercial | FK |
| ResourceAllocation | Project | 02 Project Delivery | FK |
| ResourceAllocation | User | 00 Shared Kernel | FK |
| Timesheet | ResourceAllocation | 02 Project Delivery | FK |
| Timesheet | User | 00 Shared Kernel | FK |
| PurchaseOrder | Contract | 01 Commercial | FK |
| PurchaseOrder | Project | 02 Project Delivery | FK |
| PurchaseOrder | Supplier | 04 Supplier Mgmt | FK |
| PurchaseOrderLine | PurchaseOrder | 03 Procurement | FK |
| PurchaseOrderLine | Product | 01 Commercial | FK |
| BudgetCheckResult | PurchaseOrder | 03 Procurement | FK |
| BudgetCheckResult | ProjectBudget | 02 Project Delivery | FK |
| Supplier | Tenant | 00 Shared Kernel | FK |
| SupplierContract | Supplier | 04 Supplier Mgmt | FK |
| SupplierContract | Contract | 01 Commercial | FK |
| SupplierEvaluation | Supplier | 04 Supplier Mgmt | FK |
| SupplierScorecard | SupplierEvaluation | 04 Supplier Mgmt | FK |
| GoodsReceiptNote | PurchaseOrder | 03 Procurement | FK |
| GoodsReceiptNoteLine | GoodsReceiptNote | 05 Inventory | FK |
| GoodsReceiptNoteLine | PurchaseOrderLine | 03 Procurement | FK |
| StockItem | Product | 01 Commercial | FK |
| StockItem | Warehouse | 05 Inventory | FK |
| StockTransaction | StockItem | 05 Inventory | FK |
| StockTransaction | Project | 02 Project Delivery | FK |
| StockAllocation | StockItem | 05 Inventory | FK |
| StockAllocation | Project | 02 Project Delivery | FK |
| Invoice | PurchaseOrder | 03 Procurement | FK |
| InvoiceLine | Invoice | 06 Financial Ctrl | FK |
| InvoiceLine | PurchaseOrderLine | 03 Procurement | FK |
| InvoiceLine | GoodsReceiptNoteLine | 05 Inventory | FK |
| PaymentRun | Invoice | 06 Financial Ctrl | FK |
| PaymentRun | Project | 02 Project Delivery | FK |
| GLAccount | Tenant | 00 Shared Kernel | FK |
| JournalEntry | GLAccount | 06 Financial Ctrl | FK |
| JournalEntry | Invoice | 06 Financial Ctrl | FK |
| WorkOrder | Project | 02 Project Delivery | FK |
| WorkOrder | StockItem | 05 Inventory | FK |
| WorkOrderTask | WorkOrder | 07 Maintenance | FK |
| WorkOrderTask | User | 00 Shared Kernel | FK |
| MaintenanceSchedule | WorkOrder | 07 Maintenance | FK |
| Document | Project | 02 Project Delivery | FK |
| Document | PurchaseOrder | 03 Procurement | FK |
| Document | SupplierContract | 04 Supplier Mgmt | FK |
| DocumentMetadata | Document | 08 Document Mgmt | FK |
| DocumentVersion | Document | 08 Document Mgmt | FK |
| KpiDefinition | Tenant | 00 Shared Kernel | FK |
| KpiValue | KpiDefinition | 09 Exec Intel | FK |
| Dashboard | Tenant | 00 Shared Kernel | FK |
| DashboardWidget | Dashboard | 09 Exec Intel | FK |
| DashboardWidget | KpiDefinition | 09 Exec Intel | FK |
| AiQuery | User | 00 Shared Kernel | FK |
| AiResponse | AiQuery | 10 AI Copilots | FK |
| AiContextDocument | AiQuery | 10 AI Copilots | FK |
| IntegrationEndpoint | Tenant | 00 Shared Kernel | FK |
| IntegrationMessage | IntegrationEndpoint | 11 Integrations | FK |
| MobileDevice | User | 00 Shared Kernel | FK |
| MobileSyncBatch | MobileDevice | 12 Mobile | FK |
| Employee | User | 00 Shared Kernel | FK |
| Employee | Tenant | 00 Shared Kernel | FK |
| PayrollRecord | Employee | 13 HR | FK |
| PayrollRecord | GLAccount | 06 Financial Ctrl | FK |
| LeaveRequest | Employee | 13 HR | FK |
| TimesheetEntry | Employee | 13 HR | FK |
