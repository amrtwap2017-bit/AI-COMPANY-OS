# 00-Shared-Kernel — Capability Mapping

## Entity Framework (SK-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | High |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | No | Low |
| Roles | 00-SHARED-KERNEL/Roles.md | No | Low |
| Permissions | 00-SHARED-KERNEL/Permissions.md | No | Low |
| Notifications | 00-SHARED-KERNEL/Notifications.md | Yes | Medium |
| Reports | 00-SHARED-KERNEL/Reports.md | No | Low |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | No | Low |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | Medium |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | Medium |
| Workflows | 00-SHARED-KERNEL/Workflows.md | Yes | High |

**Total Documents:** 12
**Key Entities:** BaseEntity, AuditableEntity, SoftDeletableEntity, TenantEntity
**Dependencies:** None (foundational)

## Enum Registry (SK-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | Medium |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | No | Low |
| Roles | 00-SHARED-KERNEL/Roles.md | No | Low |
| Permissions | 00-SHARED-KERNEL/Permissions.md | No | Low |
| Notifications | 00-SHARED-KERNEL/Notifications.md | Yes | Medium |
| Reports | 00-SHARED-KERNEL/Reports.md | No | Low |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | Yes | Low |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | Medium |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | Medium |
| Workflows | 00-SHARED-KERNEL/Workflows.md | No | Low |

**Total Documents:** 11
**Key Entities:** Enumerations, EnumValue, EnumCategory
**Dependencies:** Entity Framework (SK-01)

## Event Bus (SK-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | High |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Workflows | 00-SHARED-KERNEL/Workflows.md | Yes | High |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | No | Low |
| Roles | 00-SHARED-KERNEL/Roles.md | No | Low |
| Permissions | 00-SHARED-KERNEL/Permissions.md | No | Low |
| Notifications | 00-SHARED-KERNEL/Notifications.md | Yes | High |
| Reports | 00-SHARED-KERNEL/Reports.md | No | Low |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | Yes | Medium |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | High |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 13
**Key Entities:** Event, EventHandler, EventBus, EventSubscription, EventLog
**Dependencies:** Entity Framework (SK-01), Enum Registry (SK-02)

## Validation Engine (SK-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | Medium |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Workflows | 00-SHARED-KERNEL/Workflows.md | Yes | High |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | No | Low |
| Roles | 00-SHARED-KERNEL/Roles.md | No | Low |
| Permissions | 00-SHARED-KERNEL/Permissions.md | No | Low |
| Notifications | 00-SHARED-KERNEL/Notifications.md | Yes | Medium |
| Reports | 00-SHARED-KERNEL/Reports.md | No | Low |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | Yes | Low |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | High |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 12
**Key Entities:** ValidationRule, ValidationSchema, ValidationResult, ValidationError
**Dependencies:** Entity Framework (SK-01), Enum Registry (SK-02)

## Notification Dispatcher (SK-05)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | High |
| Notifications | 00-SHARED-KERNEL/Notifications.md | Yes | High |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Workflows | 00-SHARED-KERNEL/Workflows.md | Yes | Medium |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | Yes | Medium |
| Roles | 00-SHARED-KERNEL/Roles.md | Yes | Medium |
| Permissions | 00-SHARED-KERNEL/Permissions.md | Yes | Medium |
| Reports | 00-SHARED-KERNEL/Reports.md | No | Low |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | Yes | Medium |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | High |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** Notification, NotificationChannel, NotificationTemplate, NotificationPreference, NotificationLog
**Dependencies:** Entity Framework (SK-01), Enum Registry (SK-02), Event Bus (SK-03)

## Report Generator (SK-06)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | No | Low |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | Medium |
| Workflows | 00-SHARED-KERNEL/Workflows.md | Yes | Medium |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | No | Low |
| Roles | 00-SHARED-KERNEL/Roles.md | Yes | Medium |
| Permissions | 00-SHARED-KERNEL/Permissions.md | Yes | Medium |
| Notifications | 00-SHARED-KERNEL/Notifications.md | No | Low |
| Reports | 00-SHARED-KERNEL/Reports.md | Yes | High |
| KPIs | 00-SHARED-KERNEL/KPIs.md | Yes | High |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | Yes | Low |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | High |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 13
**Key Entities:** ReportTemplate, ReportDefinition, ReportSchedule, ReportOutput, ExportFormat
**Dependencies:** Entity Framework (SK-01), Enum Registry (SK-02)

## Master Data Management (SK-07)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | Medium |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Workflows | 00-SHARED-KERNEL/Workflows.md | Yes | Medium |
| Screens | 00-SHARED-KERNEL/Screens.md | Yes | Medium |
| Components | 00-SHARED-KERNEL/Components.md | Yes | Medium |
| Roles | 00-SHARED-KERNEL/Roles.md | Yes | Medium |
| Permissions | 00-SHARED-KERNEL/Permissions.md | Yes | Medium |
| Notifications | 00-SHARED-KERNEL/Notifications.md | No | Low |
| Reports | 00-SHARED-KERNEL/Reports.md | Yes | Low |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | Yes | Low |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | High |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** Currency, UnitOfMeasure, TaxRate, Country, City, MasterDataCategory
**Dependencies:** Entity Framework (SK-01), Enum Registry (SK-02), Validation Engine (SK-04)

## Audit Trail (SK-08)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | High |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Workflows | 00-SHARED-KERNEL/Workflows.md | Yes | Medium |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | No | Low |
| Roles | 00-SHARED-KERNEL/Roles.md | Yes | Medium |
| Permissions | 00-SHARED-KERNEL/Permissions.md | Yes | Medium |
| Notifications | 00-SHARED-KERNEL/Notifications.md | No | Low |
| Reports | 00-SHARED-KERNEL/Reports.md | Yes | Medium |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | Yes | Low |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | High |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 13
**Key Entities:** AuditLog, AuditEntry, AuditAction, AuditEntity, ChangeRecord
**Dependencies:** Entity Framework (SK-01), Event Bus (SK-03)

## Tenant Isolation (SK-09)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 00-SHARED-KERNEL/Business-Overview.md | Yes | High |
| Business Capabilities | 00-SHARED-KERNEL/Business-Capabilities.md | Yes | High |
| Database | 00-SHARED-KERNEL/Database.md | Yes | High |
| APIs | 00-SHARED-KERNEL/APIs.md | Yes | High |
| Events | 00-SHARED-KERNEL/Events.md | Yes | Medium |
| Business Rules | 00-SHARED-KERNEL/Business-Rules.md | Yes | High |
| Workflows | 00-SHARED-KERNEL/Workflows.md | No | Low |
| Screens | 00-SHARED-KERNEL/Screens.md | No | Low |
| Components | 00-SHARED-KERNEL/Components.md | No | Low |
| Roles | 00-SHARED-KERNEL/Roles.md | Yes | Medium |
| Permissions | 00-SHARED-KERNEL/Permissions.md | Yes | Medium |
| Notifications | 00-SHARED-KERNEL/Notifications.md | No | Low |
| Reports | 00-SHARED-KERNEL/Reports.md | No | Low |
| KPIs | 00-SHARED-KERNEL/KPIs.md | No | Low |
| AI Opportunities | 00-SHARED-KERNEL/AI-Opportunities.md | No | Low |
| Testing | 00-SHARED-KERNEL/Testing.md | Yes | High |
| Acceptance Criteria | 00-SHARED-KERNEL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 11
**Key Entities:** Tenant, TenantConfiguration, TenantConnectionString
**Dependencies:** Entity Framework (SK-01), Audit Trail (SK-08)
