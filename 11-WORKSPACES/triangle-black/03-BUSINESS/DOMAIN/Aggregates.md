# Aggregates

Aggregate design per bounded context. Each aggregate defines a consistency boundary within which business invariants are maintained.

---

## CRM Aggregates

### Lead
- **Root Entity:** `Lead`
- **Invariants:**
  - A lead must have at least a name and contact method
  - Lead status transitions are: New → Contacted → Qualified → Disqualified
  - A disqualified lead cannot be re-qualified without re-entry
- **Owns:** ContactInfo, LeadSource, LeadScore, Activity history
- **Consistency:** Lead score is updated atomically with status changes

### Account
- **Root Entity:** `Account`
- **Invariants:**
  - Account name must be unique
  - Account must have at least one contact
- **Owns:** Contacts, AccountDetails
- **Consistency:** Primary contact changes are atomic

### Opportunity
- **Root Entity:** `Opportunity`
- **Invariants:**
  - Opportunity must be linked to a qualified lead and an account
  - Stage transitions must follow defined pipeline order
  - Close date must be in the future
- **Owns:** OpportunityLineItems, StageHistory
- **Consistency:** Total opportunity value is recalculated when line items change

---

## Marketing Aggregates

### Campaign
- **Root Entity:** `Campaign`
- **Invariants:**
  - Campaign must have a defined start and end date
  - End date must be after start date
- **Owns:** CampaignSegments, CampaignResponses
- **Consistency:** Campaign status auto-updates based on dates

### Segment
- **Root Entity:** `Segment`
- **Invariants:**
  - Segment criteria must produce a non-empty set
- **Owns:** SegmentCriteria
- **Consistency:** Segment membership is recalculated on criteria change

---

## Quotation Aggregates

### Quotation
- **Root Entity:** `Quotation`
- **Invariants:**
  - Quotation must have at least one line item
  - Total must equal sum of line item totals
  - Margin must be within approved thresholds
  - Quotation cannot be sent without all required approvals
- **Owns:** QuotationLineItems, CommercialTerms, RevisionHistory
- **Consistency:** Total, margin, and tax recalculated on any line item change

### PriceBook
- **Root Entity:** `PriceBookEntry`
- **Invariants:**
  - Price book entries must have a valid effective date range
  - Two entries for the same item cannot have overlapping effective dates
- **Owns:** Pricing rules
- **Consistency:** Price changes are versioned and effective-dated

---

## Contract Aggregates

### Contract
- **Root Entity:** `Contract`
- **Invariants:**
  - Contract must reference a signed quotation or RFQ
  - Contract value must match accepted quotation
  - Contract cannot be signed without all approval signatures
  - Amendments must reference the original contract
- **Owns:** ContractClauses, CommercialTerms, PaymentMilestones, Amendments, Signatures
- **Consistency:** Total contract value is recalculated when amendments are added

---

## Project Aggregates

### Project
- **Root Entity:** `Project`
- **Invariants:**
  - Project must have a defined start and end date
  - End date must be after start date
  - Project cannot exceed budget without approved change order
  - Resource utilization cannot exceed 100% per resource per day
- **Owns:** ProjectPhases, Milestones, Tasks, ResourceAssignments, Issues, Risks
- **Consistency:** Budget consumed tracked against approved budget

### ChangeOrder
- **Root Entity:** `ChangeOrder`
- **Invariants:**
  - Change order must reference a project
  - Impact on budget and timeline must be quantified
  - Must be approved before execution
- **Owns:** ChangeOrderLineItems
- **Consistency:** Approved change orders update project budget and timeline

### SiteSurvey
- **Root Entity:** `SiteSurvey`
- **Invariants:**
  - Site survey must be scheduled for a valid date
  - Report must be submitted within 5 business days of inspection
- **Owns:** ConditionReports, PhotoEvidence
- **Consistency:** Survey status transitions: Scheduled → InProgress → Completed

### EngineeringAssessment
- **Root Entity:** `EngineeringAssessment`
- **Invariants:**
  - Assessment must reference a site survey
  - Technical specifications must be reviewed and approved
- **Owns:** SystemEvaluations, TechnicalSpecifications, DesignDrawings
- **Consistency:** Assessment cannot be finalized without all system evaluations complete

---

## Procurement Aggregates

### ProcurementRequest
- **Root Entity:** `ProcurementRequest`
- **Invariants:**
  - Request must specify item, quantity, and required delivery date
  - Total estimated value must be within requestor's approval limit
  - Request cannot be approved after required delivery date
- **Owns:** RequestLineItems, ApprovalHistory
- **Consistency:** Approval status determined by approval chain

### Vendor
- **Root Entity:** `Vendor`
- **Invariants:**
  - Vendor must have unique registration number
  - Vendor must have valid tax and business licenses
  - Vendor status determines eligibility for purchase orders
- **Owns:** VendorContacts, VendorCategories, EvaluationScores
- **Consistency:** Vendor status changes require admin approval

### PurchaseOrder
- **Root Entity:** `PurchaseOrder`
- **Invariants:**
  - PO must reference an approved procurement request or RFQ
  - Total PO value must not exceed approved budget
  - PO cannot be issued to a suspended vendor
  - Goods receipt cannot exceed PO quantity
- **Owns:** POLineItems, DeliverySchedule, PaymentTerms
- **Consistency:** Received quantity tracked against ordered quantity

### RFQ
- **Root Entity:** `RFQ`
- **Invariants:**
  - RFQ must have a response deadline
  - At least 3 vendors should be invited (policy)
  - Responses received after deadline are not considered
- **Owns:** RFQLineItems, VendorResponses, EvaluationMatrix
- **Consistency:** Award decision closes RFQ to new responses

---

## Inventory Aggregates

### InventoryItem
- **Root Entity:** `InventoryItem`
- **Invariants:**
  - Stock level cannot go negative
  - Reorder point triggers notification when stock falls below threshold
- **Owns:** StockLevels, BatchInfo, Location
- **Consistency:** Stock level is updated atomically with each movement

### StockMovement
- **Root Entity:** `StockMovement`
- **Invariants:**
  - Movement quantity must be positive
  - Source location stock must be sufficient for outbound movements
- **Owns:** MovementLineItems
- **Consistency:** Stock levels updated atomically when movement is confirmed

---

## Document Aggregates

### Document
- **Root Entity:** `Document`
- **Invariants:**
  - Document must have a unique identifier in the repository
  - Version numbers are sequential and never reset
- **Owns:** DocumentVersions, DocumentMetadata, SharingPermissions
- **Consistency:** Only the latest version is editable

---

## ClientPortal Aggregates

### PortalUser
- **Root Entity:** `PortalUser`
- **Invariants:**
  - Portal user must be linked to an existing CRM contact
  - Each contact can have only one portal user
- **Owns:** PortalPreferences, ProjectAccess
- **Consistency:** Portal access is revoked if the underlying contact is deactivated

---

## Administration Aggregates

### User
- **Root Entity:** `User`
- **Invariants:**
  - Username must be unique
  - Email must be unique
  - User must have at least one role
- **Owns:** UserRoles, UserPreferences
- **Consistency:** Permissions are inherited from assigned roles

### Role
- **Root Entity:** `Role`
- **Invariants:**
  - Role name must be unique
  - Role must have at least one permission
- **Owns:** PermissionAssignments
- **Consistency:** Role changes affect all users with that role

### AuditLog
- **Root Entity:** `AuditLogEntry`
- **Invariants:**
  - Every entry must have a timestamp, actor, action, and target
  - Logs are append-only and cannot be deleted
- **Owns:** Entry details
- **Consistency:** Log entries are immutable once written
