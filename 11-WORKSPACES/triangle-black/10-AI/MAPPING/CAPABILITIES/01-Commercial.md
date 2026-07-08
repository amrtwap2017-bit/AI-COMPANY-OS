# 01-Commercial — Capability Mapping

## Lead Capture (LEA-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Lead, LeadSource, LeadCaptureForm, WebLead, ReferralLead
**Dependencies:** Shared Kernel (SK-01, SK-02, SK-07)

## Lead Scoring (LEA-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Low |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | High |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Lead, LeadScore, ScoringRule, ScoringWeight, ScoreHistory
**Dependencies:** Lead Capture (LEA-01), Shared Kernel (SK-01, SK-02)

## Lead Qualification (LEA-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Lead, LeadQualification, QualificationCriteria, LeadStatus
**Dependencies:** Lead Capture (LEA-01), Lead Scoring (LEA-02)

## Lead Assignment (LEA-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Lead, SalesRep, LeadAssignmentRule, AssignmentHistory, LeadQueue
**Dependencies:** Lead Capture (LEA-01), Lead Scoring (LEA-02), Shared Kernel (SK-05)

## Lead Nurture (LEA-05)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Lead, FollowUp, ActivityLog, Reminder, CommunicationHistory
**Dependencies:** Lead Capture (LEA-01), Lead Assignment (LEA-04), Shared Kernel (SK-05)

## Company Registration (ACC-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | No | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Company, CompanyProfile, BusinessType, RegistrationDocument
**Dependencies:** Shared Kernel (SK-01, SK-02, SK-07)

## Company Hierarchy (ACC-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | No | Low |
| Reports | 01-COMMERCIAL/Reports.md | No | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | No | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** Company, CompanyHierarchy, ParentCompany, Branch, Department
**Dependencies:** Company Registration (ACC-01)

## Company Segmentation (ACC-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | No | Low |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** Company, CompanySegment, SegmentType, SegmentCriteria
**Dependencies:** Company Registration (ACC-01)

## Contact Management (CON-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Contact, ContactRole, ContactType, ContactDepartment
**Dependencies:** Company Registration (ACC-01)

## Contact Communication (CON-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | Medium |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Contact, CommunicationLog, CommunicationType, MeetingNote, EmailLog
**Dependencies:** Contact Management (CON-01), Shared Kernel (SK-05)

## Pipeline Management (OPP-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | High |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | High |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | High |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Opportunity, PipelineStage, OpportunityLineItem, StageTransition, WinProbability
**Dependencies:** Lead Qualification (LEA-03), Company Registration (ACC-01), Contact Management (CON-01)

## Pipeline Forecasting (OPP-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | High |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | High |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | High |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | High |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Opportunity, Forecast, ForecastPeriod, ForecastValue, ForecastCategory
**Dependencies:** Pipeline Management (OPP-01)

## Win/Loss Analysis (OPP-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | Medium |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Low |
| Components | 01-COMMERCIAL/Components.md | Yes | Low |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | No | Low |
| Reports | 01-COMMERCIAL/Reports.md | Yes | High |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | High |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | High |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** Opportunity, WinLossReason, Competitor, WinLossTrend
**Dependencies:** Pipeline Management (OPP-01)

## Survey Scheduling (SRV-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | No | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** SiteSurvey, SurveySchedule, Engineer, TimeSlot, SurveyStatus
**Dependencies:** Opportunity Management (OPP-01), Shared Kernel (SK-05)

## Survey Execution (SRV-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** SiteSurvey, SurveyFinding, Photo, Measurement, SurveyReport
**Dependencies:** Survey Scheduling (SRV-01), Shared Kernel (SK-01)

## Engineering Assessment (SRV-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | High |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | High |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** SiteSurvey, EngineeringAssessment, BOQItem, Recommendation, TechnicalSpec
**Dependencies:** Survey Execution (SRV-02)

## Survey Approval (SRV-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | No | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** SiteSurvey, SurveyApproval, ApprovalReview, ApprovalDecision
**Dependencies:** Engineering Assessment (SRV-03), Shared Kernel (SK-05)

## BOQ Builder (QTN-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | High |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Low |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Quotation, BOQItem, MaterialItem, LaborItem, EquipmentItem, Quantity
**Dependencies:** Engineering Assessment (SRV-03), Shared Kernel (SK-07)

## Pricing Engine (QTN-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | No | Low |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | High |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Quotation, PriceListItem, UnitPrice, Margin, Discount, Markup
**Dependencies:** BOQ Builder (QTN-01), Shared Kernel (SK-07), Supplier Management (SUP-04)

## Quotation Generator (QTN-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | High |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Quotation, QuotationDocument, PDFTemplate, QuotationLine
**Dependencies:** Pricing Engine (QTN-02), Shared Kernel (SK-06)

## Quotation Workflow (QTN-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | No | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Quotation, QuotationStatus, QuotationApproval, ApprovalStep, StatusTransition
**Dependencies:** Quotation Generator (QTN-03), Shared Kernel (SK-03, SK-05)

## Version Control (QTN-05)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Low |
| Components | 01-COMMERCIAL/Components.md | Yes | Low |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | No | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** Quotation, QuotationVersion, VersionDiff, RevisionHistory
**Dependencies:** Quotation Generator (QTN-03)

## Margin Calculator (QTN-06)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | High |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | High |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Quotation, MarginCalculation, MarginRule, CostItem, RevenueItem
**Dependencies:** Pricing Engine (QTN-02), Shared Kernel (SK-01)

## Contract Creation (CTR-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | High |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Contract, ContractTemplate, ContractLine, ContractParty, Signatory
**Dependencies:** Quotation Workflow (QTN-04), Company Registration (ACC-01)

## Contract Lifecycle (CTR-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Contract, ContractStatus, ContractAmendment, ContractTerm, Milestone
**Dependencies:** Contract Creation (CTR-01), Shared Kernel (SK-03, SK-05)

## Variation Orders (CTR-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Medium |
| Components | 01-COMMERCIAL/Components.md | Yes | Medium |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | No | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Contract, VariationOrder, VariationType, PriceAdjustment, ScopeChange
**Dependencies:** Contract Lifecycle (CTR-02)

## Contract Attachments (CTR-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | Medium |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | Medium |
| Screens | 01-COMMERCIAL/Screens.md | Yes | Low |
| Components | 01-COMMERCIAL/Components.md | Yes | Low |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | No | Low |
| Reports | 01-COMMERCIAL/Reports.md | No | Low |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** Contract, ContractAttachment, AttachmentType, Document
**Dependencies:** Contract Creation (CTR-01), Document Management (DOC-01)

## Client Dashboard (PT-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | Medium |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | High |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, Contract, Quotation, Invoice, ServiceRequest, Document
**Dependencies:** Contract Lifecycle (CTR-02), Project Delivery (PRJ-01)

## Service Requests (PT-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | High |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | High |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | High |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | High |
| Reports | 01-COMMERCIAL/Reports.md | Yes | Medium |
| KPIs | 01-COMMERCIAL/KPIs.md | Yes | Medium |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | Yes | Medium |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** ServiceRequest, RequestType, RequestStatus, ServiceLog
**Dependencies:** Client Dashboard (PT-01), Maintenance (MNT-01)

## Payment History (PT-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 01-COMMERCIAL/Business-Overview.md | Yes | High |
| Business Capabilities | 01-COMMERCIAL/Business-Capabilities.md | Yes | High |
| Workflows | 01-COMMERCIAL/Workflows.md | Yes | Medium |
| Business Rules | 01-COMMERCIAL/Business-Rules.md | Yes | High |
| Roles | 01-COMMERCIAL/Roles.md | Yes | High |
| Permissions | 01-COMMERCIAL/Permissions.md | Yes | High |
| Screens | 01-COMMERCIAL/Screens.md | Yes | High |
| Components | 01-COMMERCIAL/Components.md | Yes | High |
| Database | 01-COMMERCIAL/Database.md | Yes | High |
| APIs | 01-COMMERCIAL/APIs.md | Yes | High |
| Events | 01-COMMERCIAL/Events.md | Yes | Medium |
| Notifications | 01-COMMERCIAL/Notifications.md | Yes | Medium |
| Reports | 01-COMMERCIAL/Reports.md | Yes | High |
| KPIs | 01-COMMERCIAL/KPIs.md | No | Low |
| AI Opportunities | 01-COMMERCIAL/AI-Opportunities.md | No | Low |
| Testing | 01-COMMERCIAL/Testing.md | Yes | High |
| Acceptance Criteria | 01-COMMERCIAL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Invoice, Payment, PaymentHistory, CreditNote, Receipt
**Dependencies:** Client Dashboard (PT-01), Financial Control (AR-01, AR-02)
