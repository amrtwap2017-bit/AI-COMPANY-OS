# 07-Maintenance — Capability Mapping

## Service Request (MNT-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 07-MAINTENANCE/Business-Overview.md | Yes | High |
| Business Capabilities | 07-MAINTENANCE/Business-Capabilities.md | Yes | High |
| Workflows | 07-MAINTENANCE/Workflows.md | Yes | High |
| Business Rules | 07-MAINTENANCE/Business-Rules.md | Yes | High |
| Roles | 07-MAINTENANCE/Roles.md | Yes | High |
| Permissions | 07-MAINTENANCE/Permissions.md | Yes | High |
| Screens | 07-MAINTENANCE/Screens.md | Yes | Medium |
| Components | 07-MAINTENANCE/Components.md | Yes | Medium |
| Database | 07-MAINTENANCE/Database.md | Yes | High |
| APIs | 07-MAINTENANCE/APIs.md | Yes | High |
| Events | 07-MAINTENANCE/Events.md | Yes | High |
| Notifications | 07-MAINTENANCE/Notifications.md | Yes | High |
| Reports | 07-MAINTENANCE/Reports.md | Yes | Medium |
| KPIs | 07-MAINTENANCE/KPIs.md | Yes | Medium |
| AI Opportunities | 07-MAINTENANCE/AI-Opportunities.md | Yes | Low |
| Testing | 07-MAINTENANCE/Testing.md | Yes | High |
| Acceptance Criteria | 07-MAINTENANCE/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** ServiceRequest, RequestType, RequestPriority, Asset, Project
**Dependencies:** Commercial (PT-02), Shared Kernel (SK-01, SK-02)

## SLA Management (MNT-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 07-MAINTENANCE/Business-Overview.md | Yes | High |
| Business Capabilities | 07-MAINTENANCE/Business-Capabilities.md | Yes | High |
| Workflows | 07-MAINTENANCE/Workflows.md | Yes | High |
| Business Rules | 07-MAINTENANCE/Business-Rules.md | Yes | High |
| Roles | 07-MAINTENANCE/Roles.md | Yes | High |
| Permissions | 07-MAINTENANCE/Permissions.md | Yes | High |
| Screens | 07-MAINTENANCE/Screens.md | Yes | Medium |
| Components | 07-MAINTENANCE/Components.md | Yes | Medium |
| Database | 07-MAINTENANCE/Database.md | Yes | High |
| APIs | 07-MAINTENANCE/APIs.md | Yes | High |
| Events | 07-MAINTENANCE/Events.md | Yes | High |
| Notifications | 07-MAINTENANCE/Notifications.md | Yes | High |
| Reports | 07-MAINTENANCE/Reports.md | Yes | High |
| KPIs | 07-MAINTENANCE/KPIs.md | Yes | High |
| AI Opportunities | 07-MAINTENANCE/AI-Opportunities.md | Yes | Medium |
| Testing | 07-MAINTENANCE/Testing.md | Yes | High |
| Acceptance Criteria | 07-MAINTENANCE/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** SLA, SLATerm, ResponseTime, ResolutionTime, Penalty, Breach
**Dependencies:** Service Request (MNT-01), Commercial (CTR-01)

## Preventive Maintenance (MNT-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 07-MAINTENANCE/Business-Overview.md | Yes | High |
| Business Capabilities | 07-MAINTENANCE/Business-Capabilities.md | Yes | High |
| Workflows | 07-MAINTENANCE/Workflows.md | Yes | High |
| Business Rules | 07-MAINTENANCE/Business-Rules.md | Yes | High |
| Roles | 07-MAINTENANCE/Roles.md | Yes | Medium |
| Permissions | 07-MAINTENANCE/Permissions.md | Yes | Medium |
| Screens | 07-MAINTENANCE/Screens.md | Yes | Medium |
| Components | 07-MAINTENANCE/Components.md | Yes | Medium |
| Database | 07-MAINTENANCE/Database.md | Yes | High |
| APIs | 07-MAINTENANCE/APIs.md | Yes | High |
| Events | 07-MAINTENANCE/Events.md | Yes | High |
| Notifications | 07-MAINTENANCE/Notifications.md | Yes | High |
| Reports | 07-MAINTENANCE/Reports.md | Yes | High |
| KPIs | 07-MAINTENANCE/KPIs.md | Yes | High |
| AI Opportunities | 07-MAINTENANCE/AI-Opportunities.md | Yes | High |
| Testing | 07-MAINTENANCE/Testing.md | Yes | High |
| Acceptance Criteria | 07-MAINTENANCE/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** MaintenanceSchedule, RecurringTask, Asset, Frequency, ChecklistTemplate
**Dependencies:** Service Request (MNT-01), SLA Management (MNT-02)

## Warranty Management (MNT-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 07-MAINTENANCE/Business-Overview.md | Yes | High |
| Business Capabilities | 07-MAINTENANCE/Business-Capabilities.md | Yes | High |
| Workflows | 07-MAINTENANCE/Workflows.md | Yes | High |
| Business Rules | 07-MAINTENANCE/Business-Rules.md | Yes | High |
| Roles | 07-MAINTENANCE/Roles.md | Yes | Medium |
| Permissions | 07-MAINTENANCE/Permissions.md | Yes | Medium |
| Screens | 07-MAINTENANCE/Screens.md | Yes | Low |
| Components | 07-MAINTENANCE/Components.md | Yes | Low |
| Database | 07-MAINTENANCE/Database.md | Yes | High |
| APIs | 07-MAINTENANCE/APIs.md | Yes | High |
| Events | 07-MAINTENANCE/Events.md | Yes | High |
| Notifications | 07-MAINTENANCE/Notifications.md | Yes | High |
| Reports | 07-MAINTENANCE/Reports.md | Yes | Medium |
| KPIs | 07-MAINTENANCE/KPIs.md | Yes | Low |
| AI Opportunities | 07-MAINTENANCE/AI-Opportunities.md | Yes | Medium |
| Testing | 07-MAINTENANCE/Testing.md | Yes | High |
| Acceptance Criteria | 07-MAINTENANCE/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Warranty, WarrantyTerm, Asset, WarrantyClaim, CoveragePeriod
**Dependencies:** Service Request (MNT-01), Procurement (PO-04)

## Maintenance History (MNT-05)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 07-MAINTENANCE/Business-Overview.md | Yes | High |
| Business Capabilities | 07-MAINTENANCE/Business-Capabilities.md | Yes | High |
| Workflows | 07-MAINTENANCE/Workflows.md | Yes | High |
| Business Rules | 07-MAINTENANCE/Business-Rules.md | Yes | Medium |
| Roles | 07-MAINTENANCE/Roles.md | Yes | Medium |
| Permissions | 07-MAINTENANCE/Permissions.md | Yes | Medium |
| Screens | 07-MAINTENANCE/Screens.md | Yes | Medium |
| Components | 07-MAINTENANCE/Components.md | Yes | Medium |
| Database | 07-MAINTENANCE/Database.md | Yes | High |
| APIs | 07-MAINTENANCE/APIs.md | Yes | High |
| Events | 07-MAINTENANCE/Events.md | Yes | High |
| Notifications | 07-MAINTENANCE/Notifications.md | No | Low |
| Reports | 07-MAINTENANCE/Reports.md | Yes | High |
| KPIs | 07-MAINTENANCE/KPIs.md | Yes | High |
| AI Opportunities | 07-MAINTENANCE/AI-Opportunities.md | Yes | Low |
| Testing | 07-MAINTENANCE/Testing.md | Yes | High |
| Acceptance Criteria | 07-MAINTENANCE/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Asset, ServiceHistory, ServiceLog, PartReplaced, CostRecord
**Dependencies:** Service Request (MNT-01), Preventive Maintenance (MNT-03)
