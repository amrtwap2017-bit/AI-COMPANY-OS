# 03-Procurement — Capability Mapping

## Requisition Creation (REQ-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | High |
| Roles | 03-PROCUREMENT/Roles.md | Yes | Medium |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | Medium |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Medium |
| Components | 03-PROCUREMENT/Components.md | Yes | Medium |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | Medium |
| Reports | 03-PROCUREMENT/Reports.md | Yes | Low |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Low |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | Yes | Low |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** PurchaseRequisition, RequisitionItem, RequisitionStatus, Requester
**Dependencies:** Project Delivery (PRJ-01), Inventory (INV-06)

## Requisition Approval (REQ-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | High |
| Roles | 03-PROCUREMENT/Roles.md | Yes | High |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | High |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Low |
| Components | 03-PROCUREMENT/Components.md | Yes | Low |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | High |
| Reports | 03-PROCUREMENT/Reports.md | No | Low |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Medium |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | No | Low |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** PurchaseRequisition, ApprovalWorkflow, ApprovalStep, Approver
**Dependencies:** Requisition Creation (REQ-01), Shared Kernel (SK-03, SK-05)

## PO Generation (PO-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | High |
| Roles | 03-PROCUREMENT/Roles.md | Yes | High |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | High |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Medium |
| Components | 03-PROCUREMENT/Components.md | Yes | Medium |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | Medium |
| Reports | 03-PROCUREMENT/Reports.md | Yes | Medium |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Low |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | Yes | Low |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** PurchaseOrder, POLineItem, POStatus, Supplier, Requisition
**Dependencies:** Requisition Approval (REQ-02), Supplier Management (SUP-01)

## PO Approval Workflow (PO-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | High |
| Roles | 03-PROCUREMENT/Roles.md | Yes | High |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | High |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Low |
| Components | 03-PROCUREMENT/Components.md | Yes | Low |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | High |
| Reports | 03-PROCUREMENT/Reports.md | No | Low |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Medium |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | No | Low |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** PurchaseOrder, POApproval, ApprovalTier, ApprovalLimit, ApprovalAction
**Dependencies:** PO Generation (PO-01), Shared Kernel (SK-03, SK-05)

## PO Dispatch (PO-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | Medium |
| Roles | 03-PROCUREMENT/Roles.md | Yes | Medium |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | Medium |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Low |
| Components | 03-PROCUREMENT/Components.md | Yes | Low |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | High |
| Reports | 03-PROCUREMENT/Reports.md | No | Low |
| KPIs | 03-PROCUREMENT/KPIs.md | No | Low |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | No | Low |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** PurchaseOrder, PODispatch, DispatchChannel, DispatchLog, SupplierContact
**Dependencies:** PO Approval Workflow (PO-02), Integrations (INT-01, INT-03)

## PO Tracking (PO-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | Medium |
| Roles | 03-PROCUREMENT/Roles.md | Yes | Medium |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | Medium |
| Screens | 03-PROCUREMENT/Screens.md | Yes | High |
| Components | 03-PROCUREMENT/Components.md | Yes | High |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | High |
| Reports | 03-PROCUREMENT/Reports.md | Yes | High |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Medium |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | Yes | Medium |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** PurchaseOrder, POTracking, POMilestone, TrackingEvent, DeliveryDate
**Dependencies:** PO Dispatch (PO-03)

## Goods Receipt (GR-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | High |
| Roles | 03-PROCUREMENT/Roles.md | Yes | High |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | High |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Medium |
| Components | 03-PROCUREMENT/Components.md | Yes | Medium |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | Medium |
| Reports | 03-PROCUREMENT/Reports.md | Yes | Medium |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Low |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | Yes | Low |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** GoodsReceipt, GRLineItem, PurchaseOrder, Warehouse, ReceivedQuantity
**Dependencies:** PO Tracking (PO-04), Inventory (INV-01)

## Quality Inspection (GR-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | High |
| Roles | 03-PROCUREMENT/Roles.md | Yes | High |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | High |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Medium |
| Components | 03-PROCUREMENT/Components.md | Yes | Medium |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | High |
| Reports | 03-PROCUREMENT/Reports.md | Yes | Medium |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Medium |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | Yes | Medium |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** GoodsReceipt, InspectionResult, InspectionCriteria, DefectLog, QCCheck
**Dependencies:** Goods Receipt (GR-01)

## Procurement Schedule (PRP-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 03-PROCUREMENT/Business-Overview.md | Yes | High |
| Business Capabilities | 03-PROCUREMENT/Business-Capabilities.md | Yes | High |
| Workflows | 03-PROCUREMENT/Workflows.md | Yes | High |
| Business Rules | 03-PROCUREMENT/Business-Rules.md | Yes | High |
| Roles | 03-PROCUREMENT/Roles.md | Yes | Medium |
| Permissions | 03-PROCUREMENT/Permissions.md | Yes | Medium |
| Screens | 03-PROCUREMENT/Screens.md | Yes | Medium |
| Components | 03-PROCUREMENT/Components.md | Yes | Medium |
| Database | 03-PROCUREMENT/Database.md | Yes | High |
| APIs | 03-PROCUREMENT/APIs.md | Yes | High |
| Events | 03-PROCUREMENT/Events.md | Yes | High |
| Notifications | 03-PROCUREMENT/Notifications.md | Yes | High |
| Reports | 03-PROCUREMENT/Reports.md | Yes | High |
| KPIs | 03-PROCUREMENT/KPIs.md | Yes | Medium |
| AI Opportunities | 03-PROCUREMENT/AI-Opportunities.md | Yes | Low |
| Testing | 03-PROCUREMENT/Testing.md | Yes | High |
| Acceptance Criteria | 03-PROCUREMENT/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** ProcurementSchedule, ScheduleLine, Project, Supplier, Material
**Dependencies:** Requisition Creation (REQ-01), Project Delivery (PRJ-02)
