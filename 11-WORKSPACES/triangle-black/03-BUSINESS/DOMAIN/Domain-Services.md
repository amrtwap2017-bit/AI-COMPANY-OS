# Domain Services

Stateless domain services that encapsulate business logic that does not naturally fit within an Entity or Value Object.

---

## CRM Domain Services

### LeadScoringService
- **Responsibility:** Calculate lead score based on demographic fit, engagement, and behavioral data
- **Input:** Lead data, Interaction history, Campaign responses
- **Output:** LeadScore value object
- **Dependencies:** Marketing (scoring model), CRM (lead data)

### LeadDeduplicationService
- **Responsibility:** Detect and merge duplicate leads based on email, phone, or company name
- **Input:** New or updated Lead
- **Output:** Duplicate detection result (merge candidate or unique)
- **Dependencies:** CRM (lead repository)

### PipelineProgressionService
- **Responsibility:** Enforce stage transition rules and calculate probability changes
- **Input:** Opportunity, TargetStage
- **Output:** Validated stage transition result
- **Dependencies:** CRM (opportunity repository), Policies

---

## Marketing Domain Services

### CampaignROIService
- **Responsibility:** Calculate return on investment for marketing campaigns
- **Input:** Campaign costs, Attributed revenue
- **Output:** ROI percentage, Cost-per-lead, Revenue-per-lead
- **Dependencies:** Marketing (campaign data), CRM (opportunity data)

### SegmentMembershipService
- **Responsibility:** Evaluate and recalculate segment membership when criteria change
- **Input:** Segment, Lead/Contact data
- **Output:** Updated member list
- **Dependencies:** Marketing (segment repository), CRM (lead repository)

---

## Quotation Domain Services

### QuotationPricingService
- **Responsibility:** Calculate total, margin, and tax for a quotation based on line items and pricing rules
- **Input:** Quotation line items, Price book
- **Output:** Calculated totals, margin, tax
- **Dependencies:** Quotation (price book), Policies (discount/margin rules)

### MarginAnalysisService
- **Responsibility:** Analyze and validate margin across quotation line items, flagging items below threshold
- **Input:** Quotation, Approved margin thresholds
- **Output:** Margin report with warnings/approvals needed
- **Dependencies:** Quotation, Policies

### QuotationApprovalRoutingService
- **Responsibility:** Determine the required approval chain based on quotation value, margin, and discount
- **Input:** Quotation, User submitting
- **Output:** Approval route (manager/director/CEO)
- **Dependencies:** Policies

---

## Contract Domain Services

### ContractApprovalRoutingService
- **Responsibility:** Determine approval chain for contract execution based on contract value and risk
- **Input:** Contract, Signing parties
- **Output:** Approval route
- **Dependencies:** Policies

### ContractClauseService
- **Responsibility:** Manage standard clause library, versioning, and clause selection for contract drafting
- **Input:** Contract type, Selected clauses
- **Output:** Compiled contract document
- **Dependencies:** Document (templates), Contract (clause repository)

### ContractComplianceService
- **Responsibility:** Validate contract terms against regulatory requirements and company policies
- **Input:** Contract draft
- **Output:** Compliance check result (pass/fail with details)
- **Dependencies:** Policies, External regulatory data

---

## Project Domain Services

### ProjectBudgetTrackingService
- **Responsibility:** Track budget consumption against approved budget, including committed and actual costs
- **Input:** Project budget, Purchase orders, Resource costs, Change orders
- **Output:** Budget utilization report
- **Dependencies:** Project, Procurement, Accounting

### ResourceAvailabilityService
- **Responsibility:** Check resource availability and detect overallocation across projects
- **Input:** Resource, DateRange, Requested allocation
- **Output:** Availability status, Conflicts
- **Dependencies:** Project (resource assignments), HR

### ScheduleImpactAnalysisService
- **Responsibility:** Analyze the impact of changes, delays, or issues on the project schedule
- **Input:** Project schedule, Change event
- **Output:** Impacted milestones, Critical path analysis
- **Dependencies:** Project (schedule)

### SiteSurveySchedulingService
- **Responsibility:** Schedule site surveys based on location, resource availability, and client preferences
- **Input:** Project, Client availability, Surveyor availability
- **Output:** Scheduled survey with confirmed date/time
- **Dependencies:** Project, CRM (client contacts)

---

## Procurement Domain Services

### VendorEvaluationService
- **Responsibility:** Evaluate vendor responses against criteria matrix and calculate weighted scores
- **Input:** RFQ responses, Evaluation criteria
- **Output:** Ranked vendor list with scores
- **Dependencies:** Procurement (RFQ, vendors)

### PurchaseOrderBudgetCheckService
- **Responsibility:** Validate PO total against remaining project budget before issuance
- **Input:** PurchaseOrder, ProjectBudget
- **Output:** Budget check result (sufficient/insufficient)
- **Dependencies:** Procurement, Project

### ProcurementApprovalRoutingService
- **Responsibility:** Determine approval chain for procurement requests and purchase orders
- **Input:** Request/PO value, Category
- **Output:** Approval route
- **Dependencies:** Policies

---

## Inventory Domain Services

### ReorderCalculationService
- **Responsibility:** Calculate reorder quantities based on current stock, reorder point, lead time, and average consumption
- **Input:** InventoryItem, Usage history
- **Output:** Reorder recommendation (quantity, suggested supplier)
- **Dependencies:** Inventory, Procurement (vendor lead times)

### StockValuationService
- **Responsibility:** Calculate the value of current inventory using FIFO or weighted average method
- **Input:** Inventory items, Stock levels, Cost data
- **Output:** Total inventory valuation
- **Dependencies:** Inventory, Procurement

---

## Notification Domain Services

### NotificationDispatchService
- **Responsibility:** Route notifications to appropriate channels based on user preferences and urgency
- **Input:** Notification event, Recipient, Content
- **Output:** Dispatched notification (one or more channels)
- **Dependencies:** Notification (templates, preferences), External email/SMS providers

---

## Administration Domain Services

### AuthorizationService
- **Responsibility:** Evaluate whether a user has permission to perform a specific action on a resource
- **Input:** User, Action, Resource, Context
- **Output:** Authorization decision (grant/deny)
- **Dependencies:** Administration (roles, permissions)

### AuditService
- **Responsibility:** Record audit log entries for system events and business actions
- **Input:** Actor, Action, Target type, Target ID, Details
- **Output:** Persisted audit log entry
- **Dependencies:** Administration (audit log repository)
