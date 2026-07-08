# Bounded Contexts

All bounded contexts with definitions, responsibilities, boundaries, and relationships.

---

## 1. CRM (Core Subdomain)

**Responsibility:** Manage leads, contacts, accounts, opportunities, and client interactions throughout the sales lifecycle.

**Boundaries:**
- Owns client and lead data
- Owns the sales pipeline and opportunity stages
- Manages activities, meetings, calls, and follow-ups
- Does NOT own marketing campaigns or lead scoring (delegated to Marketing)
- Does NOT own pricing or quotations (delegated to Quotation)

**Events Emitted:**
- `LeadQualified`
- `OpportunityCreated`
- `OpportunityStageChanged`
- `ClientContactUpdated`

**Events Consumed:**
- `CampaignResponseReceived` (from Marketing)
- `LeadScoreUpdated` (from Marketing)

---

## 2. Marketing (Supporting Subdomain)

**Responsibility:** Plan and execute marketing campaigns, manage audience segments, and score leads.

**Boundaries:**
- Owns campaign definitions and execution
- Owns segment and audience definitions
- Owns lead scoring models and results
- Does NOT own lead records (shared from CRM)
- Does NOT own the sales pipeline

**Events Emitted:**
- `CampaignLaunched`
- `CampaignResponseReceived`
- `LeadScoreUpdated`

**Events Consumed:**
- `LeadCreated` (from CRM)
- `LeadQualified` (from CRM)

---

## 3. Quotation (Core Subdomain)

**Responsibility:** Create, manage, and deliver pricing quotations for engineering services and projects.

**Boundaries:**
- Owns pricing models, rate cards, and cost data
- Owns quotation documents and revision history
- Owns margin calculations
- Does NOT own contracts (delegated to Contract)
- Does NOT own client relationships (delegated to CRM)

**Events Emitted:**
- `QuotationCreated`
- `QuotationSent`
- `QuotationAccepted`
- `QuotationRejected`

**Events Consumed:**
- `OpportunityCreated` (from CRM)
- `SiteSurveyCompleted` (from Site Survey within Project)

---

## 4. Contract (Core Subdomain)

**Responsibility:** Manage the full contract lifecycle including drafting, negotiation, approval, execution, amendments, and renewals.

**Boundaries:**
- Owns contract documents and clauses
- Owns contract approval workflow
- Owns contract amendments and addenda
- Owns commercial terms and payment schedules
- Does NOT own project execution (delegated to Project)
- Does NOT own quotations (delegated to Quotation)

**Events Emitted:**
- `ContractDrafted`
- `ContractSigned`
- `ContractAmended`
- `ContractTerminated`

**Events Consumed:**
- `QuotationAccepted` (from Quotation)
- `ProjectCompleted` (from Project)

---

## 5. Project (Core Subdomain)

**Responsibility:** Plan, execute, monitor, and close out engineering projects for hotel clients.

**Boundaries:**
- Owns project plans, schedules, and budgets
- Owns resource assignments
- Owns issues, risks, and change orders
- Owns site surveys, engineering assessments, and technical designs
- Does NOT own procurement (delegated to Procurement)
- Does NOT own quality control (delegated to QA/QC within Project)
- Does NOT own handover (delegated to Handover)

**Events Emitted:**
- `ProjectKickedOff`
- `ProjectMilestoneReached`
- `ChangeOrderCreated`
- `ProjectCompleted`
- `SiteSurveyCompleted`
- `AssessmentCompleted`

**Events Consumed:**
- `ContractSigned` (from Contract)
- `GoodsReceived` (from Procurement)

---

## 6. Procurement (Supporting Subdomain)

**Responsibility:** Manage the procurement lifecycle: requisition, approval, RFQ, vendor selection, purchase orders, goods receipt, and vendor payment.

**Boundaries:**
- Owns procurement requests and approvals
- Owns vendor registration and evaluation
- Owns RFQ creation and response management
- Owns purchase orders
- Owns goods receipt
- Does NOT own inventory management (delegated to Inventory)
- Does NOT own logistics (delegated to Supply)

**Events Emitted:**
- `RequisitionApproved`
- `RFQIssued`
- `VendorSelected`
- `PurchaseOrderIssued`
- `GoodsReceived`

**Events Consumed:**
- `ProjectKickedOff` (from Project)
- `MaterialRequestCreated` (from Project)

---

## 7. Document (Generic Subdomain)

**Responsibility:** Provide centralized document storage, versioning, access control, and template management for all bounded contexts.

**Boundaries:**
- Owns document storage and retrieval
- Owns document version history
- Owns document permissions
- Owns document templates
- Does NOT own document content or business meaning

**Events Emitted:**
- `DocumentUploaded`
- `DocumentVersionCreated`
- `DocumentShared`

**Events Consumed:**
- (All contexts can request document operations via service calls)

---

## 8. ClientPortal (Supporting Subdomain)

**Responsibility:** Provide clients with self-service access to project information, documents, and communication.

**Boundaries:**
- Owns client-facing user interface
- Owns client authentication and authorization
- Owns document sharing with clients
- Does NOT own core business data (reads from other contexts)

**Events Emitted:**
- `ClientPortalUserCreated`
- `DocumentAccessedByClient`

**Events Consumed:**
- `ContractSigned` (from Contract)
- `ProjectMilestoneReached` (from Project)
- `DocumentUploaded` (from Document)

---

## 9. Dashboard (Generic Subdomain)

**Responsibility:** Aggregate and display KPIs, metrics, and reports from across the ecosystem.

**Boundaries:**
- Owns dashboard configurations
- Owns report definitions and schedules
- Owns alert thresholds
- Does NOT own source data (reads from all contexts)

**Events Emitted:**
- `AlertTriggered`

**Events Consumed:**
- (Reads data from all contexts via queries)

---

## 10. Notification (Generic Subdomain)

**Responsibility:** Deliver notifications across multiple channels (email, SMS, in-app) based on events and preferences.

**Boundaries:**
- Owns notification templates
- Owns delivery channels
- Owns user notification preferences
- Does NOT own business events (receives from all contexts)

**Events Emitted:**
- `NotificationSent`

**Events Consumed:**
- (Consumes events from all contexts to trigger notifications)

---

## 11. Administration (Supporting Subdomain)

**Responsibility:** Manage system users, roles, permissions, configurations, and audit logging.

**Boundaries:**
- Owns user accounts and authentication
- Owns role definitions and permission assignments
- Owns audit logs
- Owns system configuration parameters
- Does NOT own business data

**Events Emitted:**
- `UserCreated`
- `UserRoleChanged`
- `SystemConfigurationChanged`

**Events Consumed:**
- (Responds to admin requests from all contexts)
