# Domain Events

Events emitted between bounded contexts for asynchronous communication. Events are named in past tense and represent facts that have occurred.

---

## CRM → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `LeadCreated` | A new lead has been created | LeadId, Name, Company, Source | Marketing (for scoring) |
| `LeadQualified` | A lead has been qualified | LeadId, Score, QualifiedBy | Marketing, Quotation |
| `LeadDisqualified` | A lead has been disqualified | LeadId, Reason, DisqualifiedBy | Marketing |
| `OpportunityCreated` | A new opportunity has been created | OpportunityId, LeadId, AccountId, Value | Quotation |
| `OpportunityStageChanged` | Opportunity moved to a new stage | OpportunityId, PreviousStage, NewStage | Dashboard, Notification |
| `OpportunityWon` | Opportunity has been won | OpportunityId, AccountId, Value | Quotation, Contract, Dashboard |
| `OpportunityLost` | Opportunity has been lost | OpportunityId, Reason, LostTo | Dashboard |
| `ClientContactUpdated` | A client contact details changed | ContactId, AccountId, ChangedFields | ClientPortal, Notification |

## Marketing → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `CampaignLaunched` | A campaign has been launched | CampaignId, Name, Type, Budget | CRM, Dashboard |
| `CampaignCompleted` | A campaign has ended | CampaignId, Results, Cost | CRM, Dashboard |
| `CampaignResponseReceived` | A response to a campaign recorded | CampaignId, LeadId, ResponseType | CRM (lead scoring) |
| `LeadScoreUpdated` | Lead score has been recalculated | LeadId, Score, ScoreBreakdown | CRM |

## Quotation → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `QuotationCreated` | A new quotation has been drafted | QuotationId, OpportunityId, Value | Contract, Dashboard |
| `QuotationSent` | Quotation has been sent to client | QuotationId, ClientId, SentDate | CRM, Notification |
| `QuotationAccepted` | Client has accepted the quotation | QuotationId, Value, AcceptedBy | Contract, Project, Dashboard |
| `QuotationRejected` | Client has rejected the quotation | QuotationId, Reason | CRM, Dashboard |
| `QuotationExpired` | Quotation validity period has ended | QuotationId | CRM |

## Contract → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `ContractDrafted` | A contract document has been drafted | ContractId, Number, Value | Dashboard, Document |
| `ContractSigned` | Contract has been fully executed | ContractId, AccountId, StartDate, EndDate | Project, ClientPortal, Dashboard |
| `ContractAmended` | Contract has been amended | ContractId, AmendmentId, ChangeValue | Project, Dashboard |
| `ContractTerminated` | Contract has been terminated | ContractId, Reason, EffectiveDate | Project, ClientPortal, Dashboard |
| `ContractExpiryApproaching` | Contract is approaching expiry | ContractId, ExpiryDate, DaysRemaining | Notification, Renewals |

## Project → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `ProjectKickedOff` | Project has been initiated | ProjectId, ContractId, ManagerId, Budget | Procurement, Dashboard, ClientPortal |
| `ProjectPhaseCompleted` | A project phase has been completed | ProjectId, PhaseId, PhaseName | Contract (milestone billing), Dashboard |
| `ProjectMilestoneReached` | A milestone has been achieved | ProjectId, MilestoneId, MilestoneName | Contract, ClientPortal, Notification |
| `ChangeOrderCreated` | A change order has been raised | ChangeOrderId, ProjectId, ImpactBudget, ImpactSchedule | Contract, Dashboard |
| `ChangeOrderApproved` | Change order has been approved | ChangeOrderId, ProjectId, ApprovedBy | Project, Contract |
| `ProjectCompleted` | Project has been completed | ProjectId, ContractId, CompletionDate | Contract, Handover, Dashboard |
| `SiteSurveyScheduled` | A site survey has been scheduled | SurveyId, ProjectId, ScheduledDate, Location | Notification, CRM |
| `SiteSurveyCompleted` | Site survey has been completed | SurveyId, ProjectId, Summary | Quotation, Engineering Assessment |
| `AssessmentCompleted` | Engineering assessment has been completed | AssessmentId, ProjectId | Quotation, Project |

## Procurement → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `RequisitionApproved` | Procurement request has been approved | RequestId, ProjectId, TotalValue | Procurement (RFQ creation) |
| `RFQIssued` | RFQ has been sent to vendors | RFQId, VendorCount, ResponseDeadline | Dashboard |
| `VendorSelected` | A vendor has been selected for award | RFQId, VendorId, AwardAmount | Procurement (PO creation) |
| `PurchaseOrderIssued` | A purchase order has been issued | POId, VendorId, ProjectId, TotalAmount, Status | Inventory, Project, Supply, Dashboard |
| `PurchaseOrderApproved` | PO has been approved | POId, TotalAmount, ApprovedBy | Procurement, Notification |
| `GoodsReceived` | Goods have been received and accepted | ReceiptId, POId, ItemCount, AcceptedQty, RejectedQty | Inventory, Project, Contract |
| `InvoiceReceived` | Vendor invoice has been received | InvoiceId, POId, Amount | Contract (cost tracking) |

## Inventory → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `StockLevelLow` | Stock has fallen below reorder point | ItemId, CurrentStock, ReorderLevel | Procurement (reorder trigger) |
| `StockMovementCompleted` | Stock movement has been completed | MovementId, ItemId, Quantity, Source, Destination | Project, Dashboard |

## Document → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `DocumentUploaded` | A document has been uploaded | DocumentId, Type, Category, OwnerId | ClientPortal, Notification |
| `DocumentVersionCreated` | A new version of a document created | DocumentId, VersionNumber, UploadedBy | Dashboard |
| `DocumentShared` | A document has been shared with a client | DocumentId, ClientId, SharedBy | Notification |

## QA/QC → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `DefectIdentified` | A quality defect has been identified | DefectId, ProjectId, Severity, Asset | Project, Notification |
| `DefectResolved` | A defect has been resolved | DefectId, ProjectId, ResolvedBy, Resolution | Project |
| `InspectionCompleted` | A quality inspection has been completed | InspectionId, ProjectId, Result (Pass/Fail) | Project, Dashboard |

## Handover → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `HandoverStarted` | Handover process has been initiated | HandoverId, ProjectId | Notification, ClientPortal |
| `HandoverCompleted` | Project has been formally handed over | HandoverId, ProjectId, HandoverDate, WarrantyEndDate | Contract, Maintenance, Dashboard |

## Maintenance → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `MaintenanceScheduled` | A maintenance task has been scheduled | MaintenanceId, ProjectId, ScheduledDate, Type | Notification, ClientPortal |
| `MaintenanceCompleted` | Maintenance has been performed | MaintenanceId, ProjectId, ServiceReportId | Dashboard, Contract |

## Notification → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `NotificationSent` | A notification has been delivered | NotificationId, Channel, Recipient, Type | Dashboard (analytics) |

## Administration → Other Contexts

| Event | Description | Payload | Consumers |
|-------|-------------|---------|-----------|
| `UserCreated` | A new user has been created | UserId, Username, Email, Roles | Notification |
| `UserRoleChanged` | A user's role has been modified | UserId, PreviousRoles, NewRoles | Audit, Dashboard |
| `SystemConfigurationChanged` | A system setting has been updated | ConfigKey, PreviousValue, NewValue | All (if applicable) |

## Event Flow Diagram (Conceptual)

```
Marketing ──→ CampaignResponseReceived ──→ CRM
Marketing ──→ LeadScoreUpdated ──────────→ CRM

CRM ────────→ LeadCreated ───────────────→ Marketing
CRM ────────→ LeadQualified ─────────────→ Marketing, Quotation
CRM ────────→ OpportunityCreated ────────→ Quotation

Quotation ──→ QuotationAccepted ─────────→ Contract, Project
Quotation ──→ QuotationRejected ─────────→ CRM

Contract ───→ ContractSigned ────────────→ Project, ClientPortal

Project ────→ ProjectKickedOff ──────────→ Procurement
Project ────→ SiteSurveyCompleted ───────→ Quotation
Project ────→ ProjectCompleted ──────────→ Handover, Contract

Procurement → GoodsReceived ────────────→ Inventory, Project

Handover ───→ HandoverCompleted ─────────→ Maintenance, Contract
```
