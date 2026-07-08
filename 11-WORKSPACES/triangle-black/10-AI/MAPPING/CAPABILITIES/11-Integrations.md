# 11-Integrations — Capability Mapping

## Email Sending (INT-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | High |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | High |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | Medium |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | Medium |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | Yes | Low |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | Yes | High |
| Notifications | 11-INTEGRATIONS/Notifications.md | Yes | High |
| Reports | 11-INTEGRATIONS/Reports.md | Yes | Medium |
| KPIs | 11-INTEGRATIONS/KPIs.md | Yes | Medium |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | Yes | Low |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** EmailMessage, EmailTemplate, SMTPConfig, SendLog, EmailAttachment
**Dependencies:** Shared Kernel (SK-05), All domains (cross-cutting)

## E-Invoice Submission (INT-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | High |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | High |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | High |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | High |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | Yes | Low |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | Yes | High |
| Notifications | 11-INTEGRATIONS/Notifications.md | Yes | High |
| Reports | 11-INTEGRATIONS/Reports.md | Yes | Medium |
| KPIs | 11-INTEGRATIONS/KPIs.md | Yes | Low |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | No | Low |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Invoice, ETAConfig, SubmissionRecord, ETAResponse, SubmissionStatus
**Dependencies:** Financial Control (AR-01), Government (ETA platform)

## SMS Notifications (INT-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | Medium |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | Medium |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | Medium |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | Medium |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | Yes | Low |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | Yes | High |
| Notifications | 11-INTEGRATIONS/Notifications.md | Yes | High |
| Reports | 11-INTEGRATIONS/Reports.md | Yes | Medium |
| KPIs | 11-INTEGRATIONS/KPIs.md | Yes | Low |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | No | Low |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** SMSMessage, SMSProvider, SMSConfig, SendStatus, SMSConsent
**Dependencies:** Shared Kernel (SK-05), All domains (cross-cutting)

## Calendar Sync (INT-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | Medium |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | Medium |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | Medium |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | Medium |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | Yes | Medium |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | Yes | High |
| Notifications | 11-INTEGRATIONS/Notifications.md | Yes | Medium |
| Reports | 11-INTEGRATIONS/Reports.md | No | Low |
| KPIs | 11-INTEGRATIONS/KPIs.md | No | Low |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | Yes | Low |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** CalendarEvent, CalendarProvider, SyncRecord, OAuthToken, CalendarConfig
**Dependencies:** Commercial (SRV-01), Human Resources (ATT-02)

## Webhook Receiver (INT-05)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | High |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | High |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | Medium |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | High |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | No | Low |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | Yes | High |
| Notifications | 11-INTEGRATIONS/Notifications.md | No | Low |
| Reports | 11-INTEGRATIONS/Reports.md | Yes | Medium |
| KPIs | 11-INTEGRATIONS/KPIs.md | No | Low |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | No | Low |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** WebhookEndpoint, WebhookPayload, WebhookLog, SignatureVerification, EventType
**Dependencies:** Shared Kernel (SK-03), All external integrations

## Webhook Dispatcher (INT-06)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | High |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | High |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | Medium |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | Medium |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | No | Low |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | Yes | High |
| Notifications | 11-INTEGRATIONS/Notifications.md | No | Low |
| Reports | 11-INTEGRATIONS/Reports.md | Yes | Medium |
| KPIs | 11-INTEGRATIONS/KPIs.md | Yes | Low |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | No | Low |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** WebhookSubscription, WebhookDispatch, DeliveryAttempt, RetryPolicy, TargetURL
**Dependencies:** Shared Kernel (SK-03), Event Bus (SK-03)

## Data Import (INT-07)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | High |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | High |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | Medium |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | Medium |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | Yes | Low |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | Yes | High |
| Notifications | 11-INTEGRATIONS/Notifications.md | Yes | Medium |
| Reports | 11-INTEGRATIONS/Reports.md | Yes | Medium |
| KPIs | 11-INTEGRATIONS/KPIs.md | No | Low |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | Yes | Medium |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** ImportJob, ImportMapping, ImportRecord, ValidationError, ImportLog
**Dependencies:** Shared Kernel (SK-04, SK-07), All domains (master data)

## Data Export (INT-08)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 11-INTEGRATIONS/Business-Overview.md | Yes | High |
| Business Capabilities | 11-INTEGRATIONS/Business-Capabilities.md | Yes | High |
| Workflows | 11-INTEGRATIONS/Workflows.md | Yes | High |
| Business Rules | 11-INTEGRATIONS/Business-Rules.md | Yes | Medium |
| Roles | 11-INTEGRATIONS/Roles.md | Yes | Medium |
| Permissions | 11-INTEGRATIONS/Permissions.md | Yes | Medium |
| Screens | 11-INTEGRATIONS/Screens.md | Yes | Low |
| Components | 11-INTEGRATIONS/Components.md | Yes | Low |
| Database | 11-INTEGRATIONS/Database.md | Yes | High |
| APIs | 11-INTEGRATIONS/APIs.md | Yes | High |
| Events | 11-INTEGRATIONS/Events.md | No | Low |
| Notifications | 11-INTEGRATIONS/Notifications.md | Yes | Medium |
| Reports | 11-INTEGRATIONS/Reports.md | Yes | Medium |
| KPIs | 11-INTEGRATIONS/KPIs.md | No | Low |
| AI Opportunities | 11-INTEGRATIONS/AI-Opportunities.md | No | Low |
| Testing | 11-INTEGRATIONS/Testing.md | Yes | High |
| Acceptance Criteria | 11-INTEGRATIONS/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** ExportJob, ExportFormat, ExportQuery, ExportFile, ExportLog
**Dependencies:** Shared Kernel (SK-06), All domains (reporting)
