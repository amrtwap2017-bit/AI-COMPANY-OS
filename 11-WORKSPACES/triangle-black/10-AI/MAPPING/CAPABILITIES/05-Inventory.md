# 05-Inventory — Capability Mapping

## Stock Receipt (INV-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | High |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | Medium |
| Permissions | 05-INVENTORY/Permissions.md | Yes | Medium |
| Screens | 05-INVENTORY/Screens.md | Yes | Medium |
| Components | 05-INVENTORY/Components.md | Yes | Medium |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | High |
| Notifications | 05-INVENTORY/Notifications.md | Yes | Medium |
| Reports | 05-INVENTORY/Reports.md | Yes | Low |
| KPIs | 05-INVENTORY/KPIs.md | No | Low |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | Yes | Low |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** StockReceipt, ReceiptLine, PurchaseOrder, Warehouse, BinLocation
**Dependencies:** Procurement (GR-01), Shared Kernel (SK-01, SK-02)

## Stock Issue (INV-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | High |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | Medium |
| Permissions | 05-INVENTORY/Permissions.md | Yes | Medium |
| Screens | 05-INVENTORY/Screens.md | Yes | Medium |
| Components | 05-INVENTORY/Components.md | Yes | Medium |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | High |
| Notifications | 05-INVENTORY/Notifications.md | Yes | Medium |
| Reports | 05-INVENTORY/Reports.md | Yes | High |
| KPIs | 05-INVENTORY/KPIs.md | Yes | Medium |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | Yes | Low |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** StockIssue, IssueLine, Project, Task, Warehouse, Material
**Dependencies:** Stock Receipt (INV-01), Project Delivery (TIM-01, PRJ-03)

## Stock Transfer (INV-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | High |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | Medium |
| Permissions | 05-INVENTORY/Permissions.md | Yes | Medium |
| Screens | 05-INVENTORY/Screens.md | Yes | Medium |
| Components | 05-INVENTORY/Components.md | Yes | Medium |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | High |
| Notifications | 05-INVENTORY/Notifications.md | Yes | High |
| Reports | 05-INVENTORY/Reports.md | Yes | Medium |
| KPIs | 05-INVENTORY/KPIs.md | Yes | Low |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | No | Low |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** StockTransfer, TransferLine, SourceWarehouse, DestinationWarehouse, TransferStatus
**Dependencies:** Stock Receipt (INV-01), Warehouse Management (INV-08)

## Stock Adjustment (INV-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | High |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | High |
| Permissions | 05-INVENTORY/Permissions.md | Yes | High |
| Screens | 05-INVENTORY/Screens.md | Yes | Medium |
| Components | 05-INVENTORY/Components.md | Yes | Medium |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | High |
| Notifications | 05-INVENTORY/Notifications.md | Yes | High |
| Reports | 05-INVENTORY/Reports.md | Yes | Medium |
| KPIs | 05-INVENTORY/KPIs.md | Yes | Medium |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | Yes | Medium |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** StockAdjustment, AdjustmentLine, AdjustmentReason, Warehouse, Material
**Dependencies:** Stock Issue (INV-02), Shared Kernel (SK-08)

## Inventory Count (INV-05)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | High |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | High |
| Permissions | 05-INVENTORY/Permissions.md | Yes | High |
| Screens | 05-INVENTORY/Screens.md | Yes | Medium |
| Components | 05-INVENTORY/Components.md | Yes | Medium |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | High |
| Notifications | 05-INVENTORY/Notifications.md | Yes | High |
| Reports | 05-INVENTORY/Reports.md | Yes | High |
| KPIs | 05-INVENTORY/KPIs.md | Yes | High |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | Yes | Medium |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** CycleCount, CountLine, SystemQuantity, PhysicalQuantity, Variance, CountSchedule
**Dependencies:** Stock Receipt (INV-01), Warehouse Management (INV-08)

## Reorder Alerts (INV-06)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | High |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | Medium |
| Permissions | 05-INVENTORY/Permissions.md | Yes | Medium |
| Screens | 05-INVENTORY/Screens.md | Yes | Low |
| Components | 05-INVENTORY/Components.md | Yes | Low |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | High |
| Notifications | 05-INVENTORY/Notifications.md | Yes | High |
| Reports | 05-INVENTORY/Reports.md | Yes | Medium |
| KPIs | 05-INVENTORY/KPIs.md | Yes | Medium |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | Yes | High |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Material, ReorderLevel, ReorderPoint, LeadTime, SafetyStock, AlertLog
**Dependencies:** Stock Issue (INV-02), Shared Kernel (SK-05)

## Inventory Valuation (INV-07)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | Medium |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | High |
| Permissions | 05-INVENTORY/Permissions.md | Yes | High |
| Screens | 05-INVENTORY/Screens.md | Yes | Medium |
| Components | 05-INVENTORY/Components.md | Yes | Medium |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | Medium |
| Notifications | 05-INVENTORY/Notifications.md | No | Low |
| Reports | 05-INVENTORY/Reports.md | Yes | High |
| KPIs | 05-INVENTORY/KPIs.md | Yes | High |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | Yes | Medium |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Material, CostMethod, FIFOLayer, AverageCost, ValuationReport, StockValue
**Dependencies:** Stock Receipt (INV-01), Financial Control (AP-01, GL-01)

## Warehouse Management (INV-08)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 05-INVENTORY/Business-Overview.md | Yes | High |
| Business Capabilities | 05-INVENTORY/Business-Capabilities.md | Yes | High |
| Workflows | 05-INVENTORY/Workflows.md | Yes | High |
| Business Rules | 05-INVENTORY/Business-Rules.md | Yes | High |
| Roles | 05-INVENTORY/Roles.md | Yes | Medium |
| Permissions | 05-INVENTORY/Permissions.md | Yes | Medium |
| Screens | 05-INVENTORY/Screens.md | Yes | High |
| Components | 05-INVENTORY/Components.md | Yes | High |
| Database | 05-INVENTORY/Database.md | Yes | High |
| APIs | 05-INVENTORY/APIs.md | Yes | High |
| Events | 05-INVENTORY/Events.md | Yes | High |
| Notifications | 05-INVENTORY/Notifications.md | Yes | Medium |
| Reports | 05-INVENTORY/Reports.md | Yes | High |
| KPIs | 05-INVENTORY/KPIs.md | Yes | Medium |
| AI Opportunities | 05-INVENTORY/AI-Opportunities.md | Yes | Low |
| Testing | 05-INVENTORY/Testing.md | Yes | High |
| Acceptance Criteria | 05-INVENTORY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Warehouse, Zone, BinLocation, LocationType, Capacity, WarehouseStatus
**Dependencies:** Shared Kernel (SK-01, SK-02)
