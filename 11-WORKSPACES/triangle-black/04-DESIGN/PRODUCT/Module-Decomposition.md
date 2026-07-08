# Module Decomposition

## Module Registry

| Module | Portal | Bounded Context | V1 | Aggregate Roots | Domain Services |
|--------|--------|-----------------|----|-----------------|-----------------|
| Marketing Site | Public Website | Marketing | Yes | Campaign, Segment | CampaignROIService, SegmentMembershipService |
| CRM | Operations | CRM | Yes | Lead, Account, Opportunity | LeadScoringService, LeadDeduplicationService, PipelineProgressionService |
| Quotations | Operations | Quotation | Yes | Quotation, PriceBook | QuotationPricingService, MarginAnalysisService, QuotationApprovalRoutingService |
| Projects | Operations | Project | Yes | Project, ChangeOrder, SiteSurvey, EngineeringAssessment | ProjectBudgetTrackingService, ResourceAvailabilityService, ScheduleImpactAnalysisService, SiteSurveySchedulingService |
| Procurement | Operations | Procurement | No (V2) | ProcurementRequest, Vendor, PurchaseOrder, RFQ | VendorEvaluationService, PurchaseOrderBudgetCheckService, ProcurementApprovalRoutingService |
| Client Portal | Client Portal | ClientPortal | Yes | PortalUser | — |
| Executive Dashboard | Executive Dashboard | Dashboard | Yes | — | — |
| Administration | Operations | Administration | Yes | User, Role, AuditLog | AuthorizationService, AuditService |
| Document Management | Cross-cutting | Document | Yes | Document | — |
| Notification Engine | Cross-cutting | Notification | No (V2) | — | NotificationDispatchService |

---

## Module: Marketing Site

| Field | Value |
|-------|-------|
| Bounded Context | Marketing |
| Portal | Public Website |
| V1 Priority | P0 |
| Business Capabilities | Marketing |
| Aggregate Roots | Campaign, Segment (V2) |
| Domain Events Emitted | CampaignLaunched, CampaignCompleted, CampaignResponseReceived, LeadScoreUpdated |
| Domain Events Consumed | LeadCreated, LeadQualified |
| Key Entities | Campaign, Segment, CampaignResponse |
| Key Value Objects | LeadScore, SegmentCriteria |
| Dependencies | CRM (lead data), Document (templates) |
| V1 Features | Company profile, Services, Contact form, Blog |

---

## Module: CRM

| Field | Value |
|-------|-------|
| Bounded Context | CRM |
| Portal | Operations Portal |
| V1 Priority | P0 |
| Business Capabilities | Marketing, CRM (Lead Management), CRM (Opportunities) |
| Aggregate Roots | Lead, Account, Opportunity |
| Domain Events Emitted | LeadCreated, LeadQualified, LeadDisqualified, OpportunityCreated, OpportunityStageChanged, OpportunityWon, OpportunityLost, ClientContactUpdated |
| Domain Events Consumed | CampaignResponseReceived, LeadScoreUpdated, SiteSurveyCompleted |
| Key Entities | Lead, Account, Contact, Opportunity, Activity, LeadSource |
| Key Value Objects | LeadScore, OpportunityStage, ActivityType |
| Domain Services | LeadScoringService, LeadDeduplicationService, PipelineProgressionService |
| Dependencies | Marketing (scoring), Quotation (opportunity handoff) |
| V1 Features | Lead management, Opportunity pipeline, Company records, Contact management, Activity logging |

---

## Module: Quotations

| Field | Value |
|-------|-------|
| Bounded Context | Quotation |
| Portal | Operations Portal |
| V1 Priority | P0 |
| Business Capabilities | Quotations, Contracts |
| Aggregate Roots | Quotation, PriceBook |
| Domain Events Emitted | QuotationCreated, QuotationSent, QuotationAccepted, QuotationRejected, QuotationExpired |
| Domain Events Consumed | OpportunityCreated, SiteSurveyCompleted |
| Key Entities | Quotation, QuotationLineItem, PriceBookEntry, RevisionHistory |
| Key Value Objects | QuotationStatus, Margin, CommercialTerms |
| Domain Services | QuotationPricingService, MarginAnalysisService, QuotationApprovalRoutingService |
| Dependencies | CRM (opportunities), Project (assessments), Document (templates, PDF) |
| V1 Features | RFQ management, Quotation builder, Approval workflow, PDF generation, Contract generation, Revision history |

---

## Module: Projects

| Field | Value |
|-------|-------|
| Bounded Context | Project (includes SiteSurvey, EngineeringAssessment, QA/QC, Handover) |
| Portal | Operations Portal |
| V1 Priority | P0 |
| Business Capabilities | Site Survey, Engineering Design, Contracting, Installation, QA/QC, Handover |
| Aggregate Roots | Project, ChangeOrder, SiteSurvey, EngineeringAssessment |
| Domain Events Emitted | ProjectKickedOff, ProjectPhaseCompleted, ProjectMilestoneReached, ChangeOrderCreated, ChangeOrderApproved, ProjectCompleted, SiteSurveyScheduled, SiteSurveyCompleted, AssessmentCompleted |
| Domain Events Consumed | ContractSigned, GoodsReceived |
| Key Entities | Project, ProjectPhase, Milestone, Task, ResourceAssignment, Issue, Risk, ChangeOrder, SiteSurvey, ConditionReport, EngineeringAssessment |
| Key Value Objects | ProjectStatus, MilestoneStatus, Priority, Severity |
| Domain Services | ProjectBudgetTrackingService, ResourceAvailabilityService, ScheduleImpactAnalysisService, SiteSurveySchedulingService |
| Dependencies | Contract (contract data), Procurement (materials), Document (files), ClientPortal (client visibility) |
| V1 Features | Project setup, Milestone tracking, Deliverable management, File repository, Site survey, Engineering assessment |

---

## Module: Client Portal

| Field | Value |
|-------|-------|
| Bounded Context | ClientPortal |
| Portal | Client Portal |
| V1 Priority | P1 |
| Business Capabilities | Client Portal, Support |
| Aggregate Roots | PortalUser |
| Domain Events Emitted | ClientPortalUserCreated, DocumentAccessedByClient |
| Domain Events Consumed | ContractSigned, ProjectMilestoneReached, DocumentUploaded |
| Key Entities | PortalUser |
| Key Value Objects | PortalPreferences, ProjectAccess |
| Domain Services | — |
| Dependencies | Projects (data), Quotations (data), Documents (files), Notifications (alerts) |
| V1 Features | Project progress view, Quotation review/approve, Document access, Invoice view, Service requests |

---

## Module: Executive Dashboard

| Field | Value |
|-------|-------|
| Bounded Context | Dashboard |
| Portal | Executive Dashboard |
| V1 Priority | P1 |
| Business Capabilities | Executive Intelligence, KPI, Forecasting, Risk |
| Aggregate Roots | — (read-only, aggregated data) |
| Domain Events Emitted | AlertTriggered |
| Domain Events Consumed | All (via queries) |
| Key Entities | — (uses materialized views) |
| Key Value Objects | KPIMetric, TrendDirection, AlertThreshold |
| Domain Services | — |
| Dependencies | CRM (pipeline data), Projects (health data), Quotations (revenue data) |
| V1 Features | Pipeline health, Revenue tracking, Project health, Team workload, Client health, KPI cards |

---

## Module: Administration

| Field | Value |
|-------|-------|
| Bounded Context | Administration |
| Portal | Operations Portal |
| V1 Priority | P0 (prerequisite) |
| Business Capabilities | Administration |
| Aggregate Roots | User, Role, AuditLog |
| Domain Events Emitted | UserCreated, UserRoleChanged, SystemConfigurationChanged |
| Domain Events Consumed | — |
| Key Entities | User, Role, Permission, AuditLogEntry |
| Key Value Objects | UserRole, PermissionName |
| Domain Services | AuthorizationService, AuditService |
| Dependencies | — (foundation for all modules) |
| V1 Features | User management, Role & permissions, Company/tenant config, System settings, Audit log |

---

## Cross-Cutting: Document Management

| Field | Value |
|-------|-------|
| Bounded Context | Document |
| Scope | All portals |
| V1 Priority | P0 |
| Aggregate Roots | Document |
| Domain Events Emitted | DocumentUploaded, DocumentVersionCreated, DocumentShared |
| Key Entities | Document, DocumentVersion |
| Key Value Objects | DocumentType, FileMetadata |
| V1 Features | File upload, Version control, Category tagging, Download |

## Cross-Cutting: Notification Engine

| Field | Value |
|-------|-------|
| Bounded Context | Notification |
| Scope | All portals |
| V1 Priority | P1 (basic email only; full engine V2) |
| Domain Events Emitted | NotificationSent |
| Domain Events Consumed | All (event-driven) |
| Key Entities | NotificationTemplate, NotificationPreference |
| Domain Services | NotificationDispatchService |
| V1 Features | Email notifications for status changes, In-app notification bell |
