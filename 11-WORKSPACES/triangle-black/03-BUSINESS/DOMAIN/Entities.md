# Entities

Entity catalog across all bounded contexts. Entities have a distinct identity that persists over time and across state changes.

---

## CRM Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| Lead | A potential client | LeadId | Name, Company, Title, Email, Phone, Source, Status, Score, AssignedTo, CreatedAt, UpdatedAt |
| Account | A client organization | AccountId | Name, Industry, Size, Website, Phone, Address, BillingInfo, Status |
| Contact | An individual at an account | ContactId | FirstName, LastName, Email, Phone, Title, Department, IsPrimary, AccountId |
| Opportunity | A sales opportunity | OpportunityId | Name, Amount, Stage, Probability, CloseDate, LeadId, AccountId, OwnerId |
| Activity | A logged interaction | ActivityId | Type, Subject, Description, DateTime, Duration, RelatedTo, OwnerId |
| LeadSource | Origin of a lead | SourceId | Name, Medium, CampaignId, ReferrerUrl |

---

## Marketing Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| Campaign | A marketing initiative | CampaignId | Name, Type, Status, StartDate, EndDate, Budget, Cost, OwnerId |
| Segment | An audience segment | SegmentId | Name, Description, Criteria, Dynamic (boolean), MemberCount |
| CampaignResponse | A response to a campaign | ResponseId | CampaignId, LeadId, ResponseType, ResponseDate, Details |

---

## Quotation Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| Quotation | A priced offer | QuotationId | Number, Version, Status, Total, Margin, Tax, ValidUntil, OpportunityId, AccountId, OwnerId |
| QuotationLineItem | A line in a quotation | LineItemId | QuotationId, ProductCode, Description, Quantity, UnitPrice, Discount, Total |
| PriceBookEntry | A priced item | EntryId | ProductCode, UnitPrice, CostPrice, EffectiveFrom, EffectiveTo, Currency |
| RevisionHistory | A quotation revision | RevisionId | QuotationId, Version, Changes, ModifiedBy, ModifiedAt |

---

## Contract Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| Contract | A legally binding agreement | ContractId | Number, Title, Type, Status, Value, QuotationId, AccountId, StartDate, EndDate, SignedDate |
| ContractClause | A clause in a contract | ClauseId | ContractId, Title, Content, Version, Category |
| PaymentMilestone | A scheduled payment | MilestoneId | ContractId, Description, Amount, DueDate, Status, CompletionCriteria |
| Amendment | A contract amendment | AmendmentId | ContractId, Number, Description, ChangeValue, EffectiveDate, Status |
| Signature | A contract signature record | SignatureId | ContractId, SignedBy, Role, Date, IPAddress, SignatureData |

---

## Project Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| Project | An engineering project | ProjectId | Code, Name, Type, Status, ContractId, AccountId, ManagerId, StartDate, EndDate, Budget |
| ProjectPhase | A phase of the project | PhaseId | ProjectId, Name, Sequence, StartDate, EndDate, Status, Budget |
| Milestone | A project milestone | MilestoneId | ProjectId, PhaseId, Name, TargetDate, AchievedDate, Status |
| Task | A project task | TaskId | ProjectId, PhaseId, Name, Description, AssignedTo, StartDate, DueDate, Status, Effort |
| ResourceAssignment | A resource on a project | AssignmentId | ProjectId, ResourceId, Role, AllocationPercentage, StartDate, EndDate |
| Issue | A project issue | IssueId | ProjectId, Title, Description, Priority, Severity, Status, ReportedBy, AssignedTo, ResolvedAt |
| Risk | A project risk | RiskId | ProjectId, Title, Description, Probability, Impact, Mitigation, Owner, Status |
| ChangeOrder | A change to the project | ChangeOrderId | ProjectId, Number, Description, ImpactBudget, ImpactSchedule, Status, ApprovedBy |
| SiteSurvey | A physical site inspection | SurveyId | ProjectId, ScheduledDate, CompletedDate, SurveyorId, Status, ReportSummary |
| ConditionReport | A condition assessment | ConditionId | SurveyId, AssetType, Location, Condition, Description, PhotoEvidence |
| EngineeringAssessment | A technical assessment | AssessmentId | ProjectId, SurveyId, Status, ReviewerId, ReviewedAt |

---

## Procurement Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| ProcurementRequest | A requisition | RequestId | Number, ProjectId, RequesterId, Status, TotalEstimatedValue, RequiredDate, CreatedAt |
| RequestLineItem | An item on a requisition | LineItemId | RequestId, ItemDescription, Quantity, EstimatedUnitPrice, RequiredDate |
| Vendor | A supplier organization | VendorId | Code, Name, Status, TaxId, LicenseNumber, ContactInfo, Address, PaymentTerms |
| VendorContact | A vendor's representative | ContactId | VendorId, Name, Title, Email, Phone, IsPrimary |
| RFQ | A request for quotation | RFQId | Number, Title, RequestId, IssueDate, ResponseDeadline, Status |
| RFQLineItem | An item on an RFQ | LineItemId | RFQId, ItemDescription, Quantity, TechnicalSpecs |
| VendorResponse | A vendor's RFQ response | ResponseId | RFQId, VendorId, SubmittedDate, TotalAmount, ValidityPeriod, Status |
| PurchaseOrder | A purchase order | POId | Number, Type, Status, VendorId, ProjectId, RFQId, TotalAmount, Currency, IssueDate, DeliveryDate |
| POLineItem | A line item on a PO | LineItemId | POId, ItemDescription, Quantity, UnitPrice, Total, ReceivedQuantity |
| GoodsReceipt | A goods received record | ReceiptId | POId, ReceivedDate, ReceivedBy, DeliveryNoteNumber, Status |
| ReceiptLineItem | A line item on a goods receipt | LineItemId | ReceiptId, POLineItemId, ReceivedQuantity, AcceptedQuantity, RejectedQuantity |

---

## Inventory Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| InventoryItem | A tracked inventory item | ItemId | Code, Name, Description, Category, UnitOfMeasure, ReorderLevel, CurrentStock |
| StockLevel | Stock at a location | StockId | ItemId, Location, Warehouse, Quantity, BatchNumber, ExpiryDate |
| StockMovement | A stock movement record | MovementId | Type (In/Out/Transfer), ReferenceNumber, SourceLocation, DestinationLocation, MovementDate, CreatedBy |

---

## Document Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| Document | A managed document | DocumentId | Title, Type, Category, OwnerId, Status, CreatedAt, UpdatedAt |
| DocumentVersion | A version of a document | VersionId | DocumentId, VersionNumber, FileName, FileSize, MimeType, StoragePath, UploadedBy, UploadedAt |
| DocumentTemplate | A document template | TemplateId | Name, Type, Category, FilePath, Version |

---

## ClientPortal Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| PortalUser | A client portal user | UserId | ContactId, Username, Email, LastLogin, IsActive, Preferences |
| ProjectAccess | Access grant to a project | AccessId | PortalUserId, ProjectId, GrantedAt, GrantedBy |

---

## Notification Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| Notification | A notification record | NotificationId | Type, Channel, Recipient, Subject, Body, Status, SentAt, ReadAt |
| NotificationTemplate | A notification template | TemplateId | Name, Channel, SubjectTemplate, BodyTemplate |
| UserNotificationPreference | User notification settings | PreferenceId | UserId, Channel, EventType, Enabled |

---

## Administration Context

| Entity | Description | Key Identity | Attributes |
|--------|-------------|-------------|------------|
| User | A system user | UserId | Username, Email, DisplayName, IsActive, LastLogin, CreatedAt |
| Role | A user role | RoleId | Name, Description, IsSystem |
| Permission | A system permission | PermissionId | Code, Name, Description, Resource, Action |
| AuditLogEntry | An audit log record | LogId | Timestamp, ActorId, Action, TargetType, TargetId, Details, IPAddress |
| SystemConfiguration | A system setting | ConfigId | Key, Value, Description, DataType, Category |
